import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
};

type Household = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  people: Person[];
};

function primaryContact(people: Person[]): Person | null {
  return people.find((p) => p.relationship === "head") ?? people[0] ?? null;
}

export default async function HouseholdsPage() {
  const { data: households, error } = await supabase
    .from("households")
    .select("id, name, city, state, people(id, first_name, last_name, email, phone, relationship)")
    .order("name")
    .returns<Household[]>();

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load households: {error.message}
      </div>
    );
  }

  const rows = households ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Households</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} household{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/households/new"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          New Household
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">People</th>
              <th className="px-4 py-3">Primary Email</th>
              <th className="px-4 py-3">Primary Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No households yet.
                </td>
              </tr>
            ) : (
              rows.map((h) => {
                const contact = primaryContact(h.people);
                const location = [h.city, h.state].filter(Boolean).join(", ");
                return (
                  <tr key={h.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        href={`/households/${h.id}`}
                        className="hover:text-slate-600"
                      >
                        {h.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {location || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {h.people.length}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {contact?.email ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {contact?.phone ?? <span className="text-slate-300">—</span>}
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
