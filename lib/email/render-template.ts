import {
  cslLocationForRoomLabel,
  interviewRoomEmailLabel,
} from "@/lib/group-interview/sessions";
import type { EmailRecipient } from "./types";

export type TemplateVars = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  room: string;
  roomLabel: string;
  location: string;
  timeBlock: string;
  scheduleDate: string;
  roundLabel: string;
};

export function varsFromRecipient(
  recipient: EmailRecipient,
  roundLabel: string,
): TemplateVars {
  return {
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    fullName: `${recipient.firstName} ${recipient.lastName}`.trim(),
    email: recipient.email,
    room: recipient.room ?? "—",
    roomLabel: interviewRoomEmailLabel(recipient.room),
    location: cslLocationForRoomLabel(recipient.room),
    timeBlock: recipient.timeBlock ?? "—",
    scheduleDate: recipient.scheduleDate ?? "—",
    roundLabel,
  };
}

/** Replace {{key}} placeholders in subject/body. */
export function renderTemplateString(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key as keyof TemplateVars];
    return value !== undefined ? String(value) : "";
  });
}
