"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook providing robust WCAG 2.2 AA compliant modal focus management:
 * 1. Traps focus within modal dialog while open
 * 2. Closes dialog on 'Escape' key
 * 3. Restores focus back to the triggering element upon closure
 */
export function useModalFocus(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element before opening modal
    previousActiveElementRef.current =
      document.activeElement as HTMLElement | null;

    // Focus the first focusable control inside the modal
    const container = modalRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && container) {
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (
            document.activeElement === last ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === "function"
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return modalRef;
}
