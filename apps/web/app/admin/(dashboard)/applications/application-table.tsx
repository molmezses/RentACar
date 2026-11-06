
import Link from "next/link";

import type { TenantApplication } from "../../../../types/tenant-application";
import ApplicationStatusBadge from "./application-status-badge";

type ApplicationTableProps = {
  applications: TenantApplication[];
};

export default function ApplicationTable({
  applications,
}: ApplicationTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-medium text-slate-900">
          Başvuru Listesi
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Gösterilen başvuru sayısı: {applications.length}
        </p>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-4">
                Şirket
              </th>
              <th scope="col" className="px-5 py-4">
                İletişim
              </th>
              <th scope="col" className="px-5 py-4">
                Başvuru Tarihi
              </th>
              <th scope="col" className="px-5 py-4">
                Durum
              </th>
              <th scope="col" className="px-5 py-4 text-right">
                İşlem
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {applications.map((application) => (
              <tr
                key={application.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {application.companyName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {application.slug}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">
                    {application.contactName}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {application.contactEmail}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {application.contactPhone}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {new Date(application.createdAt).toLocaleDateString(
                    "tr-TR",
                    { timeZone: "Europe/Istanbul" },
                  )}
                </td>

                <td className="px-5 py-4">
                  <ApplicationStatusBadge
                    status={application.status}
                  />
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/applications/${encodeURIComponent(application.id)}`}
                    className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    Detayları Gör
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {applications.map((application) => (
          <article key={application.id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="break-words font-semibold text-slate-900">
                  {application.companyName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {application.contactName}
                </p>
              </div>

              <ApplicationStatusBadge status={application.status} />
            </div>

            <p className="break-all text-sm text-slate-600">
              {application.contactEmail}
            </p>

            <p className="text-sm text-slate-600">
              {application.contactPhone}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {new Date(application.createdAt).toLocaleDateString(
                  "tr-TR",
                  { timeZone: "Europe/Istanbul" },
                )}
              </span>

              <Link
                href={`/admin/applications/${encodeURIComponent(application.id)}`}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                Detayları Gör
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
