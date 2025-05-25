import React from "react";

export type ExportFormat = "png" | "jpg" | "pdf";

type Props = {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
};

const formatLabels = {
  png: "PNG (推荐)",
  jpg: "JPG (压缩)",
  pdf: "PDF (文档)"
};

export default function ExportFormatSelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm mb-1">导出格式</label>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(formatLabels) as ExportFormat[]).map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => onChange(format)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
              value === format
                ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {formatLabels[format]}
          </button>
        ))}
      </div>
    </div>
  );
} 