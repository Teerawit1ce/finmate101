import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/subscription.dart';

class NotificationService {
  static final NotificationService instance = NotificationService._();
  NotificationService._();

  final _plugin = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(android: androidSettings, iOS: iosSettings);
    await _plugin.initialize(settings);
    _initialized = true;
  }

  Future<void> showSubscriptionReminder(Subscription sub) async {
    await _plugin.show(
      sub.id.hashCode,
      '⚠️ ${sub.name} กำลังจะตัดเงิน!',
      '${sub.amount.toStringAsFixed(0)} บาท จะถูกตัดวันที่ ${sub.nextBilling}',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'subscription_reminders',
          'Subscription Reminders',
          channelDescription: 'แจ้งเตือนเมื่อ Subscription ใกล้ถึงกำหนดตัดเงิน',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
  }

  Future<void> checkAndNotify(List<Subscription> subs) async {
    final now = DateTime.now();
    for (final sub in subs.where((s) => s.active)) {
      final billing = DateTime.tryParse(sub.nextBilling);
      if (billing == null) continue;
      final diff = billing.difference(now).inDays;
      if (diff >= 0 && diff <= 1) {
        await showSubscriptionReminder(sub);
      }
    }
  }

  Future<void> showDailyReport(double balance, double expense) async {
    await _plugin.show(
      9999,
      '💰 สรุปค่าใช้จ่ายวันนี้',
      'ใช้ไป ${expense.toStringAsFixed(0)} บาท | คงเหลือ ${balance.toStringAsFixed(0)} บาท',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'daily_report', 'Daily Report',
          channelDescription: 'สรุปค่าใช้จ่ายประจำวัน',
          importance: Importance.defaultImportance,
        ),
        iOS: DarwinNotificationDetails(presentAlert: true, presentBadge: true),
      ),
    );
  }
}
