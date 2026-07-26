import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import '../models/subscription.dart';
import '../models/transaction.dart';
import '../models/chat_message.dart';
import '../services/database_service.dart';
import '../services/notification_service.dart';

class FinanceProvider extends ChangeNotifier {
  final _db = DatabaseService.instance;
  final _notif = NotificationService.instance;

  double _balance = 4500;
  double get balance => _balance;

  List<Subscription> _subscriptions = [];
  List<Subscription> get subscriptions => _subscriptions;

  List<Transaction> _transactions = [];
  List<Transaction> get transactions => _transactions;

  List<ChatMessage> _messages = [];
  List<ChatMessage> get messages => _messages;

  int _currentIndex = 0;
  int get currentIndex => _currentIndex;

  bool _loading = true;
  bool get loading => _loading;

  final f = NumberFormat('#,###', 'th_TH');

  String fmt(double n) => '฿${f.format(n)}';

  Future<void> init() async {
    _messages = demoMessages;
    _subscriptions = await _db.getSubscriptions();
    _transactions = await _db.getTransactions();
    _balance = await _db.getMonthlyBalance();
    _loading = false;
    notifyListeners();

    // Check for due subscriptions and notify
    await _notif.checkAndNotify(_subscriptions);
  }

  void setTab(int index) {
    _currentIndex = index;
    notifyListeners();
  }

  Future<void> logExpense(double amount, String description, {String category = 'อื่นๆ'}) async {
    final tx = Transaction(
      id: 'tx_${DateTime.now().millisecondsSinceEpoch}',
      type: 'expense', category: category,
      amount: amount, description: description,
      date: DateTime.now().toIso8601String().split('T')[0],
    );
    await _db.addTransaction(tx);
    _transactions.insert(0, tx);
    _balance -= amount;
    notifyListeners();
  }

  Future<void> toggleSubscription(String id) async {
    await _db.toggleSubscription(id);
    final idx = _subscriptions.indexWhere((s) => s.id == id);
    if (idx >= 0) {
      _subscriptions[idx].active = !_subscriptions[idx].active;
      notifyListeners();
    }
  }

  Future<void> cancelNetflix() async {
    final sub = _subscriptions.where((s) => s.id == 's1').firstOrNull;
    if (sub == null || !sub.active) return;

    await _db.cancelSubscription('s1');
    sub.active = false;
    _balance += sub.amount;
    _messages.add(ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      role: 'assistant',
      text: '✅ **ยกเลิก ${sub.name} เรียบร้อย!** 🎉\n\nได้เงินคืน **${fmt(sub.amount)}** บาท!\n💰 **ยอดคงเหลือ: ${fmt(_balance)}**\n\nเหลือไปกินหมูกระทะเพิ่มอีก ${fmt(sub.amount)}! 🔥',
    ));
    notifyListeners();
  }

  void addMessage(ChatMessage msg) {
    _messages.add(msg);
    notifyListeners();
  }

  ChatResponse processChat(String text) {
    final l = text.toLowerCase().trim();

    if ((l.contains('ยกเลิก') && (l.contains('netflix') || l.contains('เน็ต')))) {
      cancelNetflix();
      return ChatResponse('', []);
    }

    final expenseMatch = RegExp(r'(.+?)\s*(\d+)\s*บาท?$').firstMatch(l);
    if (expenseMatch != null) {
      final amt = double.parse(expenseMatch.group(2)!);
      logExpense(amt, expenseMatch.group(1)!.trim());
      return ChatResponse(
        '✅ บันทึก **${expenseMatch.group(1)!.trim()}** ${fmt(amt)} เรียบร้อย!\n💰 **ยอดคงเหลือ: ${fmt(_balance)}**',
        [ChatAction(label: '💰 เช็คการเงิน', handler: 'check')],
      );
    }

    if (l.contains('เงินจะหมด') || l.contains('เงินหมด')) {
      final netflix = _subscriptions.where((s) => s.id == 's1').firstOrNull;
      final activeSubs = _subscriptions.where((s) => s.active);
      final totalSubs = activeSubs.fold(0.0, (sum, s) => sum + s.amount);
      final expense = _transactions.where((t) => t.type == 'expense').fold(0.0, (sum, t) => sum + t.amount);

      var r = '💰 **สรุปการเงิน:**\n\n💸 **ยอดคงเหลือ:** ${fmt(_balance)}\n💳 **รายจ่ายเดือนนี้:** ${fmt(expense)}\n📋 **Subscriptions:** ${activeSubs.length} รายการ = ${fmt(totalSubs)}/เดือน\n';
      final actions = <ChatAction>[];
      if (netflix?.active == true) {
        final billing = DateTime.tryParse(netflix!.nextBilling);
        if (billing != null && billing.difference(DateTime.now()).inDays <= 2) {
          r += '\n🔴 **⚠️ พรุ่งนี้ ${netflix.name} ${fmt(netflix.amount)} จะตัด!** ยกเลิกไหม?\n';
          actions.add(ChatAction(label: '❌ ยกเลิก Netflix', handler: 'cancel-netflix'));
        }
      }
      r += '\n💡 พิมพ์ "sub" ดู Subscription หรือ "กินข้าว 60" บันทึกรายจ่าย';
      actions.add(ChatAction(label: '📋 ดูทั้งหมด', handler: 'subs'));
      return ChatResponse(r, actions);
    }

    if (l.contains('sub') || l.contains('ซับ')) {
      final active = _subscriptions.where((s) => s.active);
      final total = active.fold(0.0, (sum, s) => sum + s.amount);
      final now = DateTime.now();
      return ChatResponse(
        '📋 **Subscription:**\n${active.map((s) {
          final billing = DateTime.tryParse(s.nextBilling);
          final daysLeft = billing != null ? billing.difference(now).inDays : 999;
          return '• **${s.name}** ${fmt(s.amount)}/ด${daysLeft <= 3 ? ' ⚠️' : ''}';
        }).join('\n')}\n\n💰 **รวม: ${fmt(total)}/เดือน**',
        [ChatAction(label: '📋 จัดการ', handler: 'subs')],
      );
    }

    if (l.contains('เปลือง') || l.contains('วิเคราะห์')) {
      final cats = <String, double>{};
      for (final t in _transactions.where((t) => t.type == 'expense')) {
        cats[t.category] = (cats[t.category] ?? 0) + t.amount;
      }
      final sorted = cats.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
      return ChatResponse(
        '📊 **วิเคราะห์:**\n${sorted.map((e) => '• **${e.key}** ${fmt(e.value)}').join('\n')}\n\n💡 ถ้าลดกินนอกบ้าน 2 มื้อ/สัปดาห์ ประหยัด ~600/เดือน',
        [ChatAction(label: '📊 ดัชบอร์ด', handler: 'dashboard')],
      );
    }

    if (l.contains('สวัสดี') || l.contains('หวัดดี') || l.contains('hi') || l.contains('hello')) {
      return ChatResponse(
        'สวัสดี! 👋\n\nฉัน **หารเท่า.ai** 🤖 ช่วย:\n• บันทึกรายจ่าย: พิมพ์ "กินข้าว 60"\n• เช็ค Subscription: พิมพ์ "sub"\n• เตือนก่อนตัด: พิมพ์ "เงินจะหมด"\n• วิเคราะห์: พิมพ์ "ใช้เงินเปลือง"',
        [
          ChatAction(label: '💰 "เงินจะหมด"', handler: 'check'),
          ChatAction(label: '📋 "sub"', handler: 'subs'),
        ],
      );
    }

    return ChatResponse(
      '🙏 พิมพ์ "สวัสดี" เพื่อเริ่ม หรือ "กินข้าว 60" บันทึกรายจ่าย',
      [ChatAction(label: '💬 สวัสดี', handler: 'hello')],
    );
  }

  List<Subscription> get activeSubscriptions => _subscriptions.where((s) => s.active).toList();
  double get totalMonthlySubs => activeSubscriptions.fold(0.0, (sum, s) => sum + s.amount);
  List<Subscription> get dueSoonSubs => activeSubscriptions.where((s) {
    final billing = DateTime.tryParse(s.nextBilling);
    return billing != null && billing.difference(DateTime.now()).inDays <= 3;
  }).toList();

  double get monthlyIncome => _transactions.where((t) => t.type == 'income').fold(0.0, (sum, t) => sum + t.amount);
  double get monthlyExpense => _transactions.where((t) => t.type == 'expense').fold(0.0, (sum, t) => sum + t.amount);

  Map<String, double> get expenseByCategory {
    final cats = <String, double>{};
    for (final t in _transactions.where((t) => t.type == 'expense')) {
      cats[t.category] = (cats[t.category] ?? 0) + t.amount;
    }
    return cats;
  }

  List<Transaction> get recentTransactions => _transactions.take(4).toList();
}

class ChatResponse {
  final String text;
  final List<ChatAction> actions;
  ChatResponse(this.text, this.actions);
}
