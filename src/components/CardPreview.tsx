import React, { forwardRef } from "react";
import { Book, Beaker, Calendar, User } from "lucide-react";
import { ColorScheme } from "./ColorSchemeSelect";
import { CardSize } from "./CardSizeSelect";
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

// 尺寸配置映射
const sizeConfig: Record<CardSize, {
  width: string;
  height: string;
  titleFont: string;
  bodyFont: string;
  padding: string;
  gap: string;
  iconSize: number;
  isVertical: boolean;
}> = {
  standard: {
    width: "w-[335px] sm:w-[420px]",
    height: "min-h-[240px]",
    titleFont: "text-[1.55rem] sm:text-2xl",
    bodyFont: "text-sm sm:text-base",
    padding: "p-5 sm:py-7 sm:px-7",
    gap: "gap-4",
    iconSize: 22,
    isVertical: false
  },
  phone: {
    width: "w-[270px] sm:w-[360px]",
    height: "h-[480px] sm:h-[640px]",
    titleFont: "text-xl sm:text-2xl",
    bodyFont: "text-sm",
    padding: "p-4 sm:p-6",
    gap: "gap-3",
    iconSize: 20,
    isVertical: true
  },
  tablet: {
    width: "w-[450px] sm:w-[600px]",
    height: "min-h-[300px] sm:min-h-[400px]",
    titleFont: "text-2xl sm:text-3xl",
    bodyFont: "text-base sm:text-lg",
    padding: "p-6 sm:p-8",
    gap: "gap-5",
    iconSize: 24,
    isVertical: false
  },
  desktop: {
    width: "w-[600px] sm:w-[800px]",
    height: "min-h-[338px] sm:min-h-[450px]",
    titleFont: "text-2xl sm:text-4xl",
    bodyFont: "text-lg sm:text-xl",
    padding: "p-8 sm:p-12",
    gap: "gap-6",
    iconSize: 28,
    isVertical: false
  },
  social: {
    width: "w-[300px] sm:w-[400px]",
    height: "h-[300px] sm:h-[400px]",
    titleFont: "text-lg sm:text-xl",
    bodyFont: "text-sm",
    padding: "p-4 sm:p-5",
    gap: "gap-3",
    iconSize: 20,
    isVertical: false
  }
};

// 增强样式下的卡片
type Highlight = { content: string };

type UserInfo = {
  nickname: string;
  avatar?: string;
};

type Props = {
  subject: string;
  date: string;
  highlights?: Highlight[];
  content?: string;
  scheme: ColorScheme;
  cardSize: CardSize;
  userInfo?: UserInfo;
  onSubjectEdit?: (subject: string) => void;
  onDateEdit?: (date: string) => void;
  onHighlightEdit?: (index: number, content: string) => void;
  onHighlightReorder?: (fromIndex: number, toIndex: number) => void;
};

// forwardRef供截图
const CardPreview = forwardRef<HTMLDivElement, Props>(
  ({ subject, date, highlights, content, scheme, cardSize, userInfo, onSubjectEdit, onDateEdit, onHighlightEdit, onHighlightReorder }, ref) => {
    const [editingField, setEditingField] = React.useState<string | null>(null);
    const [editingIndex, setEditingIndex] = React.useState<number>(-1);
    const [tempValue, setTempValue] = React.useState<string>("");
    
    // 配置拖拽传感器
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
    
    const {
      gradient, overlay, keypoint, text, pointText
    } = schemeMap[scheme];
    
    const config = sizeConfig[cardSize];
    
    const cards = highlights && highlights.length
      ? highlights.filter(h => !!h.content)
      : content
        ? [{ content }]
        : [];

    // 额外笔记区，允许未来拓展
    // 这里只演示重点和主题
    const icon = getIcon(subject);

    // 编辑处理函数
    const handleStartEdit = (field: string, currentValue: string, index: number = -1) => {
      setEditingField(field);
      setEditingIndex(index);
      setTempValue(currentValue);
    };

    const handleSaveEdit = () => {
      if (editingField === 'subject' && onSubjectEdit) {
        onSubjectEdit(tempValue);
      } else if (editingField === 'date' && onDateEdit) {
        onDateEdit(tempValue);
      } else if (editingField === 'highlight' && onHighlightEdit && editingIndex >= 0) {
        onHighlightEdit(editingIndex, tempValue);
      }
      setEditingField(null);
      setEditingIndex(-1);
      setTempValue("");
    };

    const handleCancelEdit = () => {
      setEditingField(null);
      setEditingIndex(-1);
      setTempValue("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    };

    // 处理预览区域拖拽结束事件
    const handlePreviewDragEnd = (event: any) => {
      const { active, over } = event;

      if (active.id !== over.id && onHighlightReorder) {
        const activeIndex = parseInt(active.id.replace('preview-highlight-', ''));
        const overIndex = parseInt(over.id.replace('preview-highlight-', ''));
        onHighlightReorder(activeIndex, overIndex);
      }
    };

    return (
      <div
        ref={ref}
        className={`${config.width} ${config.height} ${config.padding} mx-auto rounded-3xl shadow-2xl
          bg-gradient-to-br ${gradient} ${text} flex flex-col ${config.gap} justify-between
          transition-all duration-300 relative ring-2 ring-white/10 hover:scale-[1.012] hover:shadow-2xl animate-fade-in`}
        style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif", letterSpacing: ".01em" }}
      >
        {/* 顶部-主题与日期 */}
        <div className={`flex items-center pb-1.5 pl-1 ${config.isVertical ? 'flex-col text-center gap-2' : ''}`}>
          <div className={`flex items-center ${config.isVertical ? 'justify-center' : ''}`}>
            {React.cloneElement(icon || <div />, { 
              size: config.iconSize,
              className: config.isVertical ? "mb-1 opacity-70" : "mr-1.5 sm:mr-2 opacity-70"
            })}
            {editingField === 'subject' ? (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveEdit}
                className={`font-serif font-bold ${config.titleFont} leading-snug ${config.isVertical ? '' : 'mr-2'} 
                  bg-white/80 rounded px-2 py-1 border-2 border-blue-300 focus:outline-none`}
                maxLength={20}
                autoFocus
              />
            ) : (
              <div 
                className={`font-serif font-bold ${config.titleFont} leading-snug ${config.isVertical ? '' : 'mr-2'} 
                  select-text cursor-pointer hover:bg-white/20 rounded px-2 py-1 transition-colors
                  ${onSubjectEdit ? 'hover:ring-2 hover:ring-white/30' : ''}`}
                onClick={() => onSubjectEdit && handleStartEdit('subject', subject)}
                title={onSubjectEdit ? "点击编辑主题" : ""}
              >
                {subject || "学习主题"}
              </div>
            )}
          </div>
          {editingField === 'date' ? (
            <input
              type="date"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveEdit}
              className={`${config.bodyFont} bg-white/80 rounded px-2 py-1 border-2 border-blue-300 focus:outline-none`}
              autoFocus
            />
          ) : (
            <div 
              className={`${config.bodyFont} opacity-60 font-mono tracking-wide ${config.isVertical ? '' : 'ml-auto pr-1'}
                cursor-pointer hover:bg-white/20 rounded px-2 py-1 transition-colors
                ${onDateEdit ? 'hover:ring-2 hover:ring-white/30' : ''}`}
              onClick={() => onDateEdit && handleStartEdit('date', date)}
              title={onDateEdit ? "点击编辑日期" : ""}
            >
              {date}
            </div>
          )}
        </div>
        
        {/* 分块内容：重点区 */}
        <section
          className={`
            ${overlay} rounded-xl px-3 sm:px-4 py-3 flex-1 flex flex-col gap-2 transition-all
            animate-fade-in
          `}
        >
          <div className="flex items-center mb-1">
            <span className={`${config.bodyFont} font-serif font-semibold opacity-85 select-none`}
              style={{ letterSpacing: ".02em" }}>
              重点 Key Points
            </span>
          </div>
          {cards.length > 0 ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handlePreviewDragEnd}
            >
              <SortableContext 
                items={cards.map((_, idx) => `preview-highlight-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {cards.map((h, idx) => (
                    <SortablePreviewHighlightItem
                      key={idx}
                      highlight={h}
                      index={idx}
                      config={config}
                      keypoint={keypoint}
                      pointText={pointText}
                      editingField={editingField}
                      editingIndex={editingIndex}
                      tempValue={tempValue}
                      setTempValue={setTempValue}
                      handleKeyPress={handleKeyPress}
                      handleSaveEdit={handleSaveEdit}
                      handleStartEdit={handleStartEdit}
                      onHighlightEdit={onHighlightEdit}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <div className={`opacity-60 italic text-gray-500/70 ${config.bodyFont}`}>在此填写您的学习内容…</div>
          )}
        </section>
        
        {/* 底部-出处 */}
        <div className={`pt-2 flex items-center justify-between ${config.isVertical ? 'flex-col gap-2' : ''}`}>
          {/* 用户信息 */}
          {userInfo && (userInfo.nickname || userInfo.avatar) && (
            <div className="flex items-center gap-2 opacity-70">
              {userInfo.avatar && (
                <img 
                  src={userInfo.avatar} 
                  alt="制作者头像" 
                  className="w-5 h-5 rounded-full object-cover border border-white/30"
                />
              )}
              {userInfo.nickname && (
                <span className={`text-xs font-medium ${config.bodyFont}`}>
                  {userInfo.nickname}
                </span>
              )}
            </div>
          )}
          
          {/* 制作出处 */}
          <div className={`text-xs ${config.isVertical ? 'text-center' : 'text-right'} opacity-65 font-mono`}>
            由「卡片生成器」小站制作
          </div>
        </div>
      </div>
    );
  }
);

// 可拖拽的预览重点内容项组件
function SortablePreviewHighlightItem({ 
  highlight, 
  index, 
  config,
  keypoint,
  pointText,
  editingField,
  editingIndex,
  tempValue,
  setTempValue,
  handleKeyPress,
  handleSaveEdit,
  handleStartEdit,
  onHighlightEdit
}: {
  highlight: { content: string };
  index: number;
  config: any;
  keypoint: string;
  pointText: string;
  editingField: string | null;
  editingIndex: number;
  tempValue: string;
  setTempValue: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSaveEdit: () => void;
  handleStartEdit: (field: string, currentValue: string, index?: number) => void;
  onHighlightEdit?: (index: number, content: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `preview-highlight-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      className={`${keypoint} rounded-lg px-3 py-2.5 flex items-start
        whitespace-pre-line break-words ${pointText}
        hover:scale-[1.01] transition-all`}
      style={{
        ...style,
        fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif",
        letterSpacing: ".01em"
      }}
    >
      <div className="flex items-center">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-white/40 hover:text-white/70 transition-colors mr-1 print:hidden drag-handle-export-hidden"
          title="拖拽排序"
          style={{ display: 'var(--export-mode, block)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      </div>
      <span className={`mr-1.5 font-bold ${config.bodyFont} text-black/10 select-none`}
        style={{ textShadow: "0 1px 6px #fff4" }}>{index + 1}.</span>
      {editingField === 'highlight' && editingIndex === index ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSaveEdit}
          className={`flex-1 ${config.bodyFont} bg-white/80 rounded px-2 py-1 border-2 border-blue-300 
            focus:outline-none resize-none min-h-[2.5rem]`}
          maxLength={160}
          autoFocus
        />
      ) : (
        <span 
          className={`flex-1 block ${config.bodyFont} cursor-pointer hover:bg-white/20 rounded px-2 py-1 
            transition-colors ${onHighlightEdit ? 'hover:ring-2 hover:ring-white/30' : ''}`}
          onClick={() => onHighlightEdit && handleStartEdit('highlight', highlight.content, index)}
          title={onHighlightEdit ? "点击编辑内容" : ""}
        >
          {highlight.content || ""}
        </span>
      )}
    </li>
  );
}

export default CardPreview;

