import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isOnline = false;
  bool _showIncomingRequest = false;
  int _countdown = 15;
  Timer? _requestTimer;

  @override
  void initState() {
    super.initState();
    // Simulate an incoming real-time job request after 8 seconds of dashboard load
    Future.delayed(const Duration(seconds: 8), () {
      if (mounted && _isOnline) {
        setState(() {
          _showIncomingRequest = true;
          _countdown = 15;
        });
        _startTimer();
      }
    });
  }

  void _startTimer() {
    _requestTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() => _countdown--);
      } else {
        _rejectRequest();
      }
    });
  }

  void _acceptRequest() {
    _requestTimer?.cancel();
    setState(() => _showIncomingRequest = false);
    // Push tracking screen for booking ID
    context.push('/job-tracking/booking-123-abc');
  }

  void _rejectRequest() {
    _requestTimer?.cancel();
    setState(() => _showIncomingRequest = false);
  }

  @override
  void dispose() {
    _requestTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fundi Dashboard'),
        actions: [
          // Availability Switch
          Row(
            children: [
              Text(
                _isOnline ? 'ONLINE' : 'OFFLINE',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: _isOnline ? Colors.green : Colors.grey,
                ),
              ),
              Switch(
                value: _isOnline,
                activeColor: Colors.green,
                onChanged: (val) {
                  setState(() => _isOnline = val);
                  if (_isOnline) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Upo ONLINE sasa. Utaanza kupokea kazi za dharura.'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Earnings Section Title
                const Text('Makadirio ya Mapato (Earnings Overview)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),

                // Earnings Cards (Today, Weekly, Monthly)
                Row(
                  children: [
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Leo', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              const SizedBox(height: 4),
                              Text('35,000 TZS', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Wiki Hii', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              const SizedBox(height: 4),
                              Text('240,000 TZS', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Card(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Mwezi Huu', style: TextStyle(color: Colors.grey)),
                        const SizedBox(height: 4),
                        Text(
                          '980,000 TZS',
                          style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1E3A8A)),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                 // Level & Trust Section
                 const Text('Kiwango cha Uaminifu & Progression', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                 const SizedBox(height: 12),
                 Card(
                   color: const Color(0xFF1E3A8A),
                   child: Container(
                     width: double.infinity,
                     padding: const EdgeInsets.all(16),
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Row(
                           mainAxisAlignment: MainAxisAlignment.spaceBetween,
                           children: [
                             Container(
                               padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                               decoration: BoxDecoration(
                                 color: Colors.amber,
                                 borderRadius: BorderRadius.circular(12),
                               ),
                               child: const Text(
                                 'GOLD LEVEL',
                                 style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.black),
                               ),
                             ),
                             const Text(
                               'Trust Score: 98/100',
                               style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                             ),
                           ],
                         ),
                         const SizedBox(height: 12),
                         const Text(
                           'Mabaji ya Uhakiki: VETA Certified, Identity Verified',
                           style: TextStyle(fontSize: 11, color: Colors.white70),
                         ),
                         const SizedBox(height: 12),
                         const LinearProgressIndicator(
                           value: 0.75,
                           backgroundColor: Colors.white24,
                           valueColor: AlwaysStoppedAnimation<Color>(Colors.amber),
                         ),
                       ],
                     ),
                   ),
                 ),
                 const SizedBox(height: 24),

                 // Performance Section Title
                 const Text('Kiwango cha Utendaji (Performance Metrics)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                 const SizedBox(height: 12),

                // Metrics List
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildMetricRow('Nyota ya Wateja (Rating)', '4.85 / 5.0'),
                        const Divider(),
                        _buildMetricRow('Kiwango cha Kukubali (Acceptance)', '94%'),
                        const Divider(),
                        _buildMetricRow('Kazi Zilizokamilika', '45'),
                        const Divider(),
                        _buildMetricRow('Muda wa Kujibu (Response)', '12 min'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Real-time Incoming Dispatch Overlay
          if (_showIncomingRequest)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: theme.cardTheme.color ?? Colors.white,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(24),
                      topRight: Radius.circular(24),
                    ),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Kazi Mpya ya Dharura!',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.red),
                          ),
                          CircleAvatar(
                            backgroundColor: Colors.red.shade100,
                            child: Text(
                              '$_countdown',
                              style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Mteja: Baraka Joseph',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const Text('Umbali: mita 800 (Mikocheni B)'),
                      const Text('Shida: Bomba la maji bafuni limepasuka linavuja.'),
                      const SizedBox(height: 12),
                      const Text(
                        'Malipo ya Makadirio: 25,000 TZS',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E3A8A)),
                      ),
                      const SizedBox(height: 24),

                      // Reject / Accept Actions
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _rejectRequest,
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Kataa'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _acceptRequest,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1E3A8A),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Kubali Kazi'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
