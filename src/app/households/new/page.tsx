import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  name:     "Household name is required.",
  db:       "Could not save — please try again.",
};

export default async function NewHouseholdPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp    = await searchParams;
  const error = sp.error ? (ERRORS[sp.error] ?? "An error occurred.") : null;

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) redirect("/households/new?error=name");

    const { data, error: dbError } = await supabase
      .from("households")
      .insert({
        name,
        address_line1: formData.get("address_line1")?.toString().trim() || null,
        city:          formData.get("city")?.toString().trim()          || null,
        state:         formData.get("state")?.toString().trim()         || null,
        zip:           formData.get("zip")?.toString().trim()           || null,
      })
      .select("id")
      .single();

    if (dbError || !data) redirect("/households/new?error=db");
    redirect(`/households/${data.id}`);
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm " +
    "text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none";

  return (
    <div className="p-8 max-w-lg">
      <Link href="/households" className="text-sm text-slate-400 hover:text-slate-600">
        ← Households
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">New Household</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleCreate} className="mt-6 space-y-5">
        {/* name */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Household name <span className="text-red-400">*</span>
          </label>
          <input name="name" type="text" className={inputClass} placeholder="e.g. Johnson" />
        </div>

        {/* address */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Address
          </label>
          <input name="address_line1" type="text" className={inputClass} placeholder="Street address" />
        </div>

        {/* city / state / zip */}
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input name="city" type="text" className={inputClass} />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700">State</label>
            <input name="state" type="text" maxLength={2} className={inputClass} placeholder="AZ" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700">ZIP</label>
            <input name="zip" type="text" maxLength={10} className={inputClass} />
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create Household
          </button>
          <Link href="/households" className="text-sm text-slate-400 hover:text-slate-600">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
