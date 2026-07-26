class Transaction {
  final String id;
  final String type;
  final String category;
  final double amount;
  final String description;
  final String date;

  Transaction({
    required this.id,
    required this.type,
    required this.category,
    required this.amount,
    required this.description,
    required this.date,
  });

  Map<String, dynamic> toMap() => {
    'id': id, 'type': type, 'category': category,
    'amount': amount, 'description': description, 'date': date,
  };

  factory Transaction.fromMap(Map<String, dynamic> m) => Transaction(
    id: m['id'] as String, type: m['type'] as String,
    category: m['category'] as String, amount: (m['amount'] as num).toDouble(),
    description: m['description'] as String, date: m['date'] as String,
  );

  bool get isIncome => type == 'income';
}
