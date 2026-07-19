/*
# CitySolver Seed Data — Departments, Badges, Rewards, Sample Officers

## Overview
Seeds reference data so the app renders meaningful content on first load.
No citizen/complaint data is seeded here (those come from real signups).

## 1. Departments
- Roads & Infrastructure, Sanitation & Waste, Water Works, Electrical & Lighting,
  Drainage & Storm Water, Public Safety, General Municipal

## 2. Badges
- First Responder (bronze), Eagle Eye (silver), Streak Keeper (silver),
  Neighborhood Guardian (gold), Community Hero (gold), City Champion (platinum)

## 3. Rewards
- Coffee Voucher, Movie Ticket, Public Transport Pass, Smart Water Bottle,
  City Tour Package, Community Champion Trophy

## 4. Sample Officers
- 3 officers across departments (not linked to auth users — admin-only demo data)
*/

-- ============ DEPARTMENTS ============
INSERT INTO departments (id, name, description) VALUES
  ('dept-roads', 'Roads & Infrastructure', 'Road maintenance, pothole repair, and surface infrastructure'),
  ('dept-sanitation', 'Sanitation & Waste', 'Waste collection, garbage management, and street cleaning'),
  ('dept-water', 'Water Works', 'Water supply, pipe maintenance, and leakage control'),
  ('dept-electrical', 'Electrical & Lighting', 'Street lighting, electrical safety, and public lighting'),
  ('dept-drainage', 'Drainage & Storm Water', 'Drainage systems, storm water management, and flood prevention'),
  ('dept-safety', 'Public Safety', 'Public hazards, safety incidents, and emergency response'),
  ('dept-general', 'General Municipal', 'General civic issues and cross-department coordination')
ON CONFLICT (id) DO NOTHING;

-- ============ BADGES ============
INSERT INTO badges (id, name, description, tier, icon) VALUES
  ('badge-first-responder', 'First Responder', 'Submit your first 10 reports', 'bronze', 'medal'),
  ('badge-eagle-eye', 'Eagle Eye', 'Report 50 verified issues', 'silver', 'award'),
  ('badge-streak-keeper', 'Streak Keeper', 'Report on 30 consecutive days', 'silver', 'award'),
  ('badge-neighborhood-guardian', 'Neighborhood Guardian', 'Get 25 issues resolved', 'gold', 'trophy'),
  ('badge-community-hero', 'Community Hero', 'Awarded for outstanding community impact', 'gold', 'trophy'),
  ('badge-city-champion', 'City Champion', 'The highest honor for top civic contributors', 'platinum', 'crown')
ON CONFLICT (id) DO NOTHING;

-- ============ REWARDS ============
INSERT INTO rewards (id, name, description, cost, category, image_url, unlocked) VALUES
  ('reward-coffee', 'Coffee Voucher', 'Free coffee at participating cafes', 200, 'food', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('reward-movie', 'Movie Ticket', 'Single movie ticket at city cinemas', 800, 'entertainment', 'https://images.pexels.com/photos/7233782/pexels-photo-7233782.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('reward-transit', 'Public Transport Pass', 'Monthly public transport pass', 1500, 'travel', 'https://images.pexels.com/photos/2068097/pexels-photo-2068097.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('reward-bottle', 'Smart Water Bottle', 'Branded reusable smart water bottle', 1200, 'merchandise', 'https://images.pexels.com/photos/1188649/pexels-photo-1188649.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('reward-tour', 'City Tour Package', 'Guided heritage city tour for two', 3500, 'experience', 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('reward-trophy', 'Community Champion Trophy', 'Engraved trophy for top contributors', 5000, 'recognition', 'https://images.pexels.com/photos/2078265/pexels-photo-2078265.jpeg?auto=compress&cs=tinysrgb&w=400', true)
ON CONFLICT (id) DO NOTHING;

-- ============ SAMPLE OFFICERS ============
-- These are demo officers not linked to auth users (user_id NULL) so citizens can see officer info
INSERT INTO officers (id, name, department, rank, avatar, availability, workload_pct, efficiency_pct, capacity_pct, avg_resolution_hours, avg_resolution_time, assigned_count, resolved_count) VALUES
  ('OFC-001', 'Eng. R. Mehta', 'Roads & Infrastructure', 'Senior Engineer', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200', 'busy', 92, 88, 85, 62, '62h', 24, 18),
  ('OFC-002', 'San. T. Rao', 'Sanitation & Waste', 'Junior Supervisor', 'https://images.pexels.com/photos/2182969/pexels-photo-2182969.jpeg?auto=compress&cs=tinysrgb&w=200', 'available', 45, 96, 50, 32, '32h', 26, 24),
  ('OFC-003', 'Eng. K. Singh', 'Water Works', 'Senior Engineer', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', 'busy', 88, 78, 90, 74, '74h', 20, 12),
  ('OFC-004', 'Tech. A. Kumar', 'Electrical & Lighting', 'Mid-level Technician', 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=200', 'available', 55, 91, 60, 44, '44h', 18, 15),
  ('OFC-005', 'Off. S. Gupta', 'Public Safety', 'Senior Officer', 'https://images.pexels.com/photos/6975393/pexels-photo-6975393.jpeg?auto=compress&cs=tinysrgb&w=200', 'available', 60, 89, 65, 38, '38h', 22, 19),
  ('OFC-006', 'Eng. P. Joshi', 'Drainage & Storm Water', 'Senior Engineer', 'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=200', 'offline', 75, 82, 70, 56, '56h', 16, 13),
  ('OFC-007', 'Sup. M. Desai', 'Sanitation & Waste', 'Junior Supervisor', 'https://images.pexels.com/photos/2182969/pexels-photo-2182969.jpeg?auto=compress&cs=tinysrgb&w=200', 'available', 30, 94, 40, 30, '30h', 14, 13)
ON CONFLICT (id) DO NOTHING;
