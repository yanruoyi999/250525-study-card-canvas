import React, { useState } from "react";
import { History, Trash2, Download, Calendar, Hash } from "lucide-react";
import { ColorScheme } from "./ColorSchemeSelect";
import { CardSize } from "./CardSizeSelect";

export type HistoryCard = {
  id: string;
  subject: string;
  date: string;
  highlights: { content: string; id: string }[];
  scheme: ColorScheme;
  cardSize: CardSize;
  createdAt: string;
  nickname?: string;
  avatar?: string;
};

type Props = {
  historyCards: HistoryCard[];
  onLoadCard: (card: HistoryCard) => void;
  onDeleteCard: (id: string) => void;
  onClearHistory: () => void;
};

const schemeLabels = {
  blue: "海洋蓝",
  green: "柔绿",
  pink: "柔粉"
};

const sizeLabels = {
  standard: "标准卡片",
  phone: "手机壁纸", 
  tablet: "平板横屏",
  desktop: "电脑壁纸",
  social: "社交分享"
};

export default function CardHistory({ historyCards, onLoadCard, onDeleteCard, onClearHistory }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
        >
          <History size={18} />
          查看历史卡片 ({historyCards.length})
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-xl border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={20} className="text-gray-600" />
          <span className="font-medium text-gray-800">历史卡片管理</span>
          <span className="text-sm text-gray-500">({historyCards.length} 张)</span>
        </div>
        <div className="flex gap-2">
          {historyCards.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定要清空所有历史卡片吗？此操作不可恢复。')) {
                  onClearHistory();
                }
              }}
              className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
            >
              清空历史
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
          >
            收起
          </button>
        </div>
      </div>

      {historyCards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History size={48} className="mx-auto mb-3 opacity-30" />
          <p>暂无历史卡片</p>
          <p className="text-sm">制作的卡片会自动保存在这里</p>
        </div>
      ) : (
        <div className="grid gap-3 max-h-80 overflow-y-auto">
          {historyCards.slice().reverse().map((card) => (
            <div key={card.id} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {card.avatar && (
                      <img 
                        src={card.avatar} 
                        alt="头像" 
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-800 truncate">
                      {card.subject}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {card.date}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    {card.nickname && (
                      <span>by {card.nickname}</span>
                    )}
                    <span>{schemeLabels[card.scheme]}</span>
                    <span>•</span>
                    <span>{sizeLabels[card.cardSize]}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Hash size={10} />
                      {card.highlights.filter(h => h.content.trim()).length} 条重点
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    保存于 {formatDate(card.createdAt)}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onLoadCard(card)}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    title="加载此卡片"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这张历史卡片吗？')) {
                        onDeleteCard(card.id);
                      }
                    }}
                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    title="删除卡片"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 