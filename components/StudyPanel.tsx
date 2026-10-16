import { ChatPanel } from "@/components/ChatPanel";
import { VoiceControl } from "@/components/VoiceControl";

export function StudyPanel() {
  return (
    <div data-study-panel className="flex h-full flex-col">
      <div className="border-b bg-card px-4 py-3.5">
        <h2 className="font-heading text-xl leading-none italic">Study Assistant</h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Ask below — it&apos;s unlimited. Or start a voice call with the tutor.
        </p>
      </div>
      <div className="border-b bg-gradient-to-b from-accent/25 to-transparent p-3">
        <VoiceControl />
      </div>
      <div className="min-h-0 flex-1">
        <ChatPanel />
      </div>
    </div>
  );
}
