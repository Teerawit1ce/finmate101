import { useState, useRef, useEffect } from 'react'
import { useFinanceStore } from '../../store/use-finance-store'
import type { ChatMessage } from '../../store/use-finance-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'

export default function ChatPage() {
  const { messages, addMessage, processChat, setActiveTab } = useFinanceStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend(text: string) {
    if (!text.trim()) return
    setInput('')

    // Add user message
    addMessage({
      id: 'msg-' + Date.now(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    } as ChatMessage)

    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const result = processChat(text.trim())

      if (result.text) {
        addMessage({
          id: 'msg-ai-' + Date.now(),
          role: 'assistant',
          text: result.text,
          actions: result.actions,
          timestamp: Date.now(),
        } as ChatMessage)
      }

      setIsTyping(false)
    }, 800)
  }

  function handleAction(handler: string) {
    if (handler === 'cancel-netflix') {
      const store = useFinanceStore.getState()
      store.cancelSubscription('s1')
    } else if (handler === 'check-balance') {
      const store = useFinanceStore.getState()
      handleSend('เงินจะหมดแล้ว')
    } else if (handler === 'view-subs') {
      setActiveTab('subscriptions')
    } else if (handler === 'view-dashboard') {
      setActiveTab('dashboard')
    } else if (handler === 'view-tx') {
      handleSend('sub')
    } else if (handler === 'quick-log-60') {
      handleSend('กินข้าว 60')
    } else if (handler === 'quick-hello') {
      handleSend('สวัสดี')
    }
  }

  function quickChip(text: string) {
    handleSend(text)
  }

  function renderText(text: string) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          หารเท่า.ai
        </h2>
        <p className="text-xs text-gray-500">AI Agent ผู้ช่วยบริหารเงิน</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold">
                      H
                    </div>
                    <span className="text-xs text-gray-500">หารเท่า.ai</span>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-md'
                      : 'bg-gray-800/80 border border-gray-700/50 rounded-tl-md'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />

                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((action, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(action.handler)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/50 text-primary bg-primary/5 hover:bg-primary/15 transition-colors"
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-primary/60"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-primary/60"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-primary/60"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Chips */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-800/50">
        {['🍜 กินข้าว 60', '💰 เงินจะหมดแล้ว', '📋 sub', '📊 ใช้เงินเปลือง'].map((chip) => (
          <button
            key={chip}
            onClick={() => quickChip(chip.replace(/^[^\s]+\s/, ''))}
            className="px-3 py-1.5 text-xs rounded-full bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:bg-gray-700/60 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 bg-gray-800/80 rounded-xl px-4 py-2 border border-gray-700/50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="พิมพ์รายจ่ายของคุณ..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
