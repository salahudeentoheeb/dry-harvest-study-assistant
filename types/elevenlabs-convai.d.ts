import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ElevenLabsConvaiElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  "agent-id"?: string;
  "signed-url"?: string;
  variant?: "compact" | "expanded";
  "avatar-image-url"?: string;
  "avatar-orb-color-1"?: string;
  "avatar-orb-color-2"?: string;
  "action-text"?: string;
  "start-call-text"?: string;
  "end-call-text"?: string;
  "listening-text"?: string;
  "speaking-text"?: string;
  "dynamic-variables"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": ElevenLabsConvaiElement;
    }
  }
}

export {};
