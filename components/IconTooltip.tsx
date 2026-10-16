"use client";

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Wraps any icon control (a plain button, or a whole Popover/Dialog trigger
// tree) in a hover tooltip without needing to merge trigger behaviors onto
// the same DOM node — the tooltip just watches hover on this wrapping span,
// independent of whatever click behavior lives inside it.
export function IconTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
