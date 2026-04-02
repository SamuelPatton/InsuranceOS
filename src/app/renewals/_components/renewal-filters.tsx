"use client";

import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "all",        label: "All statuses"  },
  { value: "active",     label: "Active"        },
  { value: "pending",    label: "Pending"       },
  { value: "lapsed",     label: "Lapsed"        },
  { value: "terminated", label: "Terminated"    },
];

const PRODUCT_TYPES = [
  { value: "all",                  label: "All types"            },
  { value: "medicare_advantage",   label: "Medicare Advantage"   },
  { value: "medicare_supplement",  label: "Medicare Supplement"  },
  { value: "pdp",                  label: "Part D"               },
  { value: "life",                 label: "Life"                 },
  { value: "health",               label: "Health"               },
  { value: "dental",               label: "Dental"               },
  { value: "ancillary",            label: "Ancillary"            },
];

const WINDOWS = [
  { value: "all", label: "All dates"     },
  { value: "30",  label: "Next 30 days"  },
  { value: "60",  label: "Next 60 days"  },
  { value: "90",  label: "Next 90 days"  },
  { value: "180", label: "Next 6 months" },
  { value: "365", label: "Next 12 months"},
];

type Current = {
  status:          string;
  product_type:    string;
  carrier:         string;
  renewal_window:  string;
};

type Props = {
  carriers: string[];
  current:  Current;
};

export function RenewalFilters({ carriers, current }: Props) {
  const router = useRouter();

  function apply(key: keyof Current, value: string) {
    const next: Current = { ...current, [key]: value };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (v && v !== "all") params.set(k, v);
    }
    const qs = params.toString();
    router.push(`/renewals${qs ? `?${qs}` : ""}`);
  }

  const hasActive =
    current.status        !== "all" ||
    current.product_type  !== "all" ||
    current.carrier       !== "all" ||
    current.renewal_window !== "all";

  const selectClass =
    "rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm " +
    "text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={current.status}
        onChange={(e) => apply("status", e.target.value)}
        className={selectClass}
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={current.product_type}
        onChange={(e) => apply("product_type", e.target.value)}
        className={selectClass}
      >
        {PRODUCT_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={current.carrier}
        onChange={(e) => apply("carrier", e.target.value)}
        className={selectClass}
      >
        <option value="all">All carriers</option>
        {carriers.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={current.renewal_window}
        onChange={(e) => apply("renewal_window", e.target.value)}
        className={selectClass}
      >
        {WINDOWS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {hasActive && (
        <button
          onClick={() => router.push("/renewals")}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Clear
        </button>
      )}
    </div>
  );
}
