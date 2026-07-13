-- Seed Data for Fundi Service Tanzania Database

-- 1. Insert Regions
INSERT INTO regions (id, name) VALUES
(1, 'Dar es Salaam'),
(2, 'Arusha'),
(3, 'Mwanza'),
(4, 'Dodoma'),
(5, 'Kilimanjaro')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Districts
INSERT INTO districts (id, region_id, name) VALUES
(101, 1, 'Kinondoni'),
(102, 1, 'Ilala'),
(103, 1, 'Ubungo'),
(104, 1, 'Temeke'),
(105, 1, 'Kigamboni'),
(201, 2, 'Arusha City'),
(301, 3, 'Nyamagana'),
(401, 4, 'Dodoma Municipal')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Wards
INSERT INTO wards (id, district_id, name) VALUES
(1001, 101, 'Mikocheni'),
(1002, 101, 'Oysterbay'),
(1003, 101, 'Msasani'),
(1004, 102, 'Kariakoo'),
(1005, 102, 'Upanga'),
(1006, 103, 'Sinza'),
(1007, 103, 'Mwenge')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Villages/Subwards
INSERT INTO villages (id, ward_id, name) VALUES
(10001, 1001, 'Mikocheni A'),
(10002, 1001, 'Mikocheni B'),
(10003, 1006, 'Sinza A'),
(10004, 1006, 'Sinza B'),
(10005, 1006, 'Sinza C')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Subscription Packages
INSERT INTO subscription_packages (id, tier, name, price, duration_days, features) VALUES
(uuid_generate_v4(), 'free', 'Free Basic Plan', 0.00, 30, '{"max_gallery_images": 3, "priority_support": false, "profile_badge": "none", "search_boosting": 1.0}'),
(uuid_generate_v4(), 'silver', 'Silver Business', 15000.00, 30, '{"max_gallery_images": 10, "priority_support": false, "profile_badge": "verified", "search_boosting": 1.2}'),
(uuid_generate_v4(), 'gold', 'Gold Professional', 30000.00, 30, '{"max_gallery_images": 25, "priority_support": true, "profile_badge": "verified", "search_boosting": 1.5}'),
(uuid_generate_v4(), 'premium', 'Premium Unlimited', 50000.00, 30, '{"max_gallery_images": 100, "priority_support": true, "profile_badge": "premium", "search_boosting": 2.0}')
ON CONFLICT (tier) DO NOTHING;

-- 6. Insert Professions
INSERT INTO professions (id, name_en, name_sw, description, icon_name, commission_percentage) VALUES
(uuid_generate_v4(), 'Electrician', 'Fundi Umeme', 'Electrical installations, repairs, and diagnostics.', 'zap', 10.00),
(uuid_generate_v4(), 'Plumber', 'Fundi Mabomba', 'Water system installation, pipe repairs, and leak fixes.', 'droplet', 10.00),
(uuid_generate_v4(), 'Carpenter', 'Fundi Mbao', 'Furniture making, wood installations, and repair work.', 'hammer', 8.00),
(uuid_generate_v4(), 'Mason', 'Fundi Uashi', 'Concrete structure laying, brickwork, plastering, and stone masonry.', 'layout', 8.00),
(uuid_generate_v4(), 'Painter', 'Fundi Rangi', 'Wall surface painting, decoration, and wall treatments.', 'brush', 7.00),
(uuid_generate_v4(), 'Welder', 'Fundi Kuchomea', 'Metal structure fabrication, gates repairs, and structural welding.', 'shield', 8.00),
(uuid_generate_v4(), 'Mechanic', 'Fundi Magari', 'Car repairs, engine servicing, and automotive diagnostics.', 'tool', 10.00),
(uuid_generate_v4(), 'Air Conditioner Technician', 'Fundi AC', 'AC cleaning, installation, refilling gas, and repair.', 'wind', 10.00),
(uuid_generate_v4(), 'CCTV Installer', 'Mfungaji wa CCTV', 'Security cameras layout planning, wiring, and software setup.', 'video', 12.00),
(uuid_generate_v4(), 'Computer & Laptop Technician', 'Fundi Kompyuta', 'Hardware repair, operating system installation, and support.', 'cpu', 10.00),
(uuid_generate_v4(), 'Solar Installer', 'Fundi Umeme wa Jua', 'Solar panels mounting, batteries connection, and inverter setups.', 'sun', 10.00)
ON CONFLICT (name_en) DO NOTHING;

-- 7. Insert Tenants
INSERT INTO tenants (id, name, subdomain, domain, logo_url, branding_config) VALUES
('b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Fundi Service HQ', 'main', 'fundiservice.co.tz', 'https://res.cloudinary.com/fundi-service/logo.png', '{"primary_color": "#1E3A8A", "secondary_color": "#F59E0B"}')
ON CONFLICT (subdomain) DO NOTHING;

-- 8. Insert Demo Users (Passwords are pre-hashed for: "Password123!")
-- Pre-hashed value: '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu' (Example BCrypt hash)
INSERT INTO users (id, tenant_id, full_name, email, phone_number, password_hash, role, status, email_verified, phone_verified, referral_code) VALUES
('c0fbe640-1cb2-4a4b-972d-450f3e670c80', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Super Admin User', 'admin@fundiservice.co.tz', '+255712345678', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'super_admin', 'active', true, true, 'REFADMIN1'),
('c0fbe640-1cb2-4a4b-972d-450f3e670c81', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Baraka Joseph (Customer)', 'baraka@example.com', '+255711223344', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'customer', 'active', true, true, 'REFBARAKA'),
('c0fbe640-1cb2-4a4b-972d-450f3e670c82', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Juma Shabaan (Fundi)', 'juma@example.com', '+255755667788', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'fundi', 'active', true, true, 'REFJUMA'),
('c0fbe640-1cb2-4a4b-972d-450f3e670c83', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Sofia Ibrahim (Verification Officer)', 'sofia@fundiservice.co.tz', '+255712223334', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'verification_officer', 'active', true, true, 'REFSOFIA'),
('c0fbe640-1cb2-4a4b-972d-450f3e670c84', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Daniel Mtenga (Finance Officer)', 'daniel@fundiservice.co.tz', '+255713334445', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'finance_officer', 'active', true, true, 'REFDANIEL')
ON CONFLICT (phone_number) DO NOTHING;

-- 9. Setup Wallets for Demo Users
INSERT INTO wallets (id, user_id, balance, currency) VALUES
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c80', 0.00, 'TZS'),
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c81', 150000.00, 'TZS'), -- Customer starts with 150,000 TZS
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c82', 15000.00, 'TZS'),   -- Fundi starts with 15,000 TZS
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c83', 0.00, 'TZS'),
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c84', 0.00, 'TZS')
ON CONFLICT (user_id) DO NOTHING;

-- 10. Setup Fundi Profile for Juma Shabaan
INSERT INTO fundi_profiles (user_id, profession_id, bio, skills, experience_years, hourly_rate, region_id, district_id, ward_id, village_id, gps_location, working_days, working_hours_start, working_hours_end, online_status, verification_status, verified_badge, average_rating, total_reviews, completed_jobs, average_response_time, subscription_plan)
SELECT 
    'c0fbe640-1cb2-4a4b-972d-450f3e670c82', 
    id, 
    'Experienced plumber with over 8 years in domestic plumbing and industrial maintenance. Specializing in leak detection, water pump servicing, and bathroom fittings.', 
    ARRAY['Leak Detection', 'Piping Layouts', 'Water Pump Repairs', 'Geyser Installation'],
    8,
    15000.00, -- 15,000 TZS per hour
    1, 101, 1001, 10001,
    ST_SetSRID(ST_MakePoint(39.2612, -6.7823), 4326), -- PostGIS Point in Mikocheni, Dar es Salaam
    '{1,2,3,4,5,6}',
    '07:30:00',
    '18:00:00',
    true,
    'verified',
    true,
    4.85,
    28,
    45,
    12, -- 12 minutes response time
    'premium'
FROM professions 
WHERE name_en = 'Plumber'
ON CONFLICT (user_id) DO NOTHING;

-- 11. Add System Settings
INSERT INTO system_settings (key, value, description) VALUES
('platform_commission_percent', '10.0', 'Platform commission charged on bookings'),
('platform_vat_percent', '18.0', 'Standard Value Added Tax (VAT) in Tanzania'),
('escrow_auto_release_days', '7', 'Number of days to auto-release funds from escrow after completion'),
('sms_gateway_active', 'mock', 'Active SMS gateway: mock, beem, twilio, africastalking'),
('whatsapp_notifications_enabled', 'false', 'Enable or disable WhatsApp API integration notifications')
ON CONFLICT (key) DO NOTHING;

-- 12. Add App Releases
INSERT INTO app_releases (id, version_code, release_notes, type, download_url, force_update, is_published) VALUES
('b2a926f0-6101-4475-8bfb-88a24bf8f6b1', '1.0.0', 'Toleo la kwanza la majaribio ya jukwaa la Fundi Service Tanzania. Vifaa vyote vinaruhusiwa.', 'apk', '/app-1.0.0.apk', false, true),
('e5b128c0-3e28-4efc-a612-dfa4f6be5992', '1.0.0', 'Android App Bundle toleo la kwanza.', 'aab', '/app-1.0.0.aab', false, true),
('f1a239c0-6202-4476-8cfc-99a34bf9f6c3', '1.0.0', 'iOS App Store kwanza toleo.', 'ios', 'https://apps.apple.com/tz/app/fundiservice', false, true)
ON CONFLICT (id) DO NOTHING;

-- 13. Add App Download Analytics seeds
INSERT INTO app_download_analytics (release_id, platform, ip_address, country, device_type, os_version) VALUES
('b2a926f0-6101-4475-8bfb-88a24bf8f6b1', 'apk', '197.250.48.2', 'Tanzania', 'Android Phone', 'Android 13'),
('b2a926f0-6101-4475-8bfb-88a24bf8f6b1', 'apk', '197.250.32.14', 'Tanzania', 'Android Phone', 'Android 12'),
('f1a239c0-6202-4476-8cfc-99a34bf9f6c3', 'app_store', '197.250.12.8', 'Tanzania', 'iPhone', 'iOS 16.2');

-- 14. Add corporate users
INSERT INTO users (id, tenant_id, full_name, email, phone_number, password_hash, role, status, email_verified, phone_verified, referral_code) VALUES
('c0fbe640-1cb2-4a4b-972d-450f3e670c85', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'Serena Hotel Admin', 'admin@serenahotel.co.tz', '+255799988877', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'customer', 'active', true, true, 'REFSERENA'),
('c0fbe640-1cb2-4a4b-972d-450f3e670c86', 'b0fbe640-1cb2-4a4b-972d-450f3e670c79', 'John Doe (Serena Employee)', 'john@serenahotel.co.tz', '+255799988866', '$2a$10$4n9x2719K751/R3lU48x1.p433e5W8QhM1t2P7H5u8eB91f42HhLu', 'customer', 'active', true, true, 'REFJOHN')
ON CONFLICT (phone_number) DO NOTHING;

-- 15. Setup Wallets for Corporate users
INSERT INTO wallets (id, user_id, balance, currency) VALUES
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c85', 2500000.00, 'TZS'), -- Hotel starts with 2,500,000 TZS budget
(uuid_generate_v4(), 'c0fbe640-1cb2-4a4b-972d-450f3e670c86', 0.00, 'TZS')
ON CONFLICT (user_id) DO NOTHING;

-- 16. Add corporate profile
INSERT INTO corporate_profiles (id, user_id, company_name, tin_number, industry_type, billing_address) VALUES
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'c0fbe640-1cb2-4a4b-972d-450f3e670c85', 'Serena Hotel Dar es Salaam', '100-200-300', 'hotel', 'Kivukoni Front, Dar es Salaam')
ON CONFLICT (tin_number) DO NOTHING;

-- 17. Add corporate employee
INSERT INTO corporate_employees (corporate_profile_id, employee_id, spending_limit) VALUES
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'c0fbe640-1cb2-4a4b-972d-450f3e670c86', 150000.00)
ON CONFLICT (employee_id) DO NOTHING;

-- 18. Add Marketplace Products (Demo spare parts)
INSERT INTO products (seller_id, name, description, price, stock_quantity, category, image_urls) VALUES
('c0fbe640-1cb2-4a4b-972d-450f3e670c82', 'Luku Smart Meter Keypad', 'CIU keypad replacement for Luku prepaid electricity meters.', 35000.00, 12, 'spare_parts', '{"https://res.cloudinary.com/fundi-service/luku.jpg"}'),
('c0fbe640-1cb2-4a4b-972d-450f3e670c82', 'PPR Water Valve 3/4 Inch', 'Heavy duty PPR gate valve for plumbing and pipe layouts.', 12000.00, 40, 'spare_parts', '{"https://res.cloudinary.com/fundi-service/valve.jpg"}');

-- 19. Add Demo Loyalty Coupons
INSERT INTO coupons (code, discount_type, value, min_booking_amount, expires_at) VALUES
('KARIBU20', 'percentage', 20.00, 10000.00, NOW() + INTERVAL '30 days'),
('MWENGE5000', 'flat', 5000.00, 20000.00, NOW() + INTERVAL '15 days')
ON CONFLICT (code) DO NOTHING;

