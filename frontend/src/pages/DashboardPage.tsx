import { useFinanceStore } from '../store/use-finance-store'
import BalanceCard, { WarningCard, ExpenseBreakdown } from '../components/dashboard/BalanceCard'

export default function DashboardPage() {
  const balance = useFinanceStore((s) => s.balance)
  const recentTx = useFinanceStore((s) => s.transactions.slice(0, 3))

  function fmt(n: number) {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div>
        <h1 className="text-xl font-bold">สวัสดี 👋</h1>
        <p className="text-xs text-gray-500">นี่คือสรุปการเงินของคุณวันนี้</p>
      </div>

      <BalanceCard />
      <WarningCard />
      <ExpenseBreakdown />

      {/* Recent Transactions */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <h3 className="font-medium mb-3 text-sm text-gray-400">💳 รายการล่าสุด</h3>
        <div className="space-y-2">
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div>
                  <div className="text-sm">{tx.description}</div>
                  <div className="text-[10px] text-gray-500">{tx.date}</div>
                </div>
              </div>
              <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
