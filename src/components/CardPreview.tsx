
import React, { forwardRef } from "react";
import { ColorScheme } from "./ColorSchemeSelect";

const bgMap: Record<ColorScheme, string> = {
  blue: "from-blue-400 to-blue-200",
  green: "from-green-400 to-green-200",
  pink: "from-pink-400 to-pink-200",
};

const textColMap: Record<ColorScheme, string> = {
  blue: "text-blue-900",
  green: "text-green-900",
  pink: "text-pink-900",
};

type Props = {
  subject: string;
  date: string;
  content: string;
  scheme: ColorScheme;
};

// 允许 ref 用于 html2canvas 捕获
const CardPreview = forwardRef<HTMLDivElement, Props>(
  ({ subject, date, content, scheme }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          w-[330px] sm:w-[400px] min-h-[200px] py-6 px-5 mx-auto rounded-3xl shadow-xl
          bg-gradient-to-br ${bgMap[scheme]} ${textColMap[scheme]}
          flex flex-col gap-2 justify-between transition-all duration-300
        `}
        style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif", letterSpacing: ".01em" }}
      >
        <div>
          <div className="text-xs font-semibold opacity-75">{date}</div>
          <div className="text-xl sm:text-2xl font-bold my-2 leading-tight">{subject || "学习主题"}</div>
        </div>
        <div className="flex-1 flex items-center">
          <div className="text-base sm:text-lg leading-snug whitespace-pre-line break-words">
            {content || "在此填写您的学习内容…"}
          </div>
        </div>
        <div className="pt-4 text-xs text-right opacity-60 font-normal">
          由「生成学习卡片」小站制作
        </div>
      </div>
    );
  }
);

export default CardPreview;
