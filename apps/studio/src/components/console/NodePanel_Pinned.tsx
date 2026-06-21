import { useWorkflow } from "@/lib/workflow-context";
import { NodeCard } from "@/components/editor/NodeCard";

export function NodePanel_Pinned({ config }: { config: any }) {
  const { nodes } = useWorkflow();
  const node = nodes.find(n => n.id === config.nodeId);
  if (!node) return <span className="text-xs text-muted-foreground">Node not found</span>;
  return <NodeCard node={node} compact />;
}
