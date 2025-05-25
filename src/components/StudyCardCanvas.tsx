import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Edit2, Trash2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

interface StudyCard {
  id: string
  question: string
  answer: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  x?: number
  y?: number
  isFlipped?: boolean
}

interface StudyCardCanvasProps {
  cards: StudyCard[]
  onUpdateCard: (id: string, updates: Partial<StudyCard>) => void
  onDeleteCard: (id: string) => void
}

export default function StudyCardCanvas({ cards, onUpdateCard, onDeleteCard }: StudyCardCanvasProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = useCallback((e: React.MouseEvent, cardId?: string) => {
    if (cardId) {
      setDraggedCard(cardId)
      setDragStart({
        x: e.clientX - (cards.find(c => c.id === cardId)?.x || 0) * zoom,
        y: e.clientY - (cards.find(c => c.id === cardId)?.y || 0) * zoom
      })
    } else {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [cards, zoom, pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedCard) {
      const card = cards.find(c => c.id === draggedCard)
      if (card) {
        onUpdateCard(draggedCard, {
          x: (e.clientX - dragStart.x) / zoom,
          y: (e.clientY - dragStart.y) / zoom
        })
      }
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [draggedCard, isDragging, dragStart, zoom, cards, onUpdateCard])

  const handleMouseUp = useCallback(() => {
    setDraggedCard(null)
    setIsDragging(false)
  }, [])

  const flipCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      onUpdateCard(cardId, { isFlipped: !card.isFlipped })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-400 bg-green-50'
      case 'medium': return 'border-yellow-400 bg-yellow-50'
      case 'hard': return 'border-red-400 bg-red-50'
      default: return 'border-gray-400 bg-gray-50'
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden border">
      {/* 控制工具栏 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <span className="px-2 py-1 bg-white rounded text-sm font-medium">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Canvas区域 */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* 学习卡片 */}
        {cards.map((card) => (
          <div
            key={card.id}
            className={`absolute cursor-move ${getDifficultyColor(card.difficulty)}`}
            style={{
              left: card.x || 50,
              top: card.y || 50,
              width: '280px',
              transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.3s ease'
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, card.id)
            }}
          >
            <Card className="w-full h-48 shadow-lg hover:shadow-xl transition-shadow border-2">
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {card.category}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        flipCard(card.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingCard(card.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCard(card.id)
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-24 flex items-center justify-center text-center">
                  {card.isFlipped ? (
                    <div className="text-sm text-gray-700" style={{ transform: 'rotateY(180deg)' }}>
                      {card.answer}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {card.question}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  点击 🔄 翻转查看{card.isFlipped ? '问题' : '答案'}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* 说明文字 */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white px-3 py-2 rounded shadow">
        拖拽卡片移动位置 • 点击翻转查看答案 • 滚轮缩放
      </div>
    </div>
  )
} 