import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import '../models/subscription.dart';
import '../models/transaction.dart';

class DatabaseService {
  static Database? _db;
  static final DatabaseService instance = DatabaseService._();

  DatabaseService._();

  Future<Database> get database async {
    _db ??= await _initDB();
    return _db!;
  }

  Future<Database> _initDB() async {
    final path = p.join(await getDatabasesPath(), 'harntao.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE subscriptions (
            id TEXT PRIMARY KEY, name TEXT, service TEXT, icon TEXT,
            amount REAL, billingDay INTEGER, nextBilling TEXT,
            active INTEGER DEFAULT 1, note TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE transactions (
            id TEXT PRIMARY KEY, type TEXT, category TEXT,
            amount REAL, description TEXT, date TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE settings (
            key TEXT PRIMARY KEY, value TEXT
          )
        ''');
        // Seed data
        await _seedData(db);
      },
    );
  }

  Future<void> _seedData(Database db) async {
    final subs = [
      Subscription(id:'s1', name:'Netflix Premium', service:'Netflix', icon:'N', amount:419, billingDay:26, nextBilling:'${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2,'0')}-26', note:'ไม่ได้ดูมา 2 เดือน'),
      Subscription(id:'s2', name:'Spotify Premium', service:'Spotify', icon:'S', amount:139, billingDay:10, nextBilling:'${DateTime.now().year}-${(DateTime.now().month%12)+1}-10'),
      Subscription(id:'s3', name:'ChatGPT Plus', service:'OpenAI', icon:'C', amount:750, billingDay:20, nextBilling:'${DateTime.now().year}-${(DateTime.now().month%12)+1}-20'),
      Subscription(id:'s4', name:'iCloud+ 200GB', service:'Apple', icon:'A', amount:99, billingDay:15, nextBilling:'${DateTime.now().year}-${(DateTime.now().month%12)+1}-15'),
      Subscription(id:'s5', name:'YouTube Premium', service:'YouTube', icon:'Y', amount:159, billingDay:5, nextBilling:'${DateTime.now().year}-${(DateTime.now().month%12)+1}-05'),
    ];
    for (final s in subs) {
      await db.insert('subscriptions', s.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
    }

    final today = DateTime.now().toIso8601String().split('T')[0];
    final txs = [
      Transaction(id:'a', type:'income', category:'เงินเดือน', amount:11000, description:'ค่าขนม', date:'${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2,'0')}-20'),
      Transaction(id:'b', type:'expense', category:'อาหาร', amount:180, description:'หมูกระทะ', date:today),
      Transaction(id:'c', type:'expense', category:'เดินทาง', amount:85, description:'BTS', date:today),
      Transaction(id:'d', type:'expense', category:'อาหาร', amount:60, description:'ข้าวผัด', date:today),
      Transaction(id:'e', type:'expense', category:'ช้อปปิ้ง', amount:250, description:'เสื้อมือสอง', date:today),
    ];
    for (final t in txs) {
      await db.insert('transactions', t.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
  }

  // Subscriptions
  Future<List<Subscription>> getSubscriptions() async {
    final db = await database;
    final maps = await db.query('subscriptions');
    return maps.map((m) => Subscription.fromMap(m)).toList();
  }

  Future<void> toggleSubscription(String id) async {
    final db = await database;
    final current = await db.query('subscriptions', where: 'id = ?', whereArgs: [id]);
    if (current.isNotEmpty) {
      final active = (current.first['active'] as int) == 1 ? 0 : 1;
      await db.update('subscriptions', {'active': active}, where: 'id = ?', whereArgs: [id]);
    }
  }

  Future<void> cancelSubscription(String id) async {
    final db = await database;
    await db.update('subscriptions', {'active': 0}, where: 'id = ?', whereArgs: [id]);
  }

  // Transactions
  Future<List<Transaction>> getTransactions() async {
    final db = await database;
    final maps = await db.query('transactions', orderBy: 'date DESC');
    return maps.map((m) => Transaction.fromMap(m)).toList();
  }

  Future<void> addTransaction(Transaction tx) async {
    final db = await database;
    await db.insert('transactions', tx.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<double> getMonthlyBalance() async {
    final db = await database;
    final monthly = '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}';
    final txs = await db.query('transactions', where: 'date LIKE ?', whereArgs: ['$monthly%']);
    double income = 0, expense = 0;
    for (final t in txs) {
      if (t['type'] == 'income') income += (t['amount'] as num).toDouble();
      else expense += (t['amount'] as num).toDouble();
    }
    return income - expense;
  }

  // Settings
  Future<void> setSetting(String key, String value) async {
    final db = await database;
    await db.insert('settings', {'key': key, 'value': value}, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<String?> getSetting(String key) async {
    final db = await database;
    final result = await db.query('settings', where: 'key = ?', whereArgs: [key]);
    return result.isNotEmpty ? result.first['value'] as String? : null;
  }
}
