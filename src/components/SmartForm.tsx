
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import CardPreview from "./CardPreview";
import ColorSchemeSelect, { ColorScheme } from "./ColorSchemeSelect";
import { toast } from "@/hooks/use-toast";

export default function SmartForm() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
  });
  const [content, setContent] = useState("");
  const [scheme, setScheme] = useState<ColorScheme>("blue");
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // 存localStorage
  React.useEffect(() => {
    localStorage.setItem("lastCard", JSON.stringify({subject, date, content, scheme}));
  }, [subject, date, content, scheme]);

  // 加载历史
  React.useEffect(() => {
    const raw = localStorage.getItem("lastCard");
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        setSubject(obj.subject || "");
        setDate(obj.date || "");
        setContent(obj.content || "");
        setScheme(obj.scheme || "blue");
      } catch {}
    }
  }, []);

  // mock：用大模型自动润色（可后续接API，支持变量key）
  async function enhanceContent(subject: string, date: string, content: string) {
    // 这里预留 apiKey 变量入口，实际安全应从supabase secret或UI输入
    // const apiKey = "sk-你的APIKey";
    // const r = await fetch("https://api.gptsapi.net/v1/chat/completions", { ... })
    // setContent(await r.json());
    // demo 直接输出
    return content;
  }

  async function handleGenerateCard(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // content润色: 实际可接AI
      const improvedContent = await enhanceContent(subject, date, content);

      // 用html2canvas生成图片
      if (previewRef.current) {
        // 1. 动态设好内容再截图
        // 2. 额外：休眠以确保样式渲染完毕
        await new Promise(res => setTimeout(res, 300));
        const canvas = await html2canvas(previewRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
        const dataURL = canvas.toDataURL("image/png");
        // 自动下载到本地
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

  return (
    <form
      className="w-full max-w-[360px] sm:max-w-[470px] mx-auto px-3 py-4 flex flex-col gap-6"
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
        <label className="font-medium text-sm mb-1">学习内容</label>
        <textarea
          className="rounded-lg border-gray-200 px-3 py-2 min-h-[80px] text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          placeholder="请填写今日重点、难点或自定义内容…"
          maxLength={128}
        />
      </div>
      <ColorSchemeSelect value={scheme} onChange={setScheme} />
      <div className="my-6 flex justify-center">
        <CardPreview subject={subject} date={date} content={content} scheme={scheme} ref={previewRef} />
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
