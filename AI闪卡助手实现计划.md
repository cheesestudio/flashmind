# AI 闪卡助手实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 AI 闪卡助手网页应用，支持 AI 自动生成闪卡和智能复习计划

**Architecture:** 单页应用 (SPA)，React + TypeScript + Tailwind CSS，数据存储在浏览器 localStorage

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, OpenAI/Claude API

---

## 文件结构

```
/src
  /components        # React 组件
    Header.tsx       # 顶部导航
    CardLibrary.tsx  # 卡库列表
    CardEditor.tsx   # 卡片编辑器
    StudyMode.tsx    # 学习模式
    AIGenerator.tsx  # AI 生成面板
  /hooks              # 自定义 Hooks
    useFlashcards.ts # 闪卡数据管理
    useAI.ts          # AI API 调用
  /types              # TypeScript 类型
    index.ts
  /utils              # 工具函数
    storage.ts        # localStorage 封装
    spacedReview.ts   # 艾宾浩斯遗忘曲线
  App.tsx             # 主应用
  main.tsx            # 入口文件
index.html
```

---

## Task 1: 初始化项目

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "flashmind",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: 创建 TypeScript 配置**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: 创建 Tailwind 配置**

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 5: 创建 PostCSS 配置**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: 创建入口 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 闪卡大师</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 创建 CSS 文件**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 8: 创建 main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 9: 创建 App.tsx 骨架**

```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-4">
        <CardLibrary />
      </main>
    </div>
  )
}

export default App
```

- [ ] **Step 10: 安装依赖并验证构建**

Run: `npm install`
Expected: 安装成功，无错误

Run: `npm run build`
Expected: 构建成功

---

## Task 2: 创建类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 定义闪卡类型**

```typescript
export interface Flashcard {
  id: string
  front: string      // 问题/正面
  back: string       // 答案/背面
  createdAt: number
  nextReviewAt: number  // 下次复习时间
  interval: number       // 间隔天数
  easeFactor: number     // 难度因子
}

export interface CardLibrary {
  id: string
  name: string
  description?: string
  cards: Flashcard[]
  createdAt: number
  updatedAt: number
}

export interface StudyRecord {
  libraryId: string
  cardId: string
  reviewedAt: number
  quality: 'again' | 'hard' | 'good' | 'easy'
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: 初始化项目并添加类型定义"
```

---

## Task 3: 实现本地存储工具

**Files:**
- Create: `src/utils/storage.ts`

- [ ] **Step 1: 实现存储函数**

```typescript
import { CardLibrary } from '../types'

const STORAGE_KEY = 'flashmind_libraries'

export function getLibraries(): CardLibrary[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveLibraries(libraries: CardLibrary[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libraries))
}

export function getLibrary(id: string): CardLibrary | undefined {
  const libraries = getLibraries()
  return libraries.find(lib => lib.id === id)
}

export function createLibrary(name: string, description?: string): CardLibrary {
  const library: CardLibrary = {
    id: crypto.randomUUID(),
    name,
    description,
    cards: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const libraries = getLibraries()
  libraries.push(library)
  saveLibraries(libraries)
  return library
}

export function updateLibrary(id: string, updates: Partial<CardLibrary>): CardLibrary | null {
  const libraries = getLibraries()
  const index = libraries.findIndex(lib => lib.id === id)
  if (index === -1) return null

  libraries[index] = { ...libraries[index], ...updates, updatedAt: Date.now() }
  saveLibraries(libraries)
  return libraries[index]
}

export function deleteLibrary(id: string): boolean {
  const libraries = getLibraries()
  const filtered = libraries.filter(lib => lib.id !== id)
  if (filtered.length === libraries.length) return false

  saveLibraries(filtered)
  return true
}

export function exportLibrary(library: CardLibrary): string {
  return JSON.stringify(library, null, 2)
}

export function importLibrary(json: string): CardLibrary | null {
  try {
    const data = JSON.parse(json)
    if (!data.name || !Array.isArray(data.cards)) return null
    return {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: data.cards.map((c: any) => ({
        ...c,
        id: c.id || crypto.randomUUID(),
        createdAt: c.createdAt || Date.now()
      }))
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/storage.ts
git commit -m "feat: 实现本地存储工具"
```

---

## Task 4: 实现艾宾浩斯遗忘曲线

**Files:**
- Create: `src/utils/spacedReview.ts`

- [ ] **Step 1: 实现复习算法**

```typescript
import { Flashcard } from '../types'

// 质量评分: again=0, hard=1, good=2, easy=3
const QUALITY_INTERVALS = {
  again: 0,      // 立即复习
  hard: 1,      // 1天后
  good: 3,      // 3天后（基础间隔）
  easy: 7       // 7天后
}

export function calculateNextReview(
  card: Flashcard,
  quality: 'again' | 'hard' | 'good' | 'easy'
): Flashcard {
  const now = Date.now()
  let newInterval: number
  let newEaseFactor = card.easeFactor || 2.5

  if (quality === 'again') {
    // 忘记 - 重置间隔
    newInterval = 1
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2)
  } else {
    // 根据当前间隔和难度因子计算新间隔
    const baseInterval = card.interval || 1
    const multiplier = quality === 'easy' ? 1.3 : quality === 'hard' ? 1.2 : 1.0
    newInterval = Math.round(baseInterval * newEaseFactor * multiplier)
    newEaseFactor = quality === 'easy' 
      ? newEaseFactor + 0.15 
      : quality === 'hard' 
        ? newEaseFactor - 0.15 
        : newEaseFactor
    newEaseFactor = Math.max(1.3, Math.min(2.5, newEaseFactor))
  }

  // 基础间隔（天）转换为毫秒
  const intervalMs = newInterval * 24 * 60 * 60 * 1000

  return {
    ...card,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewAt: now + intervalMs
  }
}

export function getCardsDueForReview(cards: Flashcard[]): Flashcard[] {
  const now = Date.now()
  return cards
    .filter(card => card.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
}

export function formatNextReview(interval: number): string {
  if (interval === 0) return '立即'
  if (interval === 1) return '1天'
  if (interval < 7) return `${interval}天`
  if (interval < 30) return `${Math.round(interval / 7)}周`
  return `${Math.round(interval / 30)}月`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/spacedReview.ts
git commit -m "feat: 实现艾宾浩斯遗忘曲线算法"
```

---

## Task 5: 创建自定义 Hooks

**Files:**
- Create: `src/hooks/useFlashcards.ts`
- Create: `src/hooks/useAI.ts`

- [ ] **Step 1: 实现 useFlashcards Hook**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { CardLibrary, Flashcard } from '../types'
import * as storage from '../utils/storage'
import { calculateNextReview, getCardsDueForReview } from '../utils/spacedReview'

export function useFlashcards() {
  const [libraries, setLibraries] = useState<CardLibrary[]>([])
  const [currentLibrary, setCurrentLibrary] = useState<CardLibrary | null>(null)

  useEffect(() => {
    setLibraries(storage.getLibraries())
  }, [])

  const createLibrary = useCallback((name: string, description?: string) => {
    const lib = storage.createLibrary(name, description)
    setLibraries(prev => [...prev, lib])
    return lib
  }, [])

  const updateLibrary = useCallback((id: string, updates: Partial<CardLibrary>) => {
    const updated = storage.updateLibrary(id, updates)
    if (updated) {
      setLibraries(prev => prev.map(lib => lib.id === id ? updated : lib))
      if (currentLibrary?.id === id) {
        setCurrentLibrary(updated)
      }
    }
    return updated
  }, [currentLibrary])

  const deleteLibrary = useCallback((id: string) => {
    if (storage.deleteLibrary(id)) {
      setLibraries(prev => prev.filter(lib => lib.id !== id))
      if (currentLibrary?.id === id) {
        setCurrentLibrary(null)
      }
    }
  }, [currentLibrary])

  const addCard = useCallback((libraryId: string, front: string, back: string) => {
    const card: Flashcard = {
      id: crypto.randomUUID(),
      front,
      back,
      createdAt: Date.now(),
      nextReviewAt: Date.now(),
      interval: 0,
      easeFactor: 2.5
    }
    const lib = storage.getLibrary(libraryId)
    if (lib) {
      lib.cards.push(card)
      storage.updateLibrary(libraryId, { cards: lib.cards })
      setLibraries(storage.getLibraries())
      if (currentLibrary?.id === libraryId) {
        setCurrentLibrary(lib)
      }
    }
    return card
  }, [currentLibrary])

  const reviewCard = useCallback((libraryId: string, cardId: string, quality: 'again' | 'hard' | 'good' | 'easy') => {
    const lib = storage.getLibrary(libraryId)
    if (!lib) return

    const cardIndex = lib.cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    const updatedCard = calculateNextReview(lib.cards[cardIndex], quality)
    lib.cards[cardIndex] = updatedCard
    storage.updateLibrary(libraryId, { cards: lib.cards })
    setLibraries(storage.getLibraries())
    if (currentLibrary?.id === libraryId) {
      setCurrentLibrary(lib)
    }
  }, [currentLibrary])

  const getDueCards = useCallback((libraryId: string) => {
    const lib = storage.getLibrary(libraryId)
    return lib ? getCardsDueForReview(lib.cards) : []
  }, [])

  const importLibrary = useCallback((json: string) => {
    const lib = storage.importLibrary(json)
    if (lib) {
      const libraries = storage.getLibraries()
      libraries.push(lib)
      storage.saveLibraries(libraries)
      setLibraries(libraries)
      return lib
    }
    return null
  }, [])

  return {
    libraries,
    currentLibrary,
    setCurrentLibrary,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    addCard,
    reviewCard,
    getDueCards,
    importLibrary
  }
}
```

- [ ] **Step 2: 实现 useAI Hook**

```typescript
import { useState, useCallback } from 'react'
import { Flashcard } from '../types'

// AI 生成 API 配置
const API_URL = 'https://api.openai.com/v1/chat/completions'
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

interface GenerateOptions {
  text: string
  count?: number
  apiKey?: string
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCards = useCallback(async ({ text, count = 5, apiKey = API_KEY }: GenerateOptions): Promise<Flashcard[]> => {
    if (!text.trim()) {
      setError('请输入要生成卡片的文本')
      return []
    }

    if (!apiKey) {
      setError('请配置 OpenAI API Key')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个闪卡生成助手。根据用户提供的文本，生成问答卡片。'
            },
            {
              role: 'user',
              content: `请根据以下文本生成 ${count} 个问答卡片（JSON数组格式）。每个卡片包含 question 和 answer 字段。\n\n文本内容：\n${text}`
            }
          ],
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      // 解析 JSON
      const cardsData = JSON.parse(content)

      // 转换为 Flashcard 格式
      const now = Date.now()
      const cards: Flashcard = cardsData.map((item: any, index: number) => ({
        id: crypto.randomUUID(),
        front: item.question || item.q || '',
        back: item.answer || item.a || '',
        createdAt: now + index,
        nextReviewAt: now,
        interval: 0,
        easeFactor: 2.5
      }))

      return cards
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { generateCards, loading, error }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFlashcards.ts src/hooks/useAI.ts
git commit -m "feat: 添加自定义 Hooks"
```

---

## Task 6: 创建 UI 组件 - Header

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: 实现 Header 组件**

```typescript
interface HeaderProps {
  onHome: () => void
  libraryName?: string
}

export function Header({ onHome, libraryName }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={onHome}
          className="text-xl font-bold text-gray-800 hover:text-blue-600 transition"
        >
          🧠 AI 闪卡大师
        </button>
        {libraryName && (
          <span className="text-gray-500">{libraryName}</span>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: 添加 Header 组件"
```

---

## Task 7: 创建 UI 组件 - 卡库列表

**Files:**
- Create: `src/components/CardLibrary.tsx`

- [ ] **Step 1: 实现 CardLibrary 组件**

```typescript
import { CardLibrary } from '../types'

interface CardLibraryProps {
  libraries: CardLibrary[]
  onSelect: (lib: CardLibrary) => void
  onCreate: (name: string, description?: string) => void
  onDelete: (id: string) => void
  onImport: () => void
}

export function CardLibrary({ 
  libraries, 
  onSelect, 
  onCreate, 
  onDelete,
  onImport 
}: CardLibraryProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      setShowForm(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">我的卡库</h2>
        <div className="space-x-2">
          <button
            onClick={onImport}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            导入
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? '取消' : '新建卡库'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="卡库名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              创建
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {libraries.map((lib) => (
          <div
            key={lib.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
            onClick={() => onSelect(lib)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{lib.name}</h3>
                {lib.description && (
                  <p className="text-gray-500 text-sm mt-1">{lib.description}</p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  {lib.cards.length} 张卡片
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('确定删除这个卡库吗？')) {
                    onDelete(lib.id)
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {libraries.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <p>还没有卡库，点击"新建卡库"开始</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CardLibrary.tsx
git commit -m "feat: 添加卡库列表组件"
```

---

## Task 8: 创建 UI 组件 - 卡片编辑 & AI 生成

**Files:**
- Create: `src/components/CardEditor.tsx`
- Create: `src/components/AIGenerator.tsx`

- [ ] **Step 1: 实现 CardEditor 组件**

```typescript
import { useState } from 'react'
import { Flashcard } from '../types'

interface CardEditorProps {
  cards: Flashcard[]
  onAddCard: (front: string, back: string) => void
  onDeleteCard: (id: string) => void
  onEditCard: (id: string, front: string, back: string) => void
  onBack: () => void
}

export function CardEditor({ 
  cards, 
  onAddCard, 
  onDeleteCard,
  onEditCard,
  onBack 
}: CardEditorProps) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      onAddCard(front.trim(), back.trim())
      setFront('')
      setBack('')
    }
  }

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id)
    setEditFront(card.front)
    setEditBack(card.back)
  }

  const saveEdit = () => {
    if (editingId && editFront.trim() && editBack.trim()) {
      onEditCard(editingId, editFront.trim(), editBack.trim())
      setEditingId(null)
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-700 transition"
      >
        ← 返回卡库列表
      </button>

      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold mb-3">添加新卡片</h3>
        <div className="space-y-3">
          <textarea
            placeholder="问题/正面"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={2}
          />
          <textarea
            placeholder="答案/背面"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={2}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            添加卡片
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="p-4 bg-white rounded-lg shadow">
            {editingId === card.id ? (
              <div className="space-y-2">
                <textarea
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <div className="space-x-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <div className="flex-1">
                  <p className="font-medium">Q: {card.front}</p>
                  <p className="text-gray-600 mt-1">A: {card.back}</p>
                </div>
                <div className="space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(card)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDeleteCard(card.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>还没有卡片，添加一张开始学习</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 实现 AIGenerator 组件**

```typescript
import { useState } from 'react'
import { Flashcard } from '../types'
import { useAI } from '../hooks/useAI'

interface AIGeneratorProps {
  onGenerate: (cards: Flashcard[]) => void
  onClose: () => void
}

export function AIGenerator({ onGenerate, onClose }: AIGeneratorProps) {
  const [text, setText] = useState('')
  const [count, setCount] = useState(5)
  const [apiKey, setApiKey] = useState('')
  const { generateCards, loading, error } = useAI()

  const handleGenerate = async () => {
    const cards = await generateCards({ text, count, apiKey })
    if (cards.length > 0) {
      onGenerate(cards)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">AI 生成闪卡</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              可在环境变量 VITE_OPENAI_API_KEY 配置
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生成数量
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value={3}>3 张</option>
              <option value={5}>5 张</option>
              <option value={10}>10 张</option>
              <option value={20}>20 张</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文本内容
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴你要学习的文本内容..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
          >
            {loading ? '生成中...' : '🎲 AI 生成闪卡'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CardEditor.tsx src/components/AIGenerator.tsx
git commit -m "feat: 添加卡片编辑和AI生成组件"
```

---

## Task 9: 创建 UI 组件 - 学习模式

**Files:**
- Create: `src/components/StudyMode.tsx`

- [ ] **Step 1: 实现 StudyMode 组件**

```typescript
import { useState } from 'react'
import { Flashcard } from '../types'
import { formatNextReview } from '../utils/spacedReview'

interface StudyModeProps {
  cards: Flashcard[]
  onReview: (cardId: string, quality: 'again' | 'hard' | 'good' | 'easy') => void
  onBack: () => void
}

export function StudyMode({ cards, onReview, onBack }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">今天没有需要复习的卡片！</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          返回
        </button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  const handleReview = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    onReview(currentCard.id, quality)
    setReviewed(prev => prev + 1)
    setShowAnswer(false)

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      alert(`恭喜完成今日学习！共复习 ${reviewed + 1} 张卡片`)
      onBack()
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 退出学习
        </button>
        <span className="text-gray-500">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* 卡片 */}
      <div
        onClick={() => setShowAnswer(!showAnswer)}
        className="min-h-[300px] bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center cursor-pointer transition hover:shadow-xl"
      >
        <p className="text-lg text-center mb-4">{currentCard.front}</p>
        
        {showAnswer && (
          <div className="w-full border-t pt-4 mt-4">
            <p className="text-gray-600 text-center">{currentCard.back}</p>
          </div>
        )}

        {!showAnswer && (
          <p className="text-gray-400 text-sm">点击显示答案</p>
        )}
      </div>

      {/* 评分按钮 */}
      {showAnswer && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          <button
            onClick={() => handleReview('again')}
            className="py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            😵 忘记
            <span className="block text-xs">1天后</span>
          </button>
          <button
            onClick={() => handleReview('hard')}
            className="py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
          >
            🤔 困难
            <span className="block text-xs">1天后</span>
          </button>
          <button
            onClick={() => handleReview('good')}
            className="py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
          >
            😊 良好
            <span className="block text-xs">3天后</span>
          </button>
          <button
            onClick={() => handleReview('easy')}
            className="py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            😎 简单
            <span className="block text-xs">7天后</span>
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StudyMode.tsx
git commit -m "feat: 添加学习模式组件"
```

---

## Task 10: 整合 App 组件

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新 App.tsx**

```typescript
import { useState } from 'react'
import { Header } from './components/Header'
import { CardLibrary } from './components/CardLibrary'
import { CardEditor } from './components/CardEditor'
import { StudyMode } from './components/StudyMode'
import { AIGenerator } from './components/AIGenerator'
import { useFlashcards } from './hooks/useFlashcards'
import { CardLibrary as CardLibraryType, Flashcard } from './types'

type View = 'list' | 'editor' | 'study'

function App() {
  const {
    libraries,
    currentLibrary,
    setCurrentLibrary,
    createLibrary,
    deleteLibrary,
    addCard,
    reviewCard,
    getDueCards,
    importLibrary
  } = useFlashcards()

  const [view, setView] = useState<View>('list')
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const handleSelectLibrary = (lib: CardLibraryType) => {
    setCurrentLibrary(lib)
    setView('editor')
  }

  const handleStudy = () => {
    setView('study')
  }

  const handleBack = () => {
    setView('list')
    setCurrentLibrary(null)
  }

  const handleAddCards = (cards: Flashcard[]) => {
    if (currentLibrary) {
      cards.forEach(card => {
        addCard(currentLibrary.id, card.front, card.back)
      })
      setShowAIGenerator(false)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const lib = importLibrary(text)
        if (lib) {
          alert(`成功导入: ${lib.name}`)
        } else {
          alert('导入失败，请检查文件格式')
        }
      }
    }
    input.click()
  }

  const dueCards = currentLibrary ? getDueCards(currentLibrary.id) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onHome={handleBack} 
        libraryName={currentLibrary?.name}
      />
      
      <main className="container mx-auto px-4 py-6">
        {view === 'list' && (
          <CardLibrary
            libraries={libraries}
            onSelect={handleSelectLibrary}
            onCreate={createLibrary}
            onDelete={deleteLibrary}
            onImport={handleImport}
          />
        )}

        {view === 'editor' && currentLibrary && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{currentLibrary.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                >
                  🤖 AI 生成
                </button>
                <button
                  onClick={handleStudy}
                  disabled={dueCards.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  📖 开始学习 ({dueCards.length})
                </button>
              </div>
            </div>
            
            <CardEditor
              cards={currentLibrary.cards}
              onAddCard={(front, back) => addCard(currentLibrary.id, front, back)}
              onDeleteCard={(id) => {
                const updated = currentLibrary.cards.filter(c => c.id !== id)
                setCurrentLibrary({ ...currentLibrary, cards: updated })
              }}
              onEditCard={(id, front, back) => {
                const updated = currentLibrary.cards.map(c => 
                  c.id === id ? { ...c, front, back } : c
                )
                setCurrentLibrary({ ...currentLibrary, cards: updated })
              }}
              onBack={handleBack}
            />
          </div>
        )}

        {view === 'study' && currentLibrary && (
          <StudyMode
            cards={dueCards}
            onReview={(cardId, quality) => reviewCard(currentLibrary.id, cardId, quality)}
            onBack={() => setView('editor')}
          />
        )}
      </main>

      {showAIGenerator && (
        <AIGenerator
          onGenerate={handleAddCards}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  )
}

export default App
```

- [ ] **Step 2: 添加 useState 导入**

在文件顶部确保有 `import { useState } from 'react'`

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: 整合所有组件到App"
```

---

## Task 11: 添加环境变量示例

**Files:**
- Create: `.env.example`

- [ ] **Step 1: 创建环境变量示例文件**

```
# OpenAI API Key (可选)
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: 添加环境变量示例"
```

---

## Task 12: 构建并部署

- [ ] **Step 1: 本地构建测试**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 2: 部署到 Vercel**

1. 将代码推送到 GitHub
2. 访问 https://vercel.com
3. 导入项目，点击 Deploy

- [ ] **Step 3: 最终 Commit**

```bash
git add .
git commit -m "feat: 完成 AI 闪卡助手 v1.0"
git push
```

---

## 验证方式

1. 打开部署的网站
2. 创建新卡库
3. 添加手动卡片
4. 测试学习模式
5. （可选）配置 API Key 测试 AI 生成

---

**Plan complete and saved to `C:\Users\ghr13\Desktop\AI闪卡助手实现计划.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
