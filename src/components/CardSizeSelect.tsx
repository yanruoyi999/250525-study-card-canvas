import React from "react";

export type CardSize = "standard" | "phone" | "tablet" | "desktop" | "social";

const sizeOptions = [
  { 
    value: "standard" as const, 
    label: "标准卡片", 
    dimension: "420×240",
    ratio: "7:4",
    description: "适合一般使用"
  },
  { 
    value: "phone" as const, 
    label: "手机壁纸", 
    dimension: "360×640",
    ratio: "9:16",
    description: "竖屏手机背景"
  },
  { 
    value: "tablet" as const, 
    label: "平板横屏", 
    dimension: "600×400",
    ratio: "3:2",
    description: "平板设备使用"
  },
  { 
    value: "desktop" as const, 
    label: "电脑壁纸", 
    dimension: "800×450",
    ratio: "16:9",
    description: "桌面背景图"
  },
  { 
    value: "social" as const, 
    label: "社交分享", 
    dimension: "400×400",
    ratio: "1:1",
    description: "微博/朋友圈"
  }
];

interface Props {
  value: CardSize;
  onChange: (size: CardSize) => void;
}

export default function CardSizeSelect({ value, onChange }: Props) {
  const selectedOption = sizeOptions.find(opt => opt.value === value);
  
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium mb-1">输出尺寸</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as CardSize)}
        className="rounded-lg border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
      >
        {sizeOptions.map(opt => (
          <option value={opt.value} key={opt.value}>
            {opt.label} - {opt.dimension} ({opt.ratio})
          </option>
        ))}
      </select>
      {selectedOption && (
        <div className="text-xs text-gray-500 mt-1">
          预览: {selectedOption.dimension} • {selectedOption.description}
        </div>
      )}
    </div>
  );
} 