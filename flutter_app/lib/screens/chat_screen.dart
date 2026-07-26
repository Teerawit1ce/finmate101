import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isTyping = false;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send(String text) {
    if (text.trim().isEmpty) return;
    final p = context.read<FinanceProvider>();

    setState(() => _isTyping = true);

    p.addMessage(ChatMessage(
      id: 'u_${DateTime.now().millisecondsSinceEpoch}',
      role: 'user',
      text: text.trim(),
    ));
    _controller.clear();

    Future.delayed(const Duration(milliseconds: 700), () {
      final r = p.processChat(text.trim());
      if (r.text.isNotEmpty) {
        p.addMessage(ChatMessage(
          id: 'a_${DateTime.now().millisecondsSinceEpoch}',
          role: 'assistant',
          text: r.text,
          actions: r.actions,
        ));
      }
      setState(() => _isTyping = false);
      _scrollToBottom();
    });
  }

  void _handleAction(String handler, FinanceProvider p) {
    switch (handler) {
      case 'cancel-netflix':
        p.cancelNetflix();
        break;
      case 'check':
        _send('เงินจะหมดแล้ว');
        break;
      case 'subs':
        p.setTab(2);
        break;
      case 'dashboard':
        p.setTab(0);
        break;
      case 'hello':
        _send('สวัสดี');
        break;
    }
  }

  String _render(String text) {
    return text.replaceAll(RegExp(r'\*\*(.+?)\*\*'), '<b>\$1</b>');
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, p, _) => Column(children: [
        // Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppTheme.borderDark)),
          ),
          child: Row(children: [
            Container(
              width: 28, height: 28,
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [AppTheme.primary, Color(0xFF2563EB)]),
                shape: BoxShape.circle,
              ),
              child: const Center(child: Text('H', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('หารเท่า.ai', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              Text('AI Agent ผู้ช่วยบริหารเงิน', style: TextStyle(fontSize: 10, color: Colors.white.withAlpha(120))),
            ]),
          ]),
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: p.messages.length + (_isTyping ? 1 : 0),
            itemBuilder: (context, index) {
              if (index >= p.messages.length) {
                return _typingIndicator();
              }
              final msg = p.messages[index];
              final isUser = msg.role == 'user';
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start, children: [
                  if (!isUser)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(children: [
                        Container(
                          width: 24, height: 24,
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(colors: [AppTheme.primary, Color(0xFF2563EB)]),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(child: Text('H', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
                        ),
                        const SizedBox(width: 6),
                        Text('หารเท่า.ai', style: TextStyle(fontSize: 11, color: Colors.white.withAlpha(120))),
                      ]),
                    ),
                  Container(
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: isUser ? AppTheme.primary : AppTheme.surfaceDark,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isUser ? 16 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 16),
                      ),
                      border: isUser ? null : Border.all(color: AppTheme.borderDark.withAlpha(80)),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _buildRichText(_render(msg.text)),
                      if (msg.actions != null && msg.actions!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Wrap(spacing: 8, runSpacing: 6, children: msg.actions!.map((a) {
                            return GestureDetector(
                              onTap: () => _handleAction(a.handler, p),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppTheme.primary.withAlpha(80)),
                                  color: AppTheme.primary.withAlpha(15),
                                ),
                                child: Text(a.label, style: const TextStyle(fontSize: 12, color: Colors.white)),
                              ),
                            );
                          }).toList()),
                        ),
                    ]),
                  ),
                ]),
              );
            },
          ),
        ),

        // Quick Chips
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: ['🍜 กินข้าว 60', '💰 เงินจะหมดแล้ว', '📋 sub', '📊 ใช้เงินเปลือง'].map((chip) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => _send(chip.split(' ').skip(1).join(' ')),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: AppTheme.surfaceDark,
                      border: Border.all(color: AppTheme.borderDark.withAlpha(80)),
                    ),
                    child: Text(chip, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                  ),
                ),
              );
            }).toList()),
          ),
        ),

        // Input
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppTheme.borderDark)),
          ),
          child: Row(children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.borderDark.withAlpha(80)),
                ),
                child: TextField(
                  controller: _controller,
                  onSubmitted: _send,
                  style: const TextStyle(fontSize: 14, color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'พิมพ์รายจ่ายของคุณ...',
                    hintStyle: TextStyle(color: Colors.white38, fontSize: 14),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => _send(_controller.text),
              child: Container(
                width: 40, height: 40,
                decoration: const BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _typingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderDark.withAlpha(80)),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: List.generate(3, (i) => _dot(i * 150))),
        ),
      ]),
    );
  }

  Widget _dot(int delay) {
    return AnimatedPadding(
      duration: Duration(milliseconds: 300 + delay),
      padding: EdgeInsets.only(top: _isTyping ? 0 : 4),
      child: Container(
        width: 7, height: 7, margin: const EdgeInsets.only(right: 4),
        decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white38),
      ),
    );
  }

  Widget _buildRichText(String html) {
    final spans = <TextSpan>[];
    final regex = RegExp(r'<b>(.+?)</b>');
    int last = 0;
    for (final match in regex.allMatches(html)) {
      if (match.start > last) {
        spans.add(TextSpan(text: html.substring(last, match.start)));
      }
      spans.add(TextSpan(text: match.group(1), style: const TextStyle(fontWeight: FontWeight.bold)));
      last = match.end;
    }
    if (last < html.length) {
      spans.add(TextSpan(text: html.substring(last)));
    }
    return Text.rich(TextSpan(children: spans), style: const TextStyle(fontSize: 14, height: 1.5));
  }
}
