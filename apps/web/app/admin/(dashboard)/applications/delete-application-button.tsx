"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type DeleteApplicationButtonProps = {
  applicationId: string;
  companyName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  tenantId: string | null;
};

export default function DeleteApplicationButton({
  applicationId,
  companyName,
  status,
  tenantId,
}: DeleteApplicationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inFlight = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const canDelete =
    (status === "PENDING" || status === "REJECTED") &&
    tenantId === null;

useEffect(() => {
  if (!isOpen) {
    return;
  }

  const dialog = dialogRef.current;

  if (!dialog) {
    return;
  }

  dialog.showModal();

  return () => {
    if (dialog.open) {
      dialog.close();
    }
  };
}, [isOpen]);

async function handleDelete() {
  if (inFlight.current || !canDelete) {
    return;
  }

  inFlight.current = true;
  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      `/api/admin/tenant-applications/${encodeURIComponent(applicationId)}`,
      {
        method: "DELETE",
      },
    );

    if (response.status === 401) {
      router.replace("/admin/login");
      router.refresh();
      return;
    }

    if (!response.ok) {
      if (response.status === 403) {
        setError("Bu işlemi gerçekleştirme yetkiniz bulunmuyor.");
      } else if (response.status === 404) {
        setError("Başvuru bulunamadı. Listeyi yenileyin.");
      } else if (response.status === 409) {
        setError("Bu başvuru artık silinemiyor. Durumu değişmiş olabilir.");
      } else {
        setError("Başvuru silinemedi. Lütfen tekrar deneyin.");
      }

      return;
    }

    setIsOpen(false);
    router.refresh();
  } catch {
    setError(
      "Bağlantı hatası oluştu. İşlem gerçekleşmiş olabilir. Listeyi yenileyerek kontrol edin.",
    );
  } finally {
    inFlight.current = false;
    setLoading(false);
  }
}

  if (!canDelete) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        Sil
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-labelledby={`delete-title-${applicationId}`}
          aria-describedby={`delete-description-${applicationId}`}
          aria-modal="true"
          onCancel={(event) => {
            if (inFlight.current) {
              event.preventDefault();
            }
          }}
          onClose={() => setIsOpen(false)}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border-0 bg-white p-6 text-left shadow-xl backdrop:bg-black/50"
        >
          <h2
            id={`delete-title-${applicationId}`}
            className="text-lg font-semibold text-slate-900"
          >
            Başvuruyu silmek istiyor musunuz?
          </h2>

          <p
            id={`delete-description-${applicationId}`}
            className="mt-3 text-sm leading-6 text-slate-600"
          >
            <strong>{companyName}</strong> şirketinin başvurusu
            kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Siliniyor..." : "Başvuruyu Sil"}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}