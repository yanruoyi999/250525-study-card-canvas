
import React from "react";

export type ColorScheme = "blue" | "green" | "pink";

const options = [
  { value: "blue", label: "天蓝（iOS风）", bg: "from-blue-400 to-blue-200" },
  { value: "green", label: "柔绿（Apple Mint）", bg: "from-green-400 to-green-200" },
  { value: "pink", label: "柔粉（桃粉）", bg: "from-pink-400 to-pink-200" },
];

interface Props {
  value: ColorScheme;
  onChange: (v: ColorScheme) => void;
}

export default function ColorSchemeSelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium mb-1">配色方案</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as ColorScheme)}
        className="rounded-lg border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
      >
        {options.map(opt => (
          <option value={opt.value} key={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
