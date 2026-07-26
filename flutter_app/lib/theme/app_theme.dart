import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF1431FF);
  static const Color primaryDark = Color(0xFF0F27CC);
  static const Color success = Color(0xFF059669);
  static const Color error = Color(0xFFDC2626);
  static const Color warning = Color(0xFFD97706);
  static const Color bgDark = Color(0xFF0F172A);
  static const Color surfaceDark = Color(0xFF1E293B);
  static const Color borderDark = Color(0xFF334155);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: primary,
        surface: surfaceDark,
        error: error,
      ),
      textTheme: GoogleFonts.kanitTextTheme().copyWith(
        headlineLarge: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white),
        headlineMedium: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
        titleMedium: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white),
        bodyMedium: const TextStyle(fontSize: 14, color: Colors.white),
        bodySmall: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
        labelSmall: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
      ),
      cardTheme: CardTheme(
        color: surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: borderDark, width: 0.5),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgDark,
        elevation: 0,
        centerTitle: true,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgDark,
        selectedItemColor: primary,
        unselectedItemColor: Color(0xFF64748B),
        type: BottomNavigationBarType.fixed,
      ),
      dividerColor: borderDark,
      useMaterial3: true,
    );
  }
}
