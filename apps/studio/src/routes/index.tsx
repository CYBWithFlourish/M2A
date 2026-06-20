import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EditorHeader } from "@/components/editor/Header";
import { EditorSidebar } from "@/components/editor/Sidebar";
import { EditorCanvas } from "@/components/editor/Canvas";
import { Inspector } from "@/components/editor/Inspector";
import { BottomPanel } from "@/components/editor/BottomPanel";
import { ActionPalette } from "@/components/editor/ActionPalette";
import { TemplateMarketplace, CreateAgentDialog, TopUpDialog, WalletDialog } from "@/components/editor/Modals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workflow Editor — Buiry M2A Studio" },
      { name: "description", content: "Build AI agent and DeFi automation workflows visually on Sui." },
    ],
  }),
  component: WorkflowEditor,
});

function WorkflowEditor() {
  const [palette, setPalette] = useState(false);
  const [templates, setTemplates] = useState(false);
  const [createAgent, setCreateAgent] = useState(false);
  const [topUp, setTopUp] = useState(false);
  const [wallet, setWallet] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <EditorHeader
        onCreateAgent={() => setCreateAgent(true)}
        onTopUp={() => setTopUp(true)}
        onTemplates={() => setTemplates(true)}
        onConnectWallet={() => setWallet(true)}
      />
      <div className="flex min-h-0 flex-1">
        <EditorSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <EditorCanvas onOpenPalette={() => setPalette(true)} />
          <BottomPanel />
        </div>
        <Inspector />
      </div>

      <ActionPalette open={palette} onClose={() => setPalette(false)} />
      <TemplateMarketplace open={templates} onClose={() => setTemplates(false)} />
      <CreateAgentDialog open={createAgent} onClose={() => setCreateAgent(false)} />
      <TopUpDialog open={topUp} onClose={() => setTopUp(false)} />
      <WalletDialog open={wallet} onClose={() => setWallet(false)} />
    </div>
  );
}
