import { db } from '../db.js';
import { workflowParser, platformAccountId, platformDelegateKey } from './components.js';

export class WorkflowScheduler {
  private interval: NodeJS.Timeout | null = null;

  start() {
    console.log('[Scheduler] Starting workflow scheduler (60s interval)');
    this.interval = setInterval(() => this.tick(), 60_000);
    this.tick();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async tick() {
    try {
      const result = await db.query(
        `SELECT ws.* FROM workflow_schedules ws 
         JOIN workflows w ON w.id = ws.workflow_id 
         WHERE ws.enabled = true AND w.deployed = true`
      );

      for (const row of result.rows) {
        const workflow = await db.getWorkflow(row.workflow_id);
        if (!workflow) continue;

        const now = Date.now();
        const lastRun = row.last_run_at ? new Date(row.last_run_at).getTime() : 0;
        const intervalMs = this.parseCronInterval(row.cron_expression);

        if (now - lastRun >= intervalMs) {
          console.log(`[Scheduler] Executing scheduled workflow: ${workflow.name}`);

          const userContext = {
            accountId: platformAccountId,
            delegateKey: platformDelegateKey,
            agentWallet: null,
          };

          workflowParser.execute(workflow, 'Scheduled execution', userContext as any)
            .then(() => db.query(
              'UPDATE workflow_schedules SET last_run_at = CURRENT_TIMESTAMP WHERE workflow_id = $1',
              [row.workflow_id]
            ))
            .catch(err => console.error(`[Scheduler] Workflow ${row.workflow_id} failed:`, err));
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err);
    }
  }

  private parseCronInterval(expr: string): number {
    if (expr.includes('* * * * *')) return 60_000;
    if (expr.includes('*/5')) return 5 * 60_000;
    if (expr.includes('*/15')) return 15 * 60_000;
    if (expr.includes('*/30')) return 30 * 60_000;
    if (expr.includes('0 * * * *')) return 60 * 60_000;
    return 60 * 60_000;
  }
}

export const scheduler = new WorkflowScheduler();
