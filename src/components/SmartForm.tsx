
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import CardPreview from "./CardPreview";
import ColorSchemeSelect, { ColorScheme } from "./ColorSchemeSelect";
import { toast } from "@/hooks/use-toast";

type Highlight = { content: string };

export default function SmartForm() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
  });
  const [highlights, setHighlights] = useState<Highlight[]>([{ content: "" }]);
  const [scheme, setScheme] = useState<ColorScheme>("blue");
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // 存localStorage
  React.useEffect(() => {
    localStorage.setItem("lastCard", JSON.stringify({subject, date, highlights, scheme}));
  }, [subject, date, highlights, scheme]);

  // 加载历史
  React.useEffect(() => {
    const raw = localStorage.getItem("lastCard");
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        setSubject(obj.subject || "");
        setDate(obj.date || "");
        setHighlights(obj.highlights && Array.isArray(obj.highlights) ? obj.highlights : [{ content: "" }]);
        setScheme(obj.scheme || "blue");
      } catch {}
    }
  }, []);

  // mock：用大模型自动润色（预留）
  async function enhanceContent(subject: string, date: string, highlights: Highlight[]) {
    // 预留API连大模型，暂直接返回原内容
    return highlights;
  }

  async function handleGenerateCard(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const improved = await enhanceContent(subject, date, highlights);

      if (previewRef.current) {
        await new Promise(res => setTimeout(res, 300));
        const canvas = await html2canvas(previewRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `${subject || "学习卡片"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "卡片已生成并下载！",
          description: "如未自动保存，可长按图片或手动保存到相册。",
          duration: 5000,
        });
      }
    } catch(err) {
      toast({ title: "生成失败", description: String(err) });
    } finally {
      setLoading(false);
    }
  }

  function handleHighlightChange(idx: number, val: string) {
    setHighlights(hs =>
      hs.map((item, i) => (i === idx ? { ...item, content: val } : item))
    );
  }
  function handleAddHighlight() {
    setHighlights(hs => [...hs, { content: "" }]);
  }
  function handleRemoveHighlight(idx: number) {
    setHighlights(hs => hs.length > 1 ? hs.filter((_, i) => i !== idx) : hs);
  }

  return (
    <form
      className="w-full max-w-[380px] sm:max-w-[520px] mx-auto px-3 py-4 flex flex-col gap-6"
      onSubmit={handleGenerateCard}
      autoComplete="off"
    >
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm mb-1">学习主题</label>
        <input
          className="rounded-lg border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          maxLength={20}
          required
          placeholder="如：高数、单词、历史等"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm mb-1">学习日期</label>
        <input
          type="date"
          className="rounded-lg border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm mb-1">重点/摘抄内容</label>
        <div className="flex flex-col gap-3">
          {highlights.map((hl, i) => (
            <div className="flex gap-1 items-start" key={i}>
              <textarea
                className="rounded-lg border-gray-200 px-3 py-2 min-h-[54px] text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none flex-1"
                value={hl.content}
                onChange={e => handleHighlightChange(i, e.target.value)}
                required
                placeholder={`第${i+1}条内容…`}
                maxLength={160}
              />
              <button
                type="button"
                onClick={() => handleRemoveHighlight(i)}
                className={`ml-1 px-2 py-1 rounded text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition shadow border border-transparent ${highlights.length === 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                disabled={highlights.length === 1}
                tabIndex={-1}
                title="删除该条"
              >✕</button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddHighlight}
            className="mt-1 w-full text-blue-600 rounded-xl bg-blue-50 hover:bg-blue-100 py-2 font-bold flex items-center justify-center gap-1 border"
          >+ 新增重点/摘抄</button>
        </div>
      </div>
      <ColorSchemeSelect value={scheme} onChange={setScheme} />
      <div className="my-6 flex justify-center">
        <CardPreview
          subject={subject}
          date={date}
          highlights={highlights}
          scheme={scheme}
          ref={previewRef}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`mt-2 w-full bg-black/90 hover:bg-black text-white font-semibold rounded-xl py-3 text-lg shadow transition-all
          active:scale-95 active:bg-gray-900 ring-2 ring-black/5 ${loading ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        {loading ? "正在生成…" : "生成学习卡片并保存到手机"}
      </button>
      <div className="text-center text-xs text-gray-400 pt-1">
        免费 · 生成卡片仅供学习记录，不会上传数据
      </div>
    </form>
  )
}
