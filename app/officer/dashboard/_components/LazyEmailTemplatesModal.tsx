"use client";

import dynamic from "next/dynamic";

export type { EmailTemplate } from "./EmailTemplatesModal";

export const LazyEmailTemplatesModal = dynamic(
  () =>
    import("./EmailTemplatesModal").then((mod) => ({
      default: mod.EmailTemplatesModal,
    })),
  { ssr: false },
);
