import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type UpcomingPolicy = {
  id: string;
  carrier: string;
  product_type: string;
  status: string;
  renewal_date: string;
  expected_commission_amount: number | null;
  people: { first_name: string; last_name: string } | null;
  households: { name: string } | null;
};

const productTypeLabel: Record<string, string> = {
  medicare_advantage:  "Medicare Advantage",
  medicare_supplement: "Medicare Supplement",
  pdp:                 "Part D",
  life:                "Life",
  health:              "Health",
  dental:              "Dental",
  ancillary:           "Ancillary",
};

const statusStyle: Record<string, string> = {
  active:     "bg-emerald-50 text-emerald-700",
  pending:    "bg-amber-50 text-amber-700",
  lapsed:     "bg-red-50 text-red-700",
  terminated: "bg-slate-100 text-slate-500",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  const [
    { count: policyCount,   error: e1 },
    { count: householdCount, error: e2 },
    { count: renewalCount,  error: e3 },
    { data: commissionRows, error: e4 },
    { data: upcoming,       error: e5 },
  ] = await Promise.all([
    supabase
      .from("policies")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "pending"]),

    supabase
      .from("households")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("policies")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "pending"])
      .not("renewal_date", "is", null),

    supabase
      .from("policies")
      .select("expected_commission_amount")
      .in("status", ["active", "pending"]),

    supabase
      .from("policies")
      .select(`
        id,
        carrier,
        product_type,
        status,
        renewal_date,
        expected_commission_amount,
        people ( first_name, last_name ),
        households ( name )
      `)
      .in("status", ["active", "pending"])
      .not("renewal_date", "is", null)
      .order("renewal_date", { ascending: true })
      .limit(10)
      .returns<UpcomingPolicy[]>(),
  ]);

  const firstError = e1 ?? e2 ?? e3 ?? e4 ?? e5;
  if (firstError) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load dashboard: {firstError.message}
      </div>
    );
  }

  const totalCommission = (commissionRows ?? []).reduce(
    (sum, row) => sum + (row.expected_commission_amount ?? 0),
    0
  );

  const kpis = [
    { label: "Policies",              value: String(policyCount    ?? 0), href: "/policies"  },
    { label: "Households",            value: String(householdCount ?? 0), href: "/households" },
    { label: "Policies with Renewal", value: String(renewalCount   ?? 0), href: "/renewals"  },
    { label: "Est. Commission",        value: formatCurrency(totalCommission), href: "/policies" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* Upcoming renewals */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Upcoming Renewals
          </h2>
          <Link
            href="/renewals"
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            View all →
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Renewal Date</th>
                <th className="px-4 py-3">Household</th>
                <th className="px-4 py-3">Policyholder</th>
                <th className="px-4 py-3">Carrier</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Est. Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(upcoming ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No upcoming renewals.
                  </td>
                </tr>
              ) : (
                (upcoming ?? []).map((row) => {
                  const holder = row.people
                    ? `${row.people.first_name} ${row.people.last_name}`
                    : "—";
                  const badge =
                    statusStyle[row.status] ?? "bg-slate-100 text-slate-500";
                  return (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium tabular-nums text-slate-900">
                        {formatDate(row.renewal_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.households?.name ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{holder}</td>
                      <td className="px-4 py-3 text-slate-600">{row.carrier}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {productTypeLabel[row.product_type] ?? row.product_type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {row.expected_commission_amount !== null
                          ? formatCurrency(row.expected_commission_amount)
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
