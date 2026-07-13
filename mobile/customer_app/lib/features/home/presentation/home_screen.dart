import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // 11 Seed categories matching database
    final List<Map<String, dynamic>> categories = [
      {'name': 'Umeme', 'icon': Icons.flash_on_rounded, 'label': 'Electrician'},
      {'name': 'Mabomba', 'icon': Icons.water_drop_rounded, 'label': 'Plumber'},
      {'name': 'AC / Jokofu', 'icon': Icons.ac_unit_rounded, 'label': 'AC Repair'},
      {'name': 'Useramala', 'icon': Icons.carpenter_rounded, 'label': 'Carpenter'},
      {'name': 'Uashi', 'icon': Icons.grid_view_rounded, 'label': 'Mason'},
      {'name': 'Rangi', 'icon': Icons.brush_rounded, 'label': 'Painter'},
      {'name': 'Welding', 'icon': Icons.build_rounded, 'label': 'Welder'},
      {'name': 'Magari', 'icon': Icons.directions_car_rounded, 'label': 'Mechanic'},
      {'name': 'CCTV', 'icon': Icons.videocam_rounded, 'label': 'CCTV Installer'},
      {'name': 'Kompyuta', 'icon': Icons.computer_rounded, 'label': 'Computer'},
      {'name': 'Sola', 'icon': Icons.wb_sunny_rounded, 'label': 'Solar'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(
              'MAENEO YAKO',
              style: theme.textTheme.labelSmall?.copyWith(color: Colors.grey),
            ),
            const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.location_on_rounded, size: 16, color: Color(0xFF1E3A8A)),
                SizedBox(width: 4),
                Text('Mikocheni B, Dar es Salaam', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            TextField(
              decoration: InputDecoration(
                hintText: 'Tafuta fundi umeme, mabomba, rangi...',
                prefixIcon: const Icon(Icons.search_rounded),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: theme.colorScheme.surfaceVariant.withOpacity(0.4),
              ),
            ),
            const SizedBox(height: 24),

            // Emergency Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.shade100),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 40, color: Colors.red),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Uharaka wa Dharura (Emergency)',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 16),
                        ),
                        Text(
                          'Pata fundi wa karibu zaidi mara moja ndani ya dakika 10.',
                          style: TextStyle(color: Colors.red.shade900, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => context.push('/booking'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Omba'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Categories Section Title
            const Text(
              'Jamii za Mafundi (Categories)',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            // Responsive Category Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.8,
              ),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final cat = categories[index];
                return GestureDetector(
                  onPressed: () => context.push('/booking'),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: const Color(0xFF1E3A8A).withOpacity(0.08),
                        child: Icon(cat['icon'], color: const Color(0xFF1E3A8A), size: 28),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat['name'],
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
