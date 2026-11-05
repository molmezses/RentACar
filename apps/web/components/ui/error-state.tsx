type ErrorStateProps = {
  title?: string;
  message: string;
};

export default function ErrorState({
  title = "Bir sorun oluştu",
  message,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700"
        >
          !
        </span>

        <div>
          <h2 className="text-base font-semibold text-red-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}