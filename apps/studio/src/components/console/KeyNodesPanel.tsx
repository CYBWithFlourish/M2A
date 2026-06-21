import { useWorkflow } from "@/lib/workflow-context";
import { NodeCard } from "@/components/editor/NodeCard";

export function KeyNodesPanel({ config }: { config: any }) {
  const { nodes } = useWorkflow();
  const keyNodes = nodes.filter(n => n.type === 'agent').slice(0, 5);
  return (
    <div className="space-y-1.5">
      {keyNodes.map(n => <NodeCard key={n.id} node={n} compact />)}
      {keyNodes.length === 0 && <span className="text-xs text-muted-foreground">No agent nodes in workflow</span>}
    </div>
  );
}
