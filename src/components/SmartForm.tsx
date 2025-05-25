import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CardPreview from "./CardPreview";
import ColorSchemeSelect, { ColorScheme } from "./ColorSchemeSelect";
import CardSizeSelect, { CardSize } from "./CardSizeSelect";
import ExportFormatSelect, { ExportFormat } from "./ExportFormatSelect";
import UserProfile from "./UserProfile";
import CardHistory, { HistoryCard } from "./CardHistory";
import { toast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Highlight = { content: string; id: string };

type UserInfo = {
  nickname: string;
  avatar?: string;
};

// 可拖拽的重点内容项组件
function SortableHighlightItem({ 
  highlight, 
  index, 
  onContentChange, 
  onRemove, 
  canRemove 
}: {
  highlight: Highlight;
  index: number;
  onContentChange: (content: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: highlight.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex gap-1 items-start"
    >
      <div className="flex items-center">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="拖拽排序"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      </div>
      <textarea
        className="rounded-lg border-gray-200 px-3 py-2 min-h-[54px] text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none flex-1"
        value={highlight.content}
        onChange={e => onContentChange(e.target.value)}
        required
        placeholder={`第${index + 1}条内容…`}
        maxLength={160}
      />
      <button
        type="button"
        onClick={onRemove}
        className={`ml-1 px-2 py-1 rounded text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition shadow border border-transparent ${!canRemove ? "opacity-30 cursor-not-allowed" : ""}`}
        disabled={!canRemove}
        tabIndex={-1}
        title="删除该条"
      >✕</button>
    </div>
  );
}

export default function SmartForm() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
  });
  const [highlights, setHighlights] = useState<Highlight[]>([{ content: "", id: "highlight-1" }]);
  const [scheme, setScheme] = useState<ColorScheme>("blue");
  const [cardSize, setCardSize] = useState<CardSize>("standard");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [userInfo, setUserInfo] = useState<UserInfo>({ nickname: "" });
  const [historyCards, setHistoryCards] = useState<HistoryCard[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 存localStorage
  React.useEffect(() => {
    localStorage.setItem("lastCard", JSON.stringify({subject, date, highlights, scheme, cardSize, exportFormat}));
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }, [subject, date, highlights, scheme, cardSize, exportFormat, userInfo]);

  // 加载历史
  React.useEffect(() => {
    const raw = localStorage.getItem("lastCard");
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        setSubject(obj.subject || "");
        setDate(obj.date || "");
        // 确保历史数据有id字段
        const loadedHighlights = obj.highlights && Array.isArray(obj.highlights) 
          ? obj.highlights.map((h: any, i: number) => ({
              content: h.content || "",
              id: h.id || `highlight-${i + 1}`
            }))
          : [{ content: "", id: "highlight-1" }];
        setHighlights(loadedHighlights);
        setScheme(obj.scheme || "blue");
        setCardSize(obj.cardSize || "standard");
        setExportFormat(obj.exportFormat || "png");
      } catch {}
    }

    // 加载用户信息
    const userRaw = localStorage.getItem("userInfo");
    if (userRaw) {
      try {
        const userObj = JSON.parse(userRaw);
        setUserInfo(userObj);
      } catch {}
    }

    // 加载历史卡片
    const historyRaw = localStorage.getItem("cardHistory");
    if (historyRaw) {
      try {
        const historyObj = JSON.parse(historyRaw);
        setHistoryCards(historyObj);
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
        // 导出前隐藏拖拽图标
        const dragHandles = previewRef.current.querySelectorAll('.drag-handle-export-hidden');
        dragHandles.forEach(handle => {
          (handle as HTMLElement).style.display = 'none';
        });
        
        await new Promise(res => setTimeout(res, 300));
        const canvas = await html2canvas(previewRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
        
        // 导出后恢复拖拽图标显示
        dragHandles.forEach(handle => {
          (handle as HTMLElement).style.display = 'block';
        });
        
        // 根据格式处理导出
        if (exportFormat === "pdf") {
          // PDF导出
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF();
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          
          const sizeLabels = {
            standard: "标准卡片",
            phone: "手机壁纸", 
            tablet: "平板横屏",
            desktop: "电脑壁纸",
            social: "社交分享"
          };
          const sizeLabel = sizeLabels[cardSize] || "标准卡片";
          pdf.save(`${subject || "学习卡片"}_${sizeLabel}.pdf`);
        } else {
          // PNG/JPG导出
          const format = exportFormat === "jpg" ? "image/jpeg" : "image/png";
          const dataURL = canvas.toDataURL(format, 0.9);
          const link = document.createElement("a");
          link.href = dataURL;
          
          const sizeLabels = {
            standard: "标准卡片",
            phone: "手机壁纸", 
            tablet: "平板横屏",
            desktop: "电脑壁纸",
            social: "社交分享"
          };
          const sizeLabel = sizeLabels[cardSize] || "标准卡片";
          const extension = exportFormat === "jpg" ? "jpg" : "png";
          link.download = `${subject || "学习卡片"}_${sizeLabel}.${extension}`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // 保存到历史记录
        const newCard: HistoryCard = {
          id: `card-${Date.now()}`,
          subject,
          date,
          highlights,
          scheme,
          cardSize,
          createdAt: new Date().toISOString(),
          nickname: userInfo.nickname,
          avatar: userInfo.avatar
        };
        
        const updatedHistory = [newCard, ...historyCards.slice(0, 49)]; // 最多保存50张
        setHistoryCards(updatedHistory);
        localStorage.setItem("cardHistory", JSON.stringify(updatedHistory));

        const formatLabels = {
          png: "PNG",
          jpg: "JPG", 
          pdf: "PDF"
        };
        
        toast({
          title: `${formatLabels[exportFormat]}卡片已生成并下载！`,
          description: "卡片已自动保存到历史记录中。",
          duration: 5000,
        });
      }
    } catch(err) {
      toast({ title: "生成失败", description: String(err) });
    } finally {
      setLoading(false);
    }
  }

  function handleHighlightChange(id: string, content: string) {
    setHighlights(hs =>
      hs.map((item) => (item.id === id ? { ...item, content } : item))
    );
  }

  function handleAddHighlight() {
    const newId = `highlight-${Date.now()}`;
    setHighlights(hs => [...hs, { content: "", id: newId }]);
  }

  function handleRemoveHighlight(id: string) {
    setHighlights(hs => hs.length > 1 ? hs.filter((item) => item.id !== id) : hs);
  }

  // 处理拖拽结束事件
  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setHighlights((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // 预览编辑回调函数
  const handleSubjectEdit = (newSubject: string) => {
    setSubject(newSubject);
  };

  const handleDateEdit = (newDate: string) => {
    setDate(newDate);
  };

  const handleHighlightEdit = (index: number, newContent: string) => {
    setHighlights(hs =>
      hs.map((item, i) => (i === index ? { ...item, content: newContent } : item))
    );
  };

  // 预览拖拽排序回调函数
  const handlePreviewHighlightReorder = (fromIndex: number, toIndex: number) => {
    setHighlights(hs => arrayMove(hs, fromIndex, toIndex));
  };

  // 历史卡片管理函数
  const handleLoadCard = (card: HistoryCard) => {
    setSubject(card.subject);
    setDate(card.date);
    setHighlights(card.highlights);
    setScheme(card.scheme);
    setCardSize(card.cardSize);
    
    toast({
      title: "历史卡片已加载",
      description: `已加载「${card.subject}」的卡片内容`,
      duration: 3000,
    });
  };

  const handleDeleteCard = (id: string) => {
    const updatedHistory = historyCards.filter(card => card.id !== id);
    setHistoryCards(updatedHistory);
    localStorage.setItem("cardHistory", JSON.stringify(updatedHistory));
    
    toast({
      title: "卡片已删除",
      description: "历史卡片已从记录中移除",
      duration: 3000,
    });
  };

  const handleClearHistory = () => {
    setHistoryCards([]);
    localStorage.removeItem("cardHistory");
    
    toast({
      title: "历史记录已清空",
      description: "所有历史卡片已被清除",
      duration: 3000,
    });
  };

  return (
    <form
      className="w-full max-w-[380px] sm:max-w-[520px] mx-auto px-3 py-4 flex flex-col gap-6"
      onSubmit={handleGenerateCard}
      autoComplete="off"
    >
      {/* 页面标题区域 */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="drop-shadow-sm">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            卡片生成器
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          轻松制作精美学习卡片，支持多种尺寸和配色方案
          <span className="block text-xs text-gray-400 mt-1">免费使用 · 数据本地存储</span>
        </p>
      </div>
      
      <UserProfile userInfo={userInfo} onUserInfoChange={setUserInfo} />
      
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm mb-1">📝 标题</label>
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
        <label className="font-medium text-sm mb-1">📅 日期</label>
        <input
          type="date"
          className="rounded-lg border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm mb-1">📝 重点/摘抄内容 <span className="text-xs text-gray-500">(可拖拽排序)</span></label>
        <div className="flex flex-col gap-3">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={highlights.map(h => h.id)}
              strategy={verticalListSortingStrategy}
            >
              {highlights.map((hl, i) => (
                <SortableHighlightItem
                  key={hl.id}
                  highlight={hl}
                  index={i}
                  onContentChange={(content) => handleHighlightChange(hl.id, content)}
                  onRemove={() => handleRemoveHighlight(hl.id)}
                  canRemove={highlights.length > 1}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={handleAddHighlight}
            className="mt-1 w-full text-blue-600 rounded-xl bg-blue-50 hover:bg-blue-100 py-2 font-bold flex items-center justify-center gap-1 border"
          >+ 新增重点/摘抄</button>
        </div>
      </div>
      <ColorSchemeSelect value={scheme} onChange={setScheme} />
      <CardSizeSelect value={cardSize} onChange={setCardSize} />
      <ExportFormatSelect value={exportFormat} onChange={setExportFormat} />
      
      <div className="my-6 flex justify-center">
        <CardPreview
          subject={subject}
          date={date}
          highlights={highlights}
          scheme={scheme}
          cardSize={cardSize}
          userInfo={userInfo}
          onSubjectEdit={handleSubjectEdit}
          onDateEdit={handleDateEdit}
          onHighlightEdit={handleHighlightEdit}
          onHighlightReorder={handlePreviewHighlightReorder}
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
        {loading ? "正在生成…" : "卡片生成"}
      </button>
      
      <CardHistory 
        historyCards={historyCards}
        onLoadCard={handleLoadCard}
        onDeleteCard={handleDeleteCard}
        onClearHistory={handleClearHistory}
      />
      
      <div className="text-center text-xs text-gray-400 pt-1">
        免费 · 生成卡片仅供学习记录，不会上传数据
      </div>
    </form>
  )
}
