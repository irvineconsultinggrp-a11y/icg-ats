import {
  ALLOWED_RESUME_TYPES,
  MAX_RESUME_BYTES,
  sanitizeStorageFileName,
} from "@/lib/applicants/queries";
import { canEditApplication } from "@/lib/positions";
import type { ApplicantRow } from "@/lib/types/database";
import { createAdminClient } from "@/utils/supabase/admin";

const RESUME_BUCKET = "resumes";

export type ParsedApplicationForm = {
  position: string;
  firstName: string;
  lastName: string;
  email: string;
  gradYear: number | null;
  phone: string | null;
  majors: string | null;
  minors: string | null;
  careerGoals: string | null;
  linkedinUrl: string | null;
  commitments: string | null;
  infoSession: string | null;
  availableSlots: unknown;
  resumeFile: File | null;
};

export function nullIfEmpty(s: string): string | null {
  const t = s.trim();
  return t.length > 0 ? t : null;
}

export function parseApplicationFormData(formData: FormData): ParsedApplicationForm | { error: string } {
  const position = String(formData.get("position") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!position || !firstName || !lastName || !email) {
    return { error: "Missing required fields: position, firstName, lastName, email" };
  }

  const gradYearRaw = String(formData.get("gradYear") ?? "").trim();
  const gradYear =
    gradYearRaw.length > 0 ? Number.parseInt(gradYearRaw, 10) : null;
  if (gradYearRaw.length > 0 && !Number.isFinite(gradYear)) {
    return { error: "Invalid grad year" };
  }

  let availableSlots: unknown = [];
  const slotsRaw = String(formData.get("availableSlots") ?? "").trim();
  if (slotsRaw) {
    try {
      const parsed = JSON.parse(slotsRaw) as unknown;
      if (!Array.isArray(parsed)) {
        return { error: "availableSlots must be a JSON array" };
      }
      availableSlots = parsed;
    } catch {
      return { error: "Invalid availableSlots JSON" };
    }
  }

  const resumeEntry = formData.get("resume");
  let resumeFile: File | null = null;
  if (resumeEntry instanceof File && resumeEntry.size > 0) {
    if (resumeEntry.size > MAX_RESUME_BYTES) {
      return { error: "Resume file too large (max 10 MB)" };
    }
    if (!ALLOWED_RESUME_TYPES.has(resumeEntry.type)) {
      return { error: "Resume must be PDF or image (png, jpeg, gif, webp)" };
    }
    resumeFile = resumeEntry;
  }

  return {
    position,
    firstName,
    lastName,
    email,
    gradYear,
    phone: nullIfEmpty(String(formData.get("phone") ?? "")),
    majors: nullIfEmpty(String(formData.get("majors") ?? "")),
    minors: nullIfEmpty(String(formData.get("minors") ?? "")),
    careerGoals: nullIfEmpty(String(formData.get("careerGoals") ?? "")),
    linkedinUrl: nullIfEmpty(String(formData.get("linkedinUrl") ?? "")),
    commitments: nullIfEmpty(String(formData.get("commitments") ?? "")),
    infoSession: nullIfEmpty(String(formData.get("infoSession") ?? "")),
    availableSlots,
    resumeFile,
  };
}

export function formToRow(parsed: ParsedApplicationForm, userId: string) {
  return {
    user_id: userId,
    position: parsed.position,
    first_name: parsed.firstName,
    last_name: parsed.lastName,
    email: parsed.email,
    grad_year: parsed.gradYear,
    phone: parsed.phone,
    majors: parsed.majors,
    minors: parsed.minors,
    career_goals: parsed.careerGoals,
    linkedin_url: parsed.linkedinUrl,
    commitments: parsed.commitments,
    info_session: parsed.infoSession,
    available_slots: parsed.availableSlots,
  };
}

export async function uploadResumeForApplication(
  userId: string,
  applicationId: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  try {
    const admin = createAdminClient();
    const safeName = sanitizeStorageFileName(file.name);
    const objectPath = `${userId}/${applicationId}/${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(RESUME_BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });
    if (uploadError) {
      console.error("[resume upload]", uploadError);
      return { error: "Failed to upload resume" };
    }
    return { path: objectPath };
  } catch (e) {
    console.error("[resume upload admin]", e);
    return { error: "Server configuration error (service role?)" };
  }
}

export function assertCanEditPosition(positionId: string): string | null {
  if (!canEditApplication(positionId)) {
    return "The application deadline has passed. You can no longer edit this application.";
  }
  return null;
}

export function hydrateFormFromRow(row: ApplicantRow) {
  const slots = Array.isArray(row.available_slots)
    ? (row.available_slots as string[])
    : [];

  return {
    applicationId: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    gradYear: row.grad_year != null ? String(row.grad_year) : "",
    phone: row.phone ?? "",
    majors: row.majors ?? "",
    minors: row.minors ?? "",
    careerGoals: row.career_goals ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    commitments: row.commitments ?? "",
    infoSession: row.info_session ?? "",
    selectedSlots: new Set(slots),
    existingResumePath: row.resume_path,
  };
}
