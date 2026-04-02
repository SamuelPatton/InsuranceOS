import { supabase } from "@/lib/supabase/client";

type Policy = {
  id: string;
  carrier: string;
  plan_name: string | null;
  product_type: string;
  status: string;
  renewal_date: string | null;
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
};

const statusStyle: Record<string, string> = {
  active:     "bg-emerald-50 text-emerald-700",
  pending:    "bg-amber-50 text-amber-700",
  lapsed:     "bg-red-50 text-red-700",
  terminated: "bg-slate-100 text-slate-500",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCommission(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function PoliciesPage() {
  const { data: policies, error } = await supabase
    .from("policies")
    .select(`
      id,
      carrier,
      plan_name,
      product_type,
      status,
      renewal_date,
      expected_commission_amount,
      people ( first_name, last_name ),
      households ( name )
    `)
    .order("renewal_date", { ascending: true })
    .returns<Policy[]>();

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load policies: {error.message}
      </div>
    );
  }

  const rows = policies ?? [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Policies</h1>
      <p className="mt-1 text-sm text-slate-500">
        {rows.length} polic{rows.length !== 1 ? "ies" : "y"}
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Policyholder</th>
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Renewal</th>
              <th className="px-4 py-3 text-right">Est. Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No policies yet.
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const holder = p.people
                  ? `${p.people.first_name} ${p.people.last_name}`
                  : "—";
                const badgeClass =
                  statusStyle[p.status] ?? "bg-slate-100 text-slate-500";
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {holder}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.households?.name ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.carrier}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.plan_name ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {productTypeLabel[p.product_type] ?? p.product_type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(p.renewal_date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCommission(p.expected_commission_amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
