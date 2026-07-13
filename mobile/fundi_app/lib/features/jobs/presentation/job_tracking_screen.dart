import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class JobTrackingScreen extends StatefulWidget {
  final String bookingId;
  const JobTrackingScreen({super.key, required this.bookingId});

  @override
  State<JobTrackingScreen> createState() => _JobTrackingScreenState();
}

class _JobTrackingScreenState extends State<JobTrackingScreen> {
  String _jobStatus = 'ACCEPTED'; // ACCEPTED, ON_THE_WAY, STARTED, COMPLETED
  double _fundiLat = -6.7823;
  double _fundiLng = 39.2612;
  Timer? _gpsTimer;

  void _startJourney() {
    setState(() => _jobStatus = 'ON_THE_WAY');
    
    // Simulate active GPS streaming to backend (mocking impossible speed validator safety checks)
    _gpsTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (mounted && _jobStatus == 'ON_THE_WAY') {
        setState(() {
          // Incrementally move coordinates towards customer destination
          _fundiLat += 0.0005;
          _fundiLng += 0.0005;
        });
        // In production, emit coordinate packets over Socket.io:
        // socket.emit('share_location', {'latitude': _fundiLat, 'longitude': _fundiLng, 'bookingId': widget.bookingId});
      } else {
        timer.cancel();
      }
    });
  }

  void _arriveAtLocation() {
    _gpsTimer?.cancel();
    setState(() => _jobStatus = 'STARTED');
  }

  void _completeJob() {
    setState(() => _jobStatus = 'COMPLETED');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.stars_rounded, color: Colors.amber),
            SizedBox(width: 8),
            Text('Kazi Imekamilika!'),
          ],
        ),
        content: const Text('Hongera! Malipo yako yameachiwa kutoka kwenye Escrow na kuwekwa kwenye Wallet yako ya Fundi.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Pop dialog
              context.go('/dashboard'); // Go back to dashboard
            },
            child: const Text('Sawa'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _gpsTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Safari ya Kazi #${widget.bookingId.substring(0, 7)}'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: Column(
        children: [
          // Simulated Google Maps widget
          Expanded(
            child: Container(
              color: Colors.blueGrey.shade100,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.navigation_rounded, size: 64, color: Color(0xFF1E3A8A)),
                    const SizedBox(height: 8),
                    Text(
                      'Fundi coordinates: [${_fundiLat.toStringAsFixed(4)}, ${_fundiLng.toStringAsFixed(4)}]',
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    const Text('Safari kuelekea kwa: Baraka Joseph (Mikocheni B)'),
                  ],
                ),
              ),
            ),
          ),

          // Job Progression and Action Panel
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: theme.cardTheme.color ?? Colors.white,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Status Timeline header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Hali ya Kazi (Status):', style: TextStyle(color: Colors.grey)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getStatusColor(_jobStatus).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _jobStatus,
                        style: TextStyle(fontWeight: FontWeight.bold, color: _getStatusColor(_jobStatus)),
                      ),
                    ),
                  ],
                 ),
                 const SizedBox(height: 12),
                 const Row(
                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                   children: [
                     Text('Maelekezo ya Malipo (Payment):', style: TextStyle(color: Colors.grey, fontSize: 13)),
                     Text(
                       'Offline Direct (Lipa Cash/Simu)',
                       style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E3A8A)),
                     ),
                   ],
                 ),
                 const SizedBox(height: 16),

                // Conditional Action Buttons kulingana na status
                if (_jobStatus == 'ACCEPTED')
                  ElevatedButton(
                    onPressed: _startJourney,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Anza Safari (Start Journey)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                if (_jobStatus == 'ON_THE_WAY')
                  ElevatedButton(
                    onPressed: _arriveAtLocation,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Nimefika Eneo la Kazi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                if (_jobStatus == 'STARTED')
                  ElevatedButton(
                    onPressed: _completeJob,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Kamilisha Kazi (Complete Job)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'ACCEPTED':
        return Colors.blue;
      case 'ON_THE_WAY':
        return Colors.orange;
      case 'STARTED':
        return Colors.purple;
      case 'COMPLETED':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
