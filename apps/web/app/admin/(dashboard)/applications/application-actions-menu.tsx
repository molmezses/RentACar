
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import DeleteApplicationButton from "./delete-application-button";

type ApplicationActionsMenuProps = {
  applicationId: string;
  companyName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  tenantId: string | null;
};

export default function ApplicationActionsMenu({
  applicationId,
  companyName,
  status,
  tenantId,
}: ApplicationActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuId = `application-actions-${applicationId}`;

  const canDelete =
    (status === "PENDING" || status === "REJECTED") &&
    tenantId === null;

  function toggleMenu() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      const menuWidth = 192;
      const menuHeight = canDelete ? 100 : 52;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove =
        spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8;

      setPosition({
        top: openAbove
          ? rect.top - menuHeight - 4
          : rect.bottom + 4,
        left: Math.max(
          8,
          Math.min(
            rect.right - menuWidth,
            window.innerWidth - menuWidth - 8,
          ),
        ),
      });
    }

    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    function handleScroll() {
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label={`${companyName} başvuru işlemleri`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ⋮
        </span>
      </button>

     {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
          }}
          className={`z-50 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg ${
            isOpen ? "" : "invisible pointer-events-none"
          }`}
        >
          <Link
            href={`/admin/applications/${encodeURIComponent(applicationId)}`}
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900"
          >
            Detayları Gör
          </Link>

          {canDelete && (
            <>
              <div className="my-1 border-t border-slate-100" />

              <DeleteApplicationButton
                applicationId={applicationId}
                companyName={companyName}
                status={status}
                tenantId={tenantId}
                variant="menu"
                onDialogClose={() => setIsOpen(false)}
              />
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}