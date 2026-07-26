import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/subscription.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, p, _) {
        final active = p.activeSubscriptions;
        final total = p.totalMonthlySubs;
        final colors = [AppTheme.primary, AppTheme.success, AppTheme.warning, AppTheme.error, const Color(0xFF8B5CF6), const Color(0xFFEC4899)];

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('📋 Subscription', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 4),
            Text('จัดการแอปที่สมัครไว้', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 16),

            // Summary
            Row(children: [
              _summaryCard('กำลังใช้', '${active.length} รายการ', AppTheme.primary),
              _summaryCard('รวม/เดือน', p.fmt(total), AppTheme.success),
              _summaryCard('รวม/ปี', p.fmt(total * 12), AppTheme.warning),
            ]),

            const SizedBox(height: 20),

            // List
            ...p.subscriptions.asMap().entries.map((entry) {
              final i = entry.key;
              final sub = entry.value;
              final billing = DateTime.tryParse(sub.nextBilling);
              final dueSoon = sub.active && billing != null && billing.difference(DateTime.now()).inDays <= 3;
              final color = colors[i % colors.length];

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: sub.active ? AppTheme.surfaceDark : AppTheme.surfaceDark.withAlpha(120),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: dueSoon ? AppTheme.warning.withAlpha(80) : AppTheme.borderDark.withAlpha(sub.active ? 80 : 40)),
                ),
                child: Row(children: [
                  // Icon
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: sub.active ? color : Colors.grey.shade800,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(child: Text(sub.icon, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))),
                  ),
                  const SizedBox(width: 12),

                  // Info
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Text(sub.name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                      if (dueSoon)
                        Container(
                          margin: const EdgeInsets.only(left: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.warning.withAlpha(30),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text('${billing!.difference(DateTime.now()).inDays} วัน', style: const TextStyle(fontSize: 9, color: AppTheme.warning, fontWeight: FontWeight.w500)),
                        ),
                    ]),
                    const SizedBox(height: 2),
                    Text('ตัดวันที่ ${sub.billingDay}', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                  ])),

                  // Amount
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text(p.fmt(sub.amount), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const Text('/เดือน', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  ]),
                  const SizedBox(width: 8),

                  // Toggle
                  GestureDetector(
                    onTap: () => p.toggleSubscription(sub.id),
                    child: Container(
                      width: 34, height: 34,
                      decoration: BoxDecoration(
                        color: sub.active ? AppTheme.error.withAlpha(20) : AppTheme.primary.withAlpha(20),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        sub.active ? Icons.notifications_off_outlined : Icons.notifications_outlined,
                        size: 18, color: sub.active ? AppTheme.error : AppTheme.primary,
                      ),
                    ),
                  ),
                ]),
              );
            }),
          ]),
        );
      },
    );
  }

  Widget _summaryCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark.withAlpha(150),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.borderDark.withAlpha(60)),
        ),
        child: Column(children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white38)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: color)),
        ]),
      ),
    );
  }
}
