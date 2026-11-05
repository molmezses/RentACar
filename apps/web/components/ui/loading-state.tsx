type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({
  message = "Yükleniyor...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"
      />

      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}