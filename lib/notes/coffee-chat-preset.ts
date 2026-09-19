/** Short date like 9/21/26 for coffee chat note titles. */
export function formatCoffeeChatNoteDate(d = new Date()): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = String(d.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

export function buildCoffeeChatNoteDraft(officerName: string, when = new Date()) {
  const date = formatCoffeeChatNoteDate(when);
  const name = officerName.trim() || "Officer";
  const title = `${date} ${name} Coffee Chat Notes`;
  const bodyHtml = [
    "<p><strong>Date &amp; time:</strong> </p>",
    "<p><br></p>",
    "<p><strong>Initial impressions:</strong> </p>",
    "<p><br></p>",
    "<p><strong>Strengths:</strong> </p>",
    "<p><br></p>",
    "<p><strong>Concerns/follow-ups:</strong> </p>",
    "<p><br></p>",
    "<p><strong>Overall impression:</strong> </p>",
    "<p><br></p>",
    "<p><strong>Recommend for Round 1? (Y/N)</strong> </p>",
  ].join("");
  return { title, bodyHtml };
}
