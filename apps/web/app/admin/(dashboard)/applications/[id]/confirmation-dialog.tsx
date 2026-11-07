
"use client";

import { useEffect, useRef } from "react";

type ConfirmationDialogProps = {
  open: boolean;
  action: "approve" | "reject" | null;
  companyName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationDialog({
  open,
  action,
  companyName,
  loading,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();

    if (!loading) {
      onCancel();
    }
  }

  const isApprove = action === "approve";

  const title = isApprove
    ? "Başvuruyu onayla"
    : "Başvuruyu reddet";

  const description = isApprove
    ? "Bu başvuru onaylandığında yeni bir tenant oluşturulacak."
    : "Bu başvuru reddedildiğinde tekrar işleme alınamayacak.";

  const actionLabel = isApprove
    ? "Başvuruyu onayla"
    : "Başvuruyu reddet";

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-description"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="p-6 sm:p-8">
        {/* Üst bölüm */}
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isApprove
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isApprove ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="confirmation-title"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Devam etmeden önce işlem bilgilerini kontrol edin.
            </p>
          </div>
        </div>

        {/* Başvuru bilgileri */}
        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            İşlem yapılacak şirket
          </p>

          <p className="mt-2 break-words text-base font-semibold text-slate-900">
            {companyName}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Beklemede
            </span>

            <span aria-hidden="true" className="text-slate-400">
              →
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isApprove
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isApprove ? "Onaylandı" : "Reddedildi"}
            </span>
          </div>
        </div>

        {/* Açıklama */}
        <p
          id="confirmation-description"
          className="mt-5 text-sm leading-6 text-slate-600"
        >
          {description} Bu işlemi gerçekleştirmek istediğinizden emin misiniz?
        </p>

        {/* Butonlar */}
        <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600"
                : "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600"
            }`}
          >
            {loading && (
              <svg
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {loading ? "İşleniyor..." : actionLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
