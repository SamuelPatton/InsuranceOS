import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// ── types ────────────────────────────────────────────────────────────────────

type Household = {
  id: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
};

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  relationship: string | null;
  email: string | null;
  phone: string | null;
};

type Policy = {
  id: string;
  carrier: string;
  plan_name: string | null;
  product_type: string;
  status: string;
  renewal_date: string | null;
  expected_commission_amount: number | null;
  people: { first_name: string; last_name: string } | null;
};

// ── helpers ──────────────────────────────────────────────────────────────────

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

function calcAge(dob: string | null): string {
  if (!dob) return "—";
  const [y, m, d] = dob.split("-").map(Number);
  const today = new Date();
  let a = today.getFullYear() - y;
  if (
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
  ) a--;
  return String(a);
}

function capitalize(s: string | null): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
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

// ── page ─────────────────────────────────────────────────────────────────────

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ householdId: string }>;
}) {
  const { householdId } = await params;

  const [
    { data: household, error: hhError },
    { data: people },
    { data: policies },
  ] = await Promise.all([
    supabase
      .from("households")
      .select("id, name, address_line1, address_line2, city, state, zip, notes")
      .eq("id", householdId)
      .single<Household>(),

    supabase
      .from("people")
      .select("id, first_name, last_name, date_of_birth, relationship, email, phone")
      .eq("household_id", householdId)
      .order("relationship"),

    supabase
      .from("policies")
      .select(
        "id, carrier, plan_name, product_type, status, renewal_date, expected_commission_amount, people(first_name, last_name)"
      )
      .eq("household_id", householdId)
      .order("renewal_date", { ascending: true })
      .returns<Policy[]>(),
  ]);

  if (hhError || !household) notFound();

  const memberRows = (people ?? []) as Person[];
  const policyRows = policies ?? [];

  // ── summary strip values ──────────────────────────────────────────────────
  const livePolicies = policyRows.filter(
    (p) => p.status === "active" || p.status === "pending"
  );

  const activePolicyCount = livePolicies.length;

  const nextRenewal =
    livePolicies
      .filter((p) => p.renewal_date !== null)
      .sort((a, b) => (a.renewal_date! > b.renewal_date! ? 1 : -1))[0]
      ?.renewal_date ?? null;

  const totalCommission = livePolicies.reduce(
    (sum, p) => sum + (p.expected_commission_amount ?? 0),
    0
  );

  const summary = [
    { label: "Active Policies",    value: String(activePolicyCount)      },
    { label: "Next Renewal",       value: formatDate(nextRenewal)        },
    { label: "Est. Commission",    value: formatCommission(totalCommission) },
    { label: "Open Alerts",        value: "0"                            },
    { label: "Opportunities",      value: "0"                            },
  ];

  const addressParts = [
    household.address_line1,
    household.address_line2,
    [household.city, household.state].filter(Boolean).join(", "),
    household.zip,
  ].filter(Boolean);

  return (
    <div className="p-8 max-w-5xl">

      {/* back */}
      <Link
        href="/households"
        className="text-sm text-slate-400 hover:text-slate-600"
      >
        ← Households
      </Link>

      {/* header */}
      <div className="mt-4">
        <h1 className="text-2xl font-semibold">{household.name}</h1>
        {addressParts.length > 0 && (
          <p className="mt-1 text-sm text-slate-500">
            {addressParts.join(" · ")}
          </p>
        )}
        {household.notes && (
          <p className="mt-2 text-sm text-slate-500 italic">{household.notes}</p>
        )}
      </div>

      {/* summary strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {summary.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-1.5 text-lg font-semibold tabular-nums text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* people */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            People{" "}
            <span className="font-normal text-slate-400">
              ({memberRows.length})
            </span>
          </h2>
          <Link
            href={`/households/${householdId}/people/new`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Add Person
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Date of Birth</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No people linked to this household.
                  </td>
                </tr>
              ) : (
                memberRows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {capitalize(p.relationship)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(p.date_of_birth)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {calcAge(p.date_of_birth)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.email ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.phone ?? <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* policies */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Policies{" "}
            <span className="font-normal text-slate-400">
              ({policyRows.length})
            </span>
          </h2>
          <Link
            href={`/households/${householdId}/policies/new`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Add Policy
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Insured</th>
                <th className="px-4 py-3">Carrier</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Renewal</th>
                <th className="px-4 py-3 text-right">Est. Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policyRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No policies for this household.
                  </td>
                </tr>
              ) : (
                policyRows.map((pol) => {
                  const insured = pol.people
                    ? `${pol.people.first_name} ${pol.people.last_name}`
                    : "—";
                  const badge =
                    statusStyle[pol.status] ?? "bg-slate-100 text-slate-500";
                  return (
                    <tr key={pol.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{insured}</td>
                      <td className="px-4 py-3 text-slate-600">{pol.carrier}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {pol.plan_name ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {productTypeLabel[pol.product_type] ?? pol.product_type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}
                        >
                          {pol.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(pol.renewal_date)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCommission(pol.expected_commission_amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
