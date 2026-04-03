"use client";

import { useState } from "react";

const PRODUCT_TYPES = [
  { value: "medicare_advantage",  label: "Medicare Advantage"  },
  { value: "medicare_supplement", label: "Medicare Supplement" },
  { value: "pdp",                 label: "Part D (PDP)"        },
  { value: "life",                label: "Life"                },
  { value: "health",              label: "Health"              },
  { value: "dental",              label: "Dental"              },
  { value: "ancillary",           label: "Ancillary"           },
];

// Sensible default renewal behavior per product type
const BEHAVIOR_DEFAULTS: Record<string, string> = {
  medicare_advantage:  "annual_reselection",
  medicare_supplement: "ongoing",
  pdp:                 "annual_reselection",
  life:                "ongoing",
  health:              "annual_reselection",
  dental:              "ongoing",
  ancillary:           "ongoing",
};

export function ProductTypeSelect({ inputClass }: { inputClass: string }) {
  const [behavior, setBehavior] = useState("");

  function handleTypeChange(value: string) {
    setBehavior(BEHAVIOR_DEFAULTS[value] ?? "ongoing");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Product type <span className="text-red-400">*</span>
          </label>
          <select
            name="product_type"
            onChange={(e) => handleTypeChange(e.target.value)}
            className={inputClass}
            defaultValue=""
          >
            <option value="" disabled>— select —</option>
            {PRODUCT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Renewal behavior
          </label>
          <select
            name="renewal_behavior"
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>— select —</option>
            <option value="annual_reselection">Annual Reselection</option>
            <option value="ongoing">Ongoing</option>
            <option value="term_expiration">Term Expiration</option>
          </select>
        </div>
      </div>

      {behavior === "ongoing" && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Review due date
          </label>
          <input
            name="review_due_date"
            type="date"
            className={inputClass}
          />
        </div>
      )}

      {behavior === "term_expiration" && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Termination date
          </label>
          <input
            name="termination_date"
            type="date"
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}
