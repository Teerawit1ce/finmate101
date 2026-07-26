import { create } from 'zustand'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
}

export interface Subscription {
  id: string
  name: string
  service: string
  icon: string
  category: string
  amount: number
  billingDay: number
  nextBilling: string
  active: boolean
  note?: string
}

export interface ChatAction {
  label: string
  handler: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  actions?: ChatAction[]
  timestamp: number
}

interface FinanceStore {
  balance: number
  monthlyIncome: number
  subscriptions: Subscription[]
  transactions: Transaction[]
  messages: ChatMessage[]
  activeTab: string

  setActiveTab: (tab: string) => void
  deductExpense: (amount: number, description: string, category?: string) => void
  addIncome: (amount: number, description: string) => void
  toggleSubscription: (id: string) => void
  cancelSubscription: (id: string) => void
  addMessage: (msg: ChatMessage) => void
  processChat: (text: string) => { text: string; actions?: ChatAction[] }
  unsubscribedNetflix: boolean
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function fmt(n: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  balance: 4500,
  monthlyIncome: 12000,
  unsubscribedNetflix: false,
  activeTab: 'dashboard',

  setActiveTab: (tab) => set({ activeTab: tab }),

  subscriptions: [
    { id: 's1', name: 'Netflix Premium', service: 'Netflix', icon: 'N', category: 'บันเทิง', amount: 419, billingDay: 26, nextBilling: '2026-07-26', active: true, note: 'ไม่ได้เปิดดูมา 2 เดือนแล้ว' },
    { id: 's2', name: 'Spotify Premium', service: 'Spotify', icon: 'S', category: 'ดนตรี', amount: 139, billingDay: 10, nextBilling: '2026-08-10', active: true },
    { id: 's3', name: 'ChatGPT Plus', service: 'OpenAI', icon: 'C', category: 'เครื่องมือ', amount: 750, billingDay: 20, nextBilling: '2026-08-20', active: true },
    { id: 's4', name: 'iCloud+ 200GB', service: 'Apple', icon: 'A', category: 'เครื่องมือ', amount: 99, billingDay: 15, nextBilling: '2026-08-15', active: true },
    { id: 's5', name: 'YouTube Premium', service: 'YouTube', icon: 'Y', category: 'บันเทิง', amount: 159, billingDay: 5, nextBilling: '2026-08-05', active: true },
  ],

  transactions: [
    { id: 'tx1', type: 'income', category: 'เงินเดือน', amount: 11000, description: 'ค่าขนมจากที่บ้าน', date: '2026-07-20' },
    { id: 'tx2', type: 'expense', category: 'อาหาร', amount: 180, description: 'กินหมูกระทะหารกับเพื่อน', date: '2026-07-24' },
    { id: 'tx3', type: 'expense', category: 'เดินทาง', amount: 85, description: 'BTS ไปมหาลัย', date: '2026-07-24' },
    { id: 'tx4', type: 'expense', category: 'อาหาร', amount: 60, description: 'ข้าวผัดกระเพรา', date: '2026-07-25' },
    { id: 'tx5', type: 'expense', category: 'ช้อปปิ้ง', amount: 250, description: 'ซื้อเสื้อมือสอง', date: '2026-07-23' },
  ],

  messages: [
    {
      id: 'msg-init',
      role: 'assistant',
      text: '👋 สวัสดี! ฉันคือ **หารเท่า.ai** ผู้ช่วยบริหารเงินของคุณ\n\nลองพิมพ์ "สวัสดี" เพื่อเริ่ม หรือพิมพ์รายจ่าย เช่น "กินข้าว 60"',
      timestamp: Date.now() - 60000,
    },
    {
      id: 'msg-demo-user',
      role: 'user',
      text: 'เงินจะหมดแล้ว 😭',
      timestamp: Date.now() - 30000,
    },
    {
      id: 'msg-demo-ai',
      role: 'assistant',
      text: 'ใจเย็นๆ นะ! 😊\n\nพรุ่งนี้คุณมีคิวโดนตัดค่า **Netflix 419 บาท** แต่ฉันเช็กพบว่าคุณไม่ได้เปิดดูมา 2 เดือนแล้ว ยกเลิกเลยไหม? จะได้ประหยัดเงิน!',
      actions: [{ label: 'ยกเลิก Netflix', handler: 'cancel-netflix' }],
      timestamp: Date.now() - 20000,
    },
  ],

  deductExpense: (amount, description, category = 'อื่นๆ') => {
    set((s) => ({
      balance: s.balance - amount,
      transactions: [{ id: 'tx_' + Date.now(), type: 'expense' as const, category, amount, description, date: today() }, ...s.transactions],
    }))
  },

  addIncome: (amount, description) => {
    set((s) => ({
      balance: s.balance + amount,
      transactions: [{ id: 'tx_' + Date.now(), type: 'income' as const, category: 'อื่นๆ', amount, description, date: today() }, ...s.transactions],
    }))
  },

  toggleSubscription: (id) => {
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, active: !sub.active } : sub
      ),
    }))
  },

  cancelSubscription: (id) => {
    const state = get()
    const sub = state.subscriptions.find((s) => s.id === id)
    if (!sub || !sub.active) return

    set((s) => ({
      subscriptions: s.subscriptions.map((s) => (s.id === id ? { ...s, active: false } : s)),
      balance: s.balance + sub.amount,
      unsubscribedNetflix: true,
    }))

    const updated = get()
    updated.addMessage({
      id: 'msg-cancel-' + Date.now(),
      role: 'assistant',
      text: `✅ **ยกเลิก ${sub.name} เรียบร้อย!** 🎉\n\nคุณได้เงินคืน **${fmt(sub.amount)}** บาท เข้าบัญชีเรียบร้อย!\n\n**ยอดคงเหลือปัจจุบัน:** ${fmt(updated.balance)} บาท\n\nเหลือไปกินหมูกระทะเพิ่มอีก **${fmt(sub.amount)}** บาทเลย! 🔥`,
      timestamp: Date.now(),
    })
  },

  addMessage: (msg) => {
    set((s) => ({ messages: [...s.messages, msg] }))
  },

  processChat: (text: string) => {
    const state = get()
    const lower = text.toLowerCase().trim()

    // Cancel netflix
    if (lower.includes('ยกเลิก') && (lower.includes('netflix') || lower.includes('เน็ตฟลิก'))) {
      state.cancelSubscription('s1')
      return { text: '', actions: [] }
    }

    // Expense logging: "กินข้าว 60"
    const expenseMatch = lower.match(/(.+?)\s*(\d+)\s*บาท?$/)
    if (expenseMatch) {
      const item = expenseMatch[1].trim()
      const amt = parseInt(expenseMatch[2])
      state.deductExpense(amt, item)
      return {
        text: `✅ **บันทึกค่าใช้จ่ายแล้ว!**\n\n${item} ${fmt(amt)} — บันทึกเรียบร้อย!\n💰 **ยอดคงเหลือ:** ${fmt(get().balance)}`,
        actions: [{ label: '💰 เช็คเงิน', handler: 'check-balance' }],
      }
    }

    // Just a number
    const numMatch = lower.match(/^(\d+)$/)
    if (numMatch) {
      const amt = parseInt(numMatch[1])
      state.deductExpense(amt, 'ค่าใช้จ่าย')
      return {
        text: `✅ บันทึกค่าใช้จ่าย ${fmt(amt)} เรียบร้อย!\n💰 **ยอดคงเหลือ:** ${fmt(state.balance)}`,
        actions: [],
      }
    }

    // "เงินจะหมดแล้ว"
    if (lower.includes('เงินจะหมด') || lower.includes('เงินหมด') || lower.includes('ตังหมด')) {
      const netflix = state.subscriptions.find((s) => s.id === 's1')
      const totalExpense = state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const subsTotal = state.subscriptions.filter((s) => s.active).reduce((s, sub) => s + sub.amount, 0)

      let msg = `💰 **สรุปสถานะการเงินของคุณ**\n\n💸 **ยอดคงเหลือ:** ${fmt(state.balance)}\n📋 **รายจ่ายเดือนนี้:** ${fmt(totalExpense)}\n\n`

      if (netflix?.active && daysUntil(netflix.nextBilling) <= 1) {
        msg += `🔴 **⚠️ พรุ่งนี้ (${netflix.nextBilling}) มีตัดค่า ${netflix.name} ${fmt(netflix.amount)}!**\nฉันเช็กพบว่าคุณไม่ได้เปิดดูมา 2 เดือนแล้ว — ยกเลิกเลยไหม?\n\n`
      }

      msg += `📋 **Subscription ที่ Active:** ${state.subscriptions.filter(s => s.active).length} รายการ\n💰 **รวม:** ${fmt(subsTotal)}/เดือน`

      const actions: { label: string; handler: string }[] = []
      if (netflix?.active && daysUntil(netflix.nextBilling) <= 1) {
        actions.push({ label: '❌ ยกเลิก Netflix', handler: 'cancel-netflix' })
      }
      actions.push({ label: '📋 ดูทั้งหมด', handler: 'view-subs' })

      return { text: msg, actions }
    }

    // "sub" | "subscription"
    if (lower.includes('sub') || lower.includes('ซับ') || lower.includes('รายเดือน')) {
      const active = state.subscriptions.filter((s) => s.active)
      const total = active.reduce((s, sub) => s + sub.amount, 0)
      let msg = '📋 **Subscription ของคุณ:**\n\n'
      active.forEach((s) => {
        const due = daysUntil(s.nextBilling)
        const warn = due <= 3 ? ' ⚠️ กำลังจะตัด!' : ''
        msg += `• **${s.name}** — ${fmt(s.amount)}/ด (ถึง ${s.nextBilling})${warn}\n`
      })
      const inactive = state.subscriptions.filter((s) => !s.active)
      if (inactive.length > 0) {
        msg += `\n🔴 **ยกเลิกแล้ว:**\n`
        inactive.forEach((s) => { msg += `• ${s.name}\n` })
      }
      msg += `\n💰 **รวม: ${fmt(total)}/เดือน**`
      return { text: msg, actions: [{ label: '📋 จัดการ', handler: 'view-subs' }] }
    }

    // "ใช้เงินเปลือง" | "วิเคราะห์"
    if (lower.includes('เปลือง') || lower.includes('วิเคราะห์') || lower.includes('ใช้เงิน')) {
      const cats: Record<string, number> = {}
      state.transactions.filter((t) => t.type === 'expense').forEach((t) => {
        cats[t.category] = (cats[t.category] || 0) + t.amount
      })
      const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1])
      let msg = '📊 **วิเคราะห์ค่าใช้จ่าย**\n\n'
      sorted.forEach(([cat, amt]) => {
        msg += `• **${cat}** — ${fmt(amt)}\n`
      })
      if (sorted.length > 0) {
        msg += `\n💡 **คำแนะนำ:**\n• หมวด **${sorted[0][0]}** ใช้เงินเยอะที่สุด — ${fmt(sorted[0][1])}\n• ถ้าลดกินนอกบ้าน 2 มื้อ/สัปดาห์ → ประหยัด ~600/เดือน\n• เช็ค Subscription ที่ไม่จำเป็น`
      }
      return { text: msg, actions: [{ label: '📊 ดูดัชบอร์ด', handler: 'view-dashboard' }] }
    }

    // "สวัสดี" / "hello"
    if (lower.includes('สวัสดี') || lower.includes('หวัดดี') || lower.includes('hi') || lower.includes('hello')) {
      return {
        text: `สวัสดี! 👋\n\nฉันคือ **หารเท่า.ai** 🤖 ผู้ช่วยบริหารเงินของคุณ\n\n**สิ่งที่ฉันช่วยได้:**\n• 💰 บันทึกรายจ่าย — พิมพ์ "กินข้าว 60"\n• 📋 เช็ค Subscription — พิมพ์ "sub"\n• ⚠️ เตือนก่อนตัดเงิน — พิมพ์ "เงินจะหมดแล้ว"\n• 📊 วิเคราะห์ค่าใช้จ่าย — พิมพ์ "ใช้เงินเปลือง"`,
        actions: [
          { label: '💰 "เงินจะหมดแล้ว"', handler: 'check-balance' },
          { label: '📋 "sub"', handler: 'view-subs' },
          { label: '🍜 "กินข้าว 60"', handler: 'quick-log-60' },
        ],
      }
    }

    // Fallback
    return {
      text: `ไม่แน่ใจว่าต้องการให้ช่วยอะไร 🙏\n\nลองพิมพ์:\n• "สวัสดี"\n• "กินข้าว 60"\n• "sub"\n• "เงินจะหมดแล้ว"\n• "ใช้เงินเปลือง"`,
      actions: [
        { label: '💬 "สวัสดี"', handler: 'quick-hello' },
        { label: '💰 "เงินจะหมดแล้ว"', handler: 'check-balance' },
      ],
    }
  },
}))
