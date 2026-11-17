
type TenantHeaderProps = {
  title: string;
};

export default function TenantHeader({
  title,
}: TenantHeaderProps) {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
      <div>
        <p className="text-xs text-slate-400">
          Yönetim Paneli / {title}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#172e26]">
          {title}
        </h2>
      </div>

      <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 sm:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Şirket Hesabı
      </div>
    </header>
  );
}
