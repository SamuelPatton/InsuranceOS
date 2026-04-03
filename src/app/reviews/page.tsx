import { supabase } from "@/lib/supabase/client";

type ReviewRow = {
  id: string;
  carrier: string;
  plan_name: string | null;
  product_type: string;
  status: string;
  review_due_date: string;
  expected_commission_amount: number | null;
  people: { first_name: string; last_name: string } | null;
  households: { id: string; name: string } | null;
};

const productTypeLabel: Record<string, string> = {
  medicare_supplement: "Medicare Supplement",
  life:                "Life",
  dental:              "Dental",
  ancillary:           "Ancillary",
};

const statusStyle: Record<string, string> = {
  active:  "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
};

function formatDate(dateStr: string): string {
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

export default async function ReviewsPage() {
  const { data, error } = await supabase
    .from("policies")
    .select(`
      id,
      carrier,
      plan_name,
      product_type,
      status,
      review_due_date,
      expected_commission_amount,
      people ( first_name, last_name ),
      households ( id, name )
    `)
    .eq("renewal_behavior", "ongoing")
    .in("status", ["active", "pending"])
    .not("review_due_date", "is", null)
    .order("review_due_date", { ascending: true })
    .returns<ReviewRow[]>();

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load reviews: {error.message}
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Reviews</h1>
      <p className="mt-1 text-sm text-slate-500">
        {rows.length} polic{rows.length !== 1 ? "ies" : "y"} due for review ·
        sorted soonest first
      </p>
      <p className="mt-0.5 text-xs text-slate-400">
        Ongoing policies — Medigap, life, dental, and ancillary — that need
        periodic check-ins. Annual reselection products (Medicare Advantage,
        Part D, health) are tracked on the Renewals page instead.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Review Due</th>
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Policyholder</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Est. Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No policies due for review.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const holder = row.people
                  ? `${row.people.first_name} ${row.people.last_name}`
                  : "—";
                const badge =
                  statusStyle[row.status] ?? "bg-slate-100 text-slate-500";
                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium tabular-nums text-slate-900">
                      {formatDate(row.review_due_date)}
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
                      {formatCommission(row.expected_commission_amount)}
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
