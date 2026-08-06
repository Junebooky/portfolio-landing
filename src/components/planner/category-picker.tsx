"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/planner/constants";
import type { TaskCategory } from "@/lib/planner/types";

type CategoryPickerProps = {
  ariaLabel: string;
  disabled?: boolean;
  onChange: (category: TaskCategory) => void;
  size?: "compact" | "field";
  value: TaskCategory;
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
};

const categoryDotStyles: Record<TaskCategory, string> = {
  work: "bg-blue-500",
  personal: "bg-emerald-500",
  other: "bg-slate-400",
};

export function CategoryPicker({
  ariaLabel,
  disabled = false,
  onChange,
  size = "compact",
  value,
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const positionMenu = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = Math.max(152, rect.width);
    const estimatedHeight = 148;
    const viewportPadding = 8;
    const fitsBelow = window.innerHeight - rect.bottom >= estimatedHeight + 8;
    const top = fitsBelow
      ? rect.bottom + 6
      : Math.max(viewportPadding, rect.top - estimatedHeight - 6);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    );

    setMenuPosition({ left, top, width });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handleViewportChange = () => positionMenu();

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, positionMenu]);

  function toggleMenu() {
    if (disabled) return;
    if (!isOpen) positionMenu();
    setIsOpen((current) => !current);
  }

  function selectCategory(category: TaskCategory) {
    onChange(category);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  const isField = size === "field";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        className={`inline-flex items-center justify-between gap-2 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${
          isField
            ? "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
            : "h-8 min-w-[76px] rounded-md bg-white px-2 text-xs font-extrabold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/5"
        }`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${categoryDotStyles[value]}`}
          />
          <span className="truncate">{CATEGORY_LABELS[value]}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="listbox"
              aria-label={ariaLabel}
              style={menuPosition}
              className="fixed z-[120] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-slate-900"
            >
              {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={category === value}
                    onClick={() => selectCategory(category)}
                    className={`flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm font-bold transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-white/8 dark:focus:bg-white/8 ${
                      category === value
                        ? "text-blue-700 dark:text-blue-200"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${categoryDotStyles[category]}`}
                      />
                      {CATEGORY_LABELS[category]}
                    </span>
                    {category === value ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                  </button>
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
