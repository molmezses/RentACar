type EmptyStateProps = {
  title?: string;
  description: string;
};

export default function EmptyState({
  title = "Henüz veri bulunmuyor",
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div
        aria-hidden="true"
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500"
      >
        ♧
      </div>

      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}