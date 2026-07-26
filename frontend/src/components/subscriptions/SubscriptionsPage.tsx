import { useFinanceStore } from '../../store/use-finance-store'
import type { Subscription } from '../../store/use-finance-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)
}

function SubCard({ sub, onToggle, index }: { sub: Subscription; onToggle: (id: string) => void; index: number }) {
  const daysUntil = Math.ceil((new Date(sub.nextBilling).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const urgent = sub.active && daysUntil <= 3
  const colors = ['#1431ff', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#ec4899']
  const bgColor = colors[index % colors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-xl p-4 border transition-all ${
        sub.active
          ? 'bg-gray-800/50 border-gray-700/50'
          : 'bg-gray-800/20 border-gray-700/20 opacity-60'
      } ${urgent ? 'border-orange-500/30 ring-1 ring-orange-500/20' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: sub.active ? bgColor : '#374151' }}
        >
          {sub.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{sub.name}</span>
            {urgent && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                {daysUntil} วัน
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {sub.category} — ตัดวันที่ {sub.billingDay}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold">{fmt(sub.amount)}</div>
          <div className="text-[10px] text-gray-500">/เดือน</div>
        </div>
        <button
          onClick={() => onToggle(sub.id)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            sub.active
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          {sub.active ? <BellOff size={16} /> : <Bell size={16} />}
        </button>
      </div>
      {sub.note && sub.active && (
        <div className="text-xs text-gray-500 mt-2 ml-[52px]">{sub.note}</div>
      )}
    </motion.div>
  )
}

export default function SubscriptionsPage() {
  const { subscriptions, toggleSubscription } = useFinanceStore()
  const active = subscriptions.filter((s) => s.active)
  const total = active.reduce((s, sub) => s + sub.amount, 0)

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-1">📋 Subscription</h2>
      <p className="text-xs text-gray-500 mb-4">จัดการแอปที่สมัครไว้ทั้งหมด</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'กำลังใช้', value: `${active.length} รายการ`, color: 'text-primary' },
          { label: 'รวม/เดือน', value: fmt(total), color: 'text-green-400' },
          { label: 'รวม/ปี', value: fmt(total * 12), color: 'text-yellow-400' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-800/30 rounded-xl p-3 text-center border border-gray-700/30">
            <div className="text-[10px] text-gray-500">{item.label}</div>
            <div className={`text-sm font-semibold mt-1 ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <AnimatePresence>
        {subscriptions.map((sub, i) => (
          <div key={sub.id} className="mb-2.5">
            <SubCard sub={sub} onToggle={toggleSubscription} index={i} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
