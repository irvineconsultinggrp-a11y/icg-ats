"use client";

import { useEffect, useRef } from "react";

type ToolbarItem = {
  key: string;
  label: string;
  title: string;
  command: string;
  arg?: string;
};

const TOOLBAR: ToolbarItem[] = [
  { key: "b", label: "B", title: "Bold (Ctrl+B)", command: "bold" },
  { key: "i", label: "I", title: "Italic (Ctrl+I)", command: "italic" },
  { key: "u", label: "U", title: "Underline (Ctrl+U)", command: "underline" },
  { key: "h2", label: "H", title: "Heading", command: "formatBlock", arg: "H2" },
  { key: "ul", label: "• List", title: "Bulleted list", command: "insertUnorderedList" },
  { key: "ol", label: "1. List", title: "Numbered list", command: "insertOrderedList" },
  { key: "quote", label: "❝", title: "Quote", command: "formatBlock", arg: "BLOCKQUOTE" },
  { key: "clear", label: "Clear", title: "Clear formatting", command: "removeFormat" },
];

/**
 * Lightweight contentEditable rich-text editor with a small formatting toolbar.
 * Emits sanitized-on-server HTML via onChange. Paste is coerced to plain text so
 * arbitrary markup never enters the document.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  autoFocus = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync incoming value into the DOM only when it diverges (e.g. switching notes),
  // so typing doesn't reset the caret.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emit();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1 border border-[#e4e4e7] rounded-t-lg bg-[#fafafa] px-2 py-1.5 sticky top-0 z-10">
        {TOOLBAR.map((c) => (
          <button
            key={c.key}
            type="button"
            title={c.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(c.command, c.arg)}
            className="min-w-8 h-8 px-2 rounded text-sm font-medium text-[#374151] hover:bg-[#061c2a] hover:text-white transition-colors"
          >
            {c.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="rte-content flex-1 overflow-y-auto border border-t-0 border-[#e4e4e7] rounded-b-lg bg-white px-5 py-4 text-[15px] leading-relaxed text-[#111827] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
      />
      <style jsx global>{`
        .rte-content:empty:before {
          content: attr(data-placeholder);
          color: #a1a1aa;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
