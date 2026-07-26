import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/finance_provider.dart';
import 'screens/dashboard_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/subscriptions_screen.dart';
import 'theme/app_theme.dart';

class FinanceApp extends StatefulWidget {
  const FinanceApp({super.key});

  @override
  State<FinanceApp> createState() => _FinanceAppState();
}

class _FinanceAppState extends State<FinanceApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FinanceProvider>().init();
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'หารเท่า.ai',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: Consumer<FinanceProvider>(
        builder: (context, p, _) {
          if (p.loading) {
            return const Scaffold(
              body: Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  CircularProgressIndicator(color: AppTheme.primary),
                  SizedBox(height: 16),
                  Text('กำลังโหลด...', style: TextStyle(color: Colors.white54)),
                ]),
              ),
            );
          }

          return Scaffold(
            body: IndexedStack(
              index: p.currentIndex,
              children: const [
                DashboardScreen(),
                ChatScreen(),
                SubscriptionsScreen(),
              ],
            ),
            bottomNavigationBar: Container(
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: AppTheme.borderDark.withAlpha(80))),
              ),
              child: BottomNavigationBar(
                currentIndex: p.currentIndex,
                onTap: p.setTab,
                backgroundColor: AppTheme.bgDark,
                selectedItemColor: AppTheme.primary,
                unselectedItemColor: Colors.white38,
                type: BottomNavigationBarType.fixed,
                selectedFontSize: 11,
                unselectedFontSize: 11,
                items: const [
                  BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'ดัชบอร์ด'),
                  BottomNavigationBarItem(icon: Icon(Icons.chat_rounded), label: 'แชท'),
                  BottomNavigationBarItem(icon: Icon(Icons.repeat_rounded), label: 'Subscription'),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
