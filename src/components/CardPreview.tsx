
import React, { forwardRef } from "react";
import { Book, Beaker, Calendar } from "lucide-react";
import { ColorScheme } from "./ColorSchemeSelect";

// Morandi主色与分块叠加&点缀色
const schemeMap: Record<ColorScheme, {
  gradient: string, // 主bg
  overlay: string,  // 分块叠加
  keypoint: string, // 重点
  text: string,     // 主文字
  pointText: string // 重点文字
}> = {
  blue: {
    gradient: "from-[#aac9e5] to-[#e3eaf5]", // Morandi蓝灰
    overlay: "bg-blue-100/60",
    keypoint: "bg-[#63a2c8]/80", // 较饱和Morandi蓝
    text: "text-[#1e3753]",
    pointText: "text-[#17507a] font-semibold"
  },
  green: {
    gradient: "from-[#b8d2c1] to-[#e1f0e5]",
    overlay: "bg-green-100/60",
    keypoint: "bg-[#83bda4]/80",
    text: "text-[#215949]",
    pointText: "text-[#155544] font-semibold"
  },
  pink: {
    gradient: "from-[#cbb9c6] to-[#f3e8ef]",
    overlay: "bg-pink-100/60",
    keypoint: "bg-[#c885a2]/80",
    text: "text-[#6e2f4c]",
    pointText: "text-[#913b6c] font-semibold"
  },
};

// 标题衬线体（兼容中英文）
const titleFont = `font-serif font-bold text-[1.55rem] sm:text-2xl tracking-tight`;
// 正文/摘抄无衬线
const bodyFont = `font-sans`;
const noteFont = `font-sans text-sm sm:text-base`;

// 学科主题检测→图标
function getIcon(subject?: string) {
  if (!subject) return null;
  const s = subject.toLowerCase();
  if (s.match(/文|history|历|日/i)) return <Calendar size={22} strokeWidth={2.2} className="mr-1.5 sm:mr-2 opacity-70"/>;
  if (s.match(/理|数|算|科|化|物|beaker|science|化学|实验/i)) return <Beaker size={22} strokeWidth={2.2} className="mr-1.5 sm:mr-2 opacity-70"/>;
  if (s.match(/英|book|单词|文献|书|词|语|language|reading|writing/i)) return <Book size={22} strokeWidth={2.1} className="mr-1.5 sm:mr-2 opacity-70"/>;
  return null;
}

// 增强样式下的卡片
type Highlight = { content: string };

type Props = {
  subject: string;
  date: string;
  highlights?: Highlight[];
  content?: string;
  scheme: ColorScheme;
};

// forwardRef供截图
const CardPreview = forwardRef<HTMLDivElement, Props>(
  ({ subject, date, highlights, content, scheme }, ref) => {
    const {
      gradient, overlay, keypoint, text, pointText
    } = schemeMap[scheme];
    const cards = highlights && highlights.length
      ? highlights.filter(h => !!h.content)
      : content
        ? [{ content }]
        : [];

    // 额外笔记区，允许未来拓展
    // 这里只演示重点和主题
    const icon = getIcon(subject);

    return (
      <div
        ref={ref}
        className={`w-[335px] sm:w-[420px] min-h-[240px] p-5 sm:py-7 sm:px-7 mx-auto rounded-3xl shadow-2xl
          bg-gradient-to-br ${gradient} ${text} flex flex-col gap-4 justify-between
          transition-all duration-300 relative ring-2 ring-white/10 hover:scale-[1.012] hover:shadow-2xl animate-fade-in`}
        style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif", letterSpacing: ".01em" }}
      >
        {/* 顶部-主题与日期 */}
        <div className={`flex items-center pb-1.5 pl-1`}>
          {icon}
          <div className={`${titleFont} leading-snug mr-2 select-text`}>
            {subject || "学习主题"}
          </div>
          <div className="ml-auto text-xs opacity-60 font-mono tracking-wide pr-1">{date}</div>
        </div>
        {/* 分块内容：重点区 */}
        <section
          className={`
            ${overlay} rounded-2xl shadow-inner px-3 sm:px-4 py-3 flex-1 flex flex-col gap-2 transition-all
            border-l-4 border-white/50 backdrop-blur-[2.5px] animate-fade-in
          `}
        >
          <div className="flex items-center mb-1">
            <span className="text-sm sm:text-base font-serif font-semibold opacity-85 select-none"
              style={{ letterSpacing: ".02em" }}>
              重点 Key Points
            </span>
          </div>
          {cards.length > 0 ? (
            <ul className="space-y-2">
              {cards.map((h, idx) => (
                <li
                  key={idx}
                  className={`${keypoint} rounded-xl px-2.5 py-2 flex items-start shadow
                    whitespace-pre-line break-words ${pointText} border-l-4 border-white/40
                    hover:scale-[1.01] transition-all backdrop-blur-[1.2px]`}
                  style={{
                    fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif",
                    letterSpacing: ".01em"
                  }}
                >
                  <span className="mr-1.5 font-bold text-base sm:text-lg text-black/10 select-none"
                    style={{ textShadow: "0 1px 6px #fff4" }}>{idx + 1}.</span>
                  <span className="flex-1 block">{h.content || ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="opacity-60 italic text-gray-500/70">在此填写您的学习内容…</div>
          )}
        </section>
        {/* 底部-出处 */}
        <div className={`pt-2 text-xs text-right opacity-65 font-mono`}>
          由「生成学习卡片」小站制作
        </div>
      </div>
    );
  }
);

export default CardPreview;

