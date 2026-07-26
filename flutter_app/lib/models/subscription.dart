class Subscription {
  final String id;
  final String name;
  final String service;
  final String icon;
  final double amount;
  final int billingDay;
  final String nextBilling;
  bool active;
  final String? note;

  Subscription({
    required this.id,
    required this.name,
    required this.service,
    required this.icon,
    required this.amount,
    required this.billingDay,
    required this.nextBilling,
    this.active = true,
    this.note,
  });

  Map<String, dynamic> toMap() => {
    'id': id, 'name': name, 'service': service, 'icon': icon,
    'amount': amount, 'billingDay': billingDay, 'nextBilling': nextBilling,
    'active': active ? 1 : 0, 'note': note,
  };

  factory Subscription.fromMap(Map<String, dynamic> m) => Subscription(
    id: m['id'] as String, name: m['name'] as String,
    service: m['service'] as String, icon: m['icon'] as String,
    amount: (m['amount'] as num).toDouble(),
    billingDay: m['billingDay'] as int, nextBilling: m['nextBilling'] as String,
    active: (m['active'] as int) == 1, note: m['note'] as String?,
  );

  Subscription copyWith({bool? active}) => Subscription(
    id: id, name: name, service: service, icon: icon,
    amount: amount, billingDay: billingDay, nextBilling: nextBilling,
    active: active ?? this.active, note: note,
  );

  double get yearlyCost => amount * 12;
}
