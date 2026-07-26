import { useFinanceStore } from '../../store/use-finance-store'
import { motion } from 'framer-motion'
import { LayoutDashboard, MessageSquare, Repeat2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import DashboardPage from '../../pages/DashboardPage'
import ChatPage from '../chat/ChatPage'
import SubscriptionsPage from '../subscriptions/SubscriptionsPage'

const tabs = [
  { id: 'dashboard', label: 'ดัชบอร์ด', icon: LayoutDashboard },
  { id: 'chat', label: 'แชท', icon: MessageSquare },
  { id: 'subscriptions', label: 'Subscription', icon: Repeat2 },
]

export default function AppLayout() {
  const { activeTab, setActiveTab } = useFinanceStore()
  const [showMobileNav, setShowMobileNav] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900/50 border-r border-gray-800 p-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
            H
          </div>
          <div>
            <div className="font-semibold text-sm">หารเท่า.ai</div>
            <div className="text-[10px] text-gray-500">HarnTao Finance</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="active-tab" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto text-[10px] text-gray-600 px-2">
          v1.0 · Hackathon Demo
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
              H
            </div>
            <span className="font-semibold text-sm">หารเท่า.ai</span>
          </div>
          <button onClick={() => setShowMobileNav(!showMobileNav)} className="p-1.5">
            {showMobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Nav Overlay */}
        {showMobileNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-2"
          >
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowMobileNav(false) }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <tab.icon size={16} />
                    {tab.label}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'subscriptions' && <SubscriptionsPage />}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex bg-gray-900/95 border-t border-gray-800 backdrop-blur-lg pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${
                activeTab === tab.id ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
