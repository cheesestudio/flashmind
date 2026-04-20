import { useState, useEffect } from 'react'
import { Flashcard } from '../types'

interface SearchBarProps {
  cards: Flashcard[]
  onSearch: (results: Flashcard[]) => void
  placeholder?: string
}

export function SearchBar({ cards, onSearch, placeholder = '搜索卡片...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      onSearch(cards)
      return
    }

    const lowerQuery = query.toLowerCase()
    const results = cards.filter(card =>
      card.front.toLowerCase().includes(lowerQuery) ||
      card.back.toLowerCase().includes(lowerQuery)
    )
    onSearch(results)
  }, [query, cards, onSearch])

  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-green-500 focus:bg-white/20 transition-all"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
