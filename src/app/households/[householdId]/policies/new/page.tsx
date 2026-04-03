import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ProductTypeSelect } from "./_components/product-type-select";

const ERRORS: Record<string, string> = {
  fields: "Policyholder, carrier, and product type are required.",
  db:     "Could not save — please try again.",
};

export default async function NewPolicyPage({
  params,
  searchParams,
}: {
  params:       Promise<{ householdId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { householdId } = await params;
  const sp              = await searchParams;
  const error = sp.error ? (ERRORS[sp.error] ?? "An error occurred.") : null;

  const [{ data: household }, { data: people }] = await Promise.all([
    supabase.from("households").select("id, name").eq("id", householdId).single(),
    supabase
      .from("people")
      .select("id, first_name, last_name")
      .eq("household_id", householdId)
      .order("first_name"),
  ]);

  if (!household) notFound();

  async function handleAdd(formData: FormData) {
    "use server";
    const personId   = formData.get("person_id")?.toString()   ?? "";
    const carrier    = formData.get("carrier")?.toString().trim() ?? "";
    const productType = formData.get("product_type")?.toString() ?? "";
    const renewalBehavior = formData.get("renewal_behavior")?.toString() || null;

    if (!personId || !carrier || !productType) {
      redirect(`/households/${householdId}/policies/new?error=fields`);
    }

    const premiumRaw    = formData.get("premium_amount")?.toString().trim();
    const commissionRaw = formData.get("expected_commission_amount")?.toString().trim();
    const reviewDueDateRaw = formData.get("review_due_date")?.toString() || null;
    const terminationDateRaw = formData.get("termination_date")?.toString() || null;

    const reviewDueDate =
      renewalBehavior === "ongoing" ? reviewDueDateRaw : null;
    const terminationDate =
      renewalBehavior === "term_expiration" ? terminationDateRaw : null;

    const { error: dbError } = await supabase.from("policies").insert({
      household_id:               householdId,
      person_id:                  personId,
      carrier,
      product_type:               productType,
      plan_name:                  formData.get("plan_name")?.toString().trim()        || null,
      status:                     formData.get("status")?.toString()                  || "active",
      renewal_behavior:           renewalBehavior,
      effective_date:             formData.get("effective_date")?.toString()          || null,
      renewal_date:               formData.get("renewal_date")?.toString()            || null,
      review_due_date:            reviewDueDate,
      termination_date:           terminationDate,
      premium_amount:             premiumRaw    ? parseFloat(premiumRaw)    : null,
      expected_commission_amount: commissionRaw ? parseFloat(commissionRaw) : null,
    });

    if (dbError) redirect(`/households/${householdId}/policies/new?error=db`);
    redirect(`/households/${householdId}`);
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm " +
    "text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none";

  const memberList = people ?? [];

  return (
    <div className="p-8 max-w-lg">
      <Link
        href={`/households/${householdId}`}
        className="text-sm text-slate-400 hover:text-slate-600"
      >
        ← {household.name}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Add Policy</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {memberList.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500">
          No people linked to this household yet.{" "}
          <Link
            href={`/households/${householdId}/people/new`}
            className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            Add a person first.
          </Link>
        </div>
      ) : (
        <form action={handleAdd} className="mt-6 space-y-5">
          {/* policyholder */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Policyholder <span className="text-red-400">*</span>
            </label>
            <select name="person_id" className={inputClass}>
              <option value="">— select —</option>
              {memberList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* carrier / plan name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Carrier <span className="text-red-400">*</span>
              </label>
              <input name="carrier" type="text" className={inputClass} placeholder="e.g. Humana" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Plan name</label>
              <input name="plan_name" type="text" className={inputClass} placeholder="e.g. Gold Plus H5619" />
            </div>
          </div>

          {/* product type + renewal behavior (dynamic default) */}
          <ProductTypeSelect inputClass={inputClass} />

          {/* status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select name="status" className={inputClass}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="lapsed">Lapsed</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div /> {/* spacer */}
          </div>

          {/* dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Effective date</label>
              <input name="effective_date" type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Renewal date</label>
              <input name="renewal_date" type="date" className={inputClass} />
            </div>
          </div>

          {/* financials */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Monthly premium ($)</label>
              <input
                name="premium_amount"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Est. commission/yr ($)</label>
              <input
                name="expected_commission_amount"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add Policy
            </button>
            <Link
              href={`/households/${householdId}`}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
