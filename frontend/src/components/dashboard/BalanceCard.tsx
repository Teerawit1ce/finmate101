import { useFinanceStore } from '../../store/use-finance-store'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)
}

export default function BalanceCard() {
  const balance = useFinanceStore((s) => s.balance)
  const tx = useFinanceStore((s) => s.transactions)
  const income = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-5 text-white shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <Wallet size={18} />
        <span className="text-sm opacity-80">ยอดคงเหลือ</span>
      </div>
      <div className="text-4xl font-bold mb-4">{fmt(balance)}</div>
      <div className="flex gap-6">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-green-300" />
          <span className="text-sm">{fmt(income)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown size={14} className="text-red-300" />
          <span className="text-sm">{fmt(expense)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export function WarningCard() {
  const subs = useFinanceStore((s) => s.subscriptions)
  const netflix = subs.find((s) => s.id === 's1')

  if (!netflix?.active) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3"
    >
      <AlertTriangle size={20} className="text-orange-400 shrink-0 mt-0.5" />
      <div>
        <div className="font-medium text-orange-400">⚠️ พรุ่งนี้มีตัดค่าใช้จ่าย!</div>
        <div className="text-sm text-gray-400 mt-0.5">
          <strong className="text-white">Netflix Premium</strong> {fmt(netflix.amount)} — กำลังจะตัดวันที่ {netflix.nextBilling}
        </div>
      </div>
    </motion.div>
  )
}

export function ExpenseBreakdown() {
  const tx = useFinanceStore((s) => s.transactions)
  const cats: Record<string, number> = {}
  tx.filter((t) => t.type === 'expense').forEach((t) => {
    cats[t.category] = (cats[t.category] || 0) + t.amount
  })
  const total = Object.values(cats).reduce((s, a) => s + a, 0)
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1])

  const COLORS = ['#1431ff', '#059669', '#d97706', '#dc2626', '#8b5cf6']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
    >
      <h3 className="font-medium mb-3 text-sm text-gray-400">📊 สัดส่วนค่าใช้จ่าย</h3>
      <div className="flex gap-3 mb-4">
        {sorted.map(([cat, amt], i) => {
          const pct = total > 0 ? Math.round((amt / total) * 100) : 0
          return (
            <div
              key={cat}
              className="h-2 rounded-full flex-1 transition-all"
              style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length], opacity: 0.7 + (pct / 100) * 0.3 }}
              title={`${cat}: ${pct}%`}
            />
          )
        })}
      </div>
      <div className="space-y-2">
        {sorted.map(([cat, amt], i) => (
          <div key={cat} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span>{cat}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">{total > 0 ? Math.round((amt / total) * 100) : 0}%</span>
              <span className="font-medium">{fmt(amt)}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
