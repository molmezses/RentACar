
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { TenantApplicationStatus } from "../../../../../types/tenant-application";
import ConfirmationDialog from "./confirmation-dialog";

type ApplicationActionsProps = {
  applicationId: string;
  companyName: string;
  status: TenantApplicationStatus;
};

type Action = "approve" | "reject";

export default function ApplicationActions({
  applicationId,
  companyName,
  status,
}: ApplicationActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Aynı anda birden fazla istek gönderilmesini engeller.
  const inFlight = useRef(false);

  // Kullanıcı ilk kez Onayla veya Reddet'e basınca çalışır.
  function openConfirmation(action: Action) {
    if (
    inFlight.current ||
    status !== "PENDING" ||
    success ||
    needsVerification
    ) {
        return;
    }

    setError("");
    setSelectedAction(action);
  }

  // Modalın Vazgeç butonuyla kapanmasını sağlar.
  function closeConfirmation() {
    if (inFlight.current) {
      return;
    }

    setSelectedAction(null);
  }

  // Kullanıcı modal içerisindeki onay butonuna basınca çalışır.
  async function handleConfirm() {
    if (
      inFlight.current ||
      status !== "PENDING" ||
      selectedAction === null
    ) {
      return;
    }

    const action = selectedAction;

    inFlight.current = true;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/tenant-applications/${encodeURIComponent(applicationId)}/${action}`,
        {
          method: "PATCH",
        },
      );

      const data: unknown = await response.json().catch(() => null);

      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "İşlem sonucu alınamadı.";

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          router.refresh();
          return;
        }

        if (response.status === 403) {
          setError("Bu işlemi gerçekleştirme yetkiniz bulunmuyor.");
          setNeedsVerification(true);
          return;
        }

        setError(message);
        setNeedsVerification(true);
        router.refresh();
        return;
      }


      setSuccess(message);
      router.refresh();
    } catch {
        setError(
        "Bağlantı hatası oluştu. İşlem gerçekleşmiş olabilir. Güncel başvuru durumunu kontrol edin.",
  );
  setNeedsVerification(true);
  router.refresh();
} finally {
      inFlight.current = false;
      setLoading(false);
      setSelectedAction(null);
    }
  }

  if (status !== "PENDING") {
    return (
      <div className="border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">
          Bu başvuru zaten işlenmiş. Yeni bir onaylama veya
          reddetme işlemi yapılamaz.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Başvuru işlemleri
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openConfirmation("approve")}
            disabled={loading || success !== "" || needsVerification}
            className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "İşleniyor..." : "Onayla"}
          </button>

          <button
            type="button"
            onClick={() => openConfirmation("reject")}
            disabled={loading || success !== "" || needsVerification}
            className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "İşleniyor..." : "Reddet"}
          </button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm text-green-700">
            {success}
          </p>
        )}
      </div>

      <ConfirmationDialog
        open={selectedAction !== null}
        action={selectedAction}
        companyName={companyName}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={closeConfirmation}
      />
    </>
  );
}
