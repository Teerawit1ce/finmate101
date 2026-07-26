import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, p, _) {
        final cats = p.expenseByCategory.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
        final catTotal = cats.fold(0.0, (sum, e) => sum + e.value);
        final recent = p.recentTransactions;
        final colors = [AppTheme.primary, AppTheme.success, AppTheme.warning, AppTheme.error, const Color(0xFF8B5CF6)];

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('สวัสดี 👋', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 4),
            Text('สรุปการเงินวันนี้', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 16),

            // Balance Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.primary, Color(0xFF2563EB)]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(Icons.account_balance_wallet_rounded, size: 16, color: Colors.white.withAlpha(200)),
                  const SizedBox(width: 6),
                  Text('ยอดคงเหลือ', style: TextStyle(color: Colors.white.withAlpha(200), fontSize: 13)),
                ]),
                const SizedBox(height: 8),
                Text(p.fmt(p.balance), style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w700, color: Colors.white)),
                const SizedBox(height: 12),
                Row(children: [
                  _statChip(Icons.trending_up, p.fmt(p.monthlyIncome), Colors.green.shade300),
                  const SizedBox(width: 16),
                  _statChip(Icons.trending_down, p.fmt(p.monthlyExpense), Colors.red.shade300),
                ]),
              ]),
            ),
            const SizedBox(height: 12),

            // Warning
            if (p.dueSoonSubs.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.warning.withAlpha(25),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.warning.withAlpha(50)),
                ),
                child: Row(children: [
                  const Icon(Icons.warning_amber_rounded, color: AppTheme.warning, size: 22),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('⚠️ Subscription กำลังจะตัด!', style: TextStyle(color: AppTheme.warning, fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text('${p.dueSoonSubs.length} รายการ', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ])),
                ]),
              ),

            const SizedBox(height: 16),

            // Category Breakdown
            _sectionHeader(context, '📊 สัดส่วนค่าใช้จ่าย'),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderDark.withAlpha(80)),
              ),
              child: Column(children: [
                Row(children: cats.take(4).toList().asMap().entries.map((e) {
                  final pct = catTotal > 0 ? (e.value.value / catTotal * 100) : 0.0;
                  return Expanded(child: Container(height: 6, margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: colors[e.key % colors.length].withAlpha(120),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ));
                }).toList()),
                const SizedBox(height: 12),
                ...cats.take(4).map((e) {
                  final pct = catTotal > 0 ? (e.value / catTotal * 100) : 0.0;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(children: [
                      Text(e.key, style: const TextStyle(fontSize: 13, color: Colors.white)),
                      const Spacer(),
                      Text('${pct.toStringAsFixed(0)}%', style: const TextStyle(fontSize: 12, color: Colors.white38)),
                      const SizedBox(width: 12),
                      Text(p.fmt(e.value), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                    ]),
                  );
                }),
              ]),
            ),

            const SizedBox(height: 16),

            // Recent Transactions
            _sectionHeader(context, '💳 รายการล่าสุด'),
            const SizedBox(height: 10),
            ...recent.map((t) => Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.borderDark, width: 0.3))),
              child: Row(children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: t.isIncome ? AppTheme.success : AppTheme.error,
                )),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t.description, style: const TextStyle(fontSize: 14)),
                  Text(t.date, style: const TextStyle(fontSize: 11, color: Colors.white38)),
                ])),
                Text('${t.isIncome ? '+' : '-'}${p.fmt(t.amount)}',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
                    color: t.isIncome ? AppTheme.success : AppTheme.error)),
              ]),
            )),
          ]),
        );
      },
    );
  }

  Widget _statChip(IconData icon, String text, Color color) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 14, color: color),
      const SizedBox(width: 4),
      Text(text, style: TextStyle(fontSize: 13, color: Colors.white.withAlpha(200))),
    ]);
  }

  Widget _sectionHeader(BuildContext context, String title) {
    return Text(title, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 13, color: Colors.white38));
  }
}
