import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  fields: "First name and last name are required.",
  db:     "Could not save — please try again.",
};

export default async function NewPersonPage({
  params,
  searchParams,
}: {
  params:       Promise<{ householdId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { householdId } = await params;
  const sp              = await searchParams;
  const error = sp.error ? (ERRORS[sp.error] ?? "An error occurred.") : null;

  const { data: household } = await supabase
    .from("households")
    .select("id, name")
    .eq("id", householdId)
    .single();

  if (!household) notFound();

  async function handleAdd(formData: FormData) {
    "use server";
    const firstName = formData.get("first_name")?.toString().trim() ?? "";
    const lastName  = formData.get("last_name")?.toString().trim()  ?? "";
    if (!firstName || !lastName) {
      redirect(`/households/${householdId}/people/new?error=fields`);
    }

    const { error: dbError } = await supabase.from("people").insert({
      household_id:  householdId,
      first_name:    firstName,
      last_name:     lastName,
      date_of_birth: formData.get("date_of_birth")?.toString() || null,
      relationship:  formData.get("relationship")?.toString()  || null,
      email:         formData.get("email")?.toString().trim()  || null,
      phone:         formData.get("phone")?.toString().trim()  || null,
    });

    if (dbError) redirect(`/households/${householdId}/people/new?error=db`);
    redirect(`/households/${householdId}`);
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm " +
    "text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none";

  return (
    <div className="p-8 max-w-lg">
      <Link
        href={`/households/${householdId}`}
        className="text-sm text-slate-400 hover:text-slate-600"
      >
        ← {household.name}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Add Person</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={handleAdd} className="mt-6 space-y-5">
        {/* name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              First name <span className="text-red-400">*</span>
            </label>
            <input name="first_name" type="text" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Last name <span className="text-red-400">*</span>
            </label>
            <input name="last_name" type="text" className={inputClass} />
          </div>
        </div>

        {/* relationship / dob */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Relationship
            </label>
            <select name="relationship" className={inputClass}>
              <option value="">— select —</option>
              <option value="head">Head</option>
              <option value="spouse">Spouse</option>
              <option value="dependent">Dependent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date of birth
            </label>
            <input name="date_of_birth" type="date" className={inputClass} />
          </div>
        </div>

        {/* contact */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input name="phone" type="tel" className={inputClass} placeholder="555-555-0100" />
        </div>

        {/* actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add Person
          </button>
          <Link
            href={`/households/${householdId}`}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
