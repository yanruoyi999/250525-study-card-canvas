
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

type Highlight = { content: string };

type Props = {
  subject: string;
  date: string;
  highlights?: Highlight[]; // 兼容旧数据
  content?: string;         // 兼容旧数据
  scheme: ColorScheme;
};

// 允许 ref 用于 html2canvas 捕获
const CardPreview = forwardRef<HTMLDivElement, Props>(
  ({ subject, date, highlights, content, scheme }, ref) => {
    // 兼容旧 content 字段
    const cards = highlights && highlights.length
      ? highlights.filter(h => !!h.content)
      : content
        ? [{ content }]
        : [];

    return (
      <div
        ref={ref}
        className={`
          w-[330px] sm:w-[410px] min-h-[220px] py-6 px-5 mx-auto rounded-3xl shadow-xl
          bg-gradient-to-br ${bgMap[scheme]} ${textColMap[scheme]}
          flex flex-col gap-3 justify-between transition-all duration-300
        `}
        style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif", letterSpacing: ".01em" }}
      >
        <div>
          <div className="text-xs font-semibold opacity-75">{date}</div>
          <div className="text-xl sm:text-2xl font-bold my-2 leading-tight">{subject || "学习主题"}</div>
        </div>
        <div className="flex-1 flex flex-col gap-2 items-stretch">
          {cards.length ? (
            <ul className="space-y-3">
              {cards.map((h, idx) => (
                <li
                  key={idx}
                  className="bg-white/70 rounded-xl px-3 py-2 shadow flex items-start text-base sm:text-lg leading-snug whitespace-pre-line break-words border border-white/80"
                  style={{
                    borderLeft: "4px solid rgba(30,64,175,.18)",
                    backdropFilter: "blur(1.5px)",
                    fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif",
                  }}
                >
                  <span className="mr-2 font-bold text-blue-400 select-none">{idx+1}.</span>
                  <span className="flex-1">{h.content || ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-base sm:text-lg leading-snug whitespace-pre-line break-words italic text-gray-600/70">
              在此填写您的学习内容…
            </div>
          )}
        </div>
        <div className="pt-4 text-xs text-right opacity-60 font-normal font-mono">
          由「生成学习卡片」小站制作
        </div>
      </div>
    );
  }
);

export default CardPreview;
