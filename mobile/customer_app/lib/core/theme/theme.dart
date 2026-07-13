import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Vibrant HSL-equivalent Material Colors
  static const Color primaryBlue = Color(0xFF1E3A8A); // Sleek Deep Indigo
  static const Color accentAmber = Color(0xFFF59E0B); // Amber Yellow Accent
  static const Color backgroundLight = Color(0xFFF8FAFC); // Slate-50 background
  static const Color backgroundDark = Color(0xFF0F172A);  // Slate-900 background

  // 1. Premium Light Theme Design
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: primaryBlue,
        secondary: accentAmber,
        background: backgroundLight,
        surface: Colors.white,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: primaryBlue),
      ),
    );
  }

  // 2. Premium Dark Theme Design
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: backgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: primaryBlue,
        secondary: accentAmber,
        background: backgroundDark,
        surface: Color(0xFF1E293B), // Slate-800
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      cardTheme: CardTheme(
        color: const Color(0xFF1E293B),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.white),
      ),
    );
  }
}
