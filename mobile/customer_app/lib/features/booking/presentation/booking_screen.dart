import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _descriptionController = TextEditingController();
  String _selectedPayment = 'Wallet';
  String _bookingMode = 'Online';
  
  void _confirmBooking() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.green),
            SizedBox(width: 8),
            Text('Ombi Limepokelewa'),
          ],
        ),
        content: const Text('Ombi lako la dharura limetawanywa kwa mafundi waliopo karibu. Utapata taarifa hivi punde pindi fundi akikubali.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Pop dialog
              context.go('/home');    // Redirect home
            },
            child: const Text('Sawa'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Weka Ombi la Ufundi'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Mock Interactive Map Placeholder using premium visual styling
          Expanded(
            child: Stack(
              children: [
                Container(
                  color: Colors.blueGrey.shade100,
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.map_rounded, size: 64, color: Colors.blueGrey),
                        SizedBox(height: 8),
                        Text('Google Maps: Chagua eneo la kazi', style: TextStyle(fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                ),
                // Center Map Pin Indicator
                const Center(
                  child: Icon(
                    Icons.location_pin,
                    size: 48,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
          ),

          // Booking options panel
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
                // Fee estimation display
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Ada ya Ukaguzi (Inspection Fee):', style: TextStyle(color: Colors.grey)),
                    Text(
                      '5,000 TZS',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E3A8A)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Description text input
                TextField(
                  controller: _descriptionController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: 'Eleza tatizo kwa kifupi...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Customer Budget Input (Optional)
                TextField(
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Bajeti Yako (Budget / Optional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixText: 'TZS',
                  ),
                ),
                const SizedBox(height: 16),

                // Booking Mode Selector (Online / Offline)
                DropdownButtonFormField<String>(
                  value: _bookingMode,
                  decoration: InputDecoration(
                    labelText: 'Aina ya Booking (Online / Offline)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: ['Online', 'Offline']
                      .map((mode) => DropdownMenuItem(
                            value: mode,
                            child: Text(mode == 'Online' ? 'Online (Malipo kupitia App/Escrow)' : 'Offline (Lipa Fundi Moja kwa Moja)'),
                          ))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _bookingMode = val);
                  },
                 ),
                 const SizedBox(height: 16),

                 // Warranty Information Banner
                 Container(
                   padding: const EdgeInsets.all(12),
                   decoration: BoxDecoration(
                     color: const Color(0xFFEFF6FF),
                     borderRadius: BorderRadius.circular(12),
                     border: Border.all(color: const Color(0xFFBFDBFE)),
                   ),
                   child: const Row(
                     children: [
                       Icon(Icons.security, color: Color(0xFF2563EB)),
                       SizedBox(width: 8),
                       Expanded(
                         child: Text(
                           'Udhamini: Kazi hii inajumuisha Udhamini wa Siku 30 kutoka kwa Fundi (30 Days Warranty Included).',
                           style: TextStyle(fontSize: 11, color: Color(0xFF1E40AF), fontWeight: FontWeight.bold),
                         ),
                       ),
                     ],
                   ),
                 ),
                 const SizedBox(height: 16),

                 // Payment Method Selector
                 DropdownButtonFormField<String>(
                  value: _selectedPayment,
                  decoration: InputDecoration(
                    labelText: 'Njia ya Malipo',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: ['Wallet', 'M-Pesa PUSH', 'Tigo Pesa PUSH']
                      .map((method) => DropdownMenuItem(
                            value: method,
                            child: Text(method),
                          ))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedPayment = val);
                  },
                ),
                const SizedBox(height: 24),

                // Confirm booking button
                ElevatedButton(
                  onPressed: _confirmBooking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Thibitisha & Tafuta Fundi',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
