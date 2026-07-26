class ChatAction {
  final String label;
  final String handler;
  ChatAction({required this.label, required this.handler});

  factory ChatAction.fromJson(Map<String, dynamic> j) =>
      ChatAction(label: j['label'] as String, handler: j['handler'] as String);

  Map<String, dynamic> toJson() => {'label': label, 'handler': handler};
}

class ChatMessage {
  final String id;
  final String role;
  final String text;
  final List<ChatAction>? actions;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.role,
    required this.text,
    this.actions,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

List<ChatMessage> demoMessages = [
  ChatMessage(
    id: 'm0', role: 'assistant',
    text: '👋 สวัสดี! ฉันคือ **หารเท่า.ai** ผู้ช่วยบริหารเงินของคุณ\n\nพิมพ์ "สวัสดี" เพื่อเริ่ม หรือพิมพ์ "กินข้าว 60"',
    timestamp: DateTime.now().subtract(const Duration(minutes: 1)),
  ),
  ChatMessage(
    id: 'm1', role: 'user',
    text: 'เงินจะหมดแล้ว 😭',
    timestamp: DateTime.now().subtract(const Duration(seconds: 40)),
  ),
  ChatMessage(
    id: 'm2', role: 'assistant',
    text: 'ใจเย็นๆ! 😊\n\nพรุ่งนี้ **Netflix 419 บาท** กำลังจะตัด แต่คุณไม่ได้ดูมา 2 เดือนแล้ว ยกเลิกเลยไหม?\n\nถ้ากดยกเลิกจะได้เงินคืน **419 บาท** ทันที! 🎉',
    actions: [ChatAction(label: '❌ ยกเลิก Netflix', handler: 'cancel-netflix')],
    timestamp: DateTime.now().subtract(const Duration(seconds: 20)),
  ),
];
