-- ============================================================
-- Insurance OS — dev seed (expanded)
-- 20 households · 34 people · 56 policies
--
-- Product mix: medicare_advantage, medicare_supplement, pdp,
--              life, health, dental, ancillary
--
-- renewal_behavior values:
--   annual_reselection  — MAPD, PDP, ACA health (must act each year)
--   ongoing             — Medigap, whole/final-expense life, dental, ancillary
--   term_expiration     — term life with a fixed end date
--
-- review_due_date: set for ongoing policies only (null for all others)
--   Medigap/life: policy anniversary month
--   Dental/ancillary: rolling 12-month cadence from effective date
--
-- Edge cases:
--   Rodriguez  — MAPD with null renewal_date (missing data)
--   Hall       — Medigap with null renewal_date (missing data)
--   Harris     — lapsed health plan + active MAPD
--   Robinson   — pending MAPD (not yet effective)
--   Davis/Taylor — pre-Medicare, health + life
-- ============================================================


-- ------------------------------------------------------------
-- Households
-- ------------------------------------------------------------
insert into households (id, name, address_line1, city, state, zip) values
  ('a1000000-0000-0000-0000-000000000001', 'Martinez',  '412 Sycamore Lane',     'Tucson',          'AZ', '85701'),
  ('a1000000-0000-0000-0000-000000000002', 'Johnson',   '88 Birchwood Drive',    'Scottsdale',      'AZ', '85251'),
  ('a1000000-0000-0000-0000-000000000003', 'Thompson',  '1847 Cactus Wren Rd',   'Phoenix',         'AZ', '85016'),
  ('a1000000-0000-0000-0000-000000000004', 'Williams',  '304 Palm Harbor Dr',    'Tampa',           'FL', '33601'),
  ('a1000000-0000-0000-0000-000000000005', 'Anderson',  '620 Desert Springs Ln', 'Las Vegas',       'NV', '89101'),
  ('a1000000-0000-0000-0000-000000000006', 'Davis',     '91 Ridgeline Ct',       'Austin',          'TX', '78701'),
  ('a1000000-0000-0000-0000-000000000007', 'Garcia',    '2215 Coral Way',        'Miami',           'FL', '33145'),
  ('a1000000-0000-0000-0000-000000000008', 'Rodriguez', '77 Mesa Blvd',          'Albuquerque',     'NM', '87101'),
  ('a1000000-0000-0000-0000-000000000009', 'Wilson',    '560 Osprey Ave',        'Sarasota',        'FL', '34230'),
  ('a1000000-0000-0000-0000-000000000010', 'Moore',     '3310 Ironwood Dr',      'Tucson',          'AZ', '85750'),
  ('a1000000-0000-0000-0000-000000000011', 'Taylor',    '118 Bluebonnet St',     'Dallas',          'TX', '75201'),
  ('a1000000-0000-0000-0000-000000000012', 'Jackson',   '445 Magnolia Ct',       'Orlando',         'FL', '32801'),
  ('a1000000-0000-0000-0000-000000000013', 'Lee',       '729 Palo Verde Rd',     'Phoenix',         'AZ', '85004'),
  ('a1000000-0000-0000-0000-000000000014', 'Harris',    '1503 Lone Star Dr',     'Houston',         'TX', '77001'),
  ('a1000000-0000-0000-0000-000000000015', 'Clark',     '211 Saguaro Pass',      'Tempe',           'AZ', '85281'),
  ('a1000000-0000-0000-0000-000000000016', 'Lewis',     '88 Marina Mile Blvd',   'Fort Lauderdale', 'FL', '33316'),
  ('a1000000-0000-0000-0000-000000000017', 'Robinson',  '640 River Walk Blvd',   'San Antonio',     'TX', '78201'),
  ('a1000000-0000-0000-0000-000000000018', 'Walker',    '504 Superstition Dr',   'Mesa',            'AZ', '85201'),
  ('a1000000-0000-0000-0000-000000000019', 'Hall',      '19 Pelican Bay Ln',     'Naples',          'FL', '34102'),
  ('a1000000-0000-0000-0000-000000000020', 'Allen',     '336 Ocotillo Blvd',     'Chandler',        'AZ', '85224');


-- ------------------------------------------------------------
-- People
-- ------------------------------------------------------------
insert into people (id, household_id, first_name, last_name, date_of_birth, relationship, email, phone) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Rosa',    'Martinez', '1949-03-12', 'head',      'rosa.martinez@example.com',    '520-555-0101'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'Carlos',  'Martinez', '1946-07-28', 'spouse',    'carlos.martinez@example.com',  '520-555-0102'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002',
   'Patricia','Johnson',  '1958-11-05', 'head',      'patricia.johnson@example.com', '480-555-0201'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003',
   'Harold',  'Thompson', '1940-06-15', 'head',      'harold.thompson@example.com',  '602-555-0301'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003',
   'Evelyn',  'Thompson', '1943-09-22', 'spouse',    'evelyn.thompson@example.com',  '602-555-0302'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004',
   'Dorothy', 'Williams', '1948-02-11', 'head',      'dorothy.williams@example.com', '813-555-0401'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000005',
   'Robert',  'Anderson', '1944-08-03', 'head',      'robert.anderson@example.com',  '702-555-0501'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000005',
   'Margaret','Anderson', '1947-12-19', 'spouse',    'margaret.anderson@example.com','702-555-0502'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000006',
   'Gerald',  'Davis',    '1956-04-28', 'head',      'gerald.davis@example.com',     '512-555-0601'),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000006',
   'Susan',   'Davis',    '1958-07-14', 'spouse',    'susan.davis@example.com',      '512-555-0602'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000007',
   'Maria',   'Garcia',   '1945-01-30', 'head',      'maria.garcia@example.com',     '305-555-0701'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000007',
   'Jose',    'Garcia',   '1942-05-16', 'spouse',    'jose.garcia@example.com',      '305-555-0702'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000007',
   'Elena',   'Garcia',   '1975-09-08', 'dependent', 'elena.garcia@example.com',     '305-555-0703'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000008',
   'Frank',   'Rodriguez','1953-11-22', 'head',      'frank.rodriguez@example.com',  '505-555-0801'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000009',
   'Charles', 'Wilson',   '1940-03-05', 'head',      'charles.wilson@example.com',   '941-555-0901'),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000009',
   'Betty',   'Wilson',   '1942-08-17', 'spouse',    'betty.wilson@example.com',     '941-555-0902'),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000010',
   'Helen',   'Moore',    '1947-06-29', 'head',      'helen.moore@example.com',      '520-555-1001'),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000011',
   'James',   'Taylor',   '1961-02-10', 'head',      'james.taylor@example.com',     '214-555-1101'),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000011',
   'Linda',   'Taylor',   '1963-08-25', 'spouse',    'linda.taylor@example.com',     '214-555-1102'),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000012',
   'Clarence','Jackson',  '1949-12-04', 'head',      'clarence.jackson@example.com', '407-555-1201'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000013',
   'David',   'Lee',      '1944-07-19', 'head',      'david.lee@example.com',        '602-555-1301'),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000013',
   'Nancy',   'Lee',      '1946-10-31', 'spouse',    'nancy.lee@example.com',        '602-555-1302'),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000014',
   'Barbara', 'Harris',   '1955-05-06', 'head',      'barbara.harris@example.com',   '713-555-1401'),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000015',
   'Thomas',  'Clark',    '1942-04-12', 'head',      'thomas.clark@example.com',     '480-555-1501'),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000015',
   'Ruth',    'Clark',    '1944-11-08', 'spouse',    'ruth.clark@example.com',       '480-555-1502'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000015',
   'Michael', 'Clark',    '1972-03-20', 'dependent', 'michael.clark@example.com',    '480-555-1503'),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000016',
   'George',  'Lewis',    '1948-09-14', 'head',      'george.lewis@example.com',     '954-555-1601'),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000016',
   'Virginia','Lewis',    '1950-02-27', 'spouse',    'virginia.lewis@example.com',   '954-555-1602'),
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000017',
   'Arthur',  'Robinson', '1956-08-30', 'head',      'arthur.robinson@example.com',  '210-555-1701'),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000018',
   'Edward',  'Walker',   '1941-01-23', 'head',      'edward.walker@example.com',    '480-555-1801'),
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000018',
   'Frances', 'Walker',   '1943-07-06', 'spouse',    'frances.walker@example.com',   '480-555-1802'),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000019',
   'Marjorie','Hall',     '1957-03-15', 'head',      'marjorie.hall@example.com',    '239-555-1901'),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000020',
   'Raymond', 'Allen',    '1945-10-09', 'head',      'raymond.allen@example.com',    '480-555-2001'),
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000020',
   'Gloria',  'Allen',    '1947-04-22', 'spouse',    'gloria.allen@example.com',     '480-555-2002');


-- ------------------------------------------------------------
-- Policies
-- Columns: id, household_id, person_id,
--          carrier, plan_name, product_type, status,
--          effective_date, termination_date, renewal_date,
--          premium_amount, expected_commission_amount,
--          renewal_behavior, review_due_date
--
-- review_due_date is only set for ongoing policies.
-- All annual_reselection and term_expiration rows leave it null.
-- ------------------------------------------------------------
insert into policies (
  id, household_id, person_id,
  carrier, plan_name, product_type, status,
  effective_date, termination_date, renewal_date,
  premium_amount, expected_commission_amount,
  renewal_behavior, review_due_date
) values

  -- ── Martinez ───────────────────────────────────────────────
  -- Rosa: MAPD — annual_reselection, no review_due_date
  ('c1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Humana', 'Gold Plus H5619-014', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 600.00, 'annual_reselection', null),

  -- Rosa: PDP
  ('c1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'SilverScript', 'Choice Plus', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 24.70, 100.00, 'annual_reselection', null),

  -- Carlos: Medigap Plan G — ongoing, review on policy anniversary (Jul)
  ('c1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
   'Aetna', 'Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2021-07-01', null, '2026-07-01', 145.00, 200.00, 'ongoing', '2026-07-01'),

  -- ── Johnson ────────────────────────────────────────────────
  -- Patricia: Term Life — term_expiration, no review_due_date
  ('c1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003',
   'Pacific Life', '20-Year Term 500K', 'life', 'active',
   '2022-04-01', null, '2026-04-01', 67.00, 804.00, 'term_expiration', null),

  -- ── Thompson ───────────────────────────────────────────────
  -- Harold: Medigap Plan G — review on policy anniversary (Mar)
  ('c1000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004',
   'UnitedHealthcare', 'AARP Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2019-03-01', null, '2026-03-01', 195.00, 265.00, 'ongoing', '2026-03-01'),

  -- Harold: PDP
  ('c1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004',
   'SilverScript', 'Enhanced Plus', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 29.40, 100.00, 'annual_reselection', null),

  -- Evelyn: MAPD
  ('c1000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005',
   'Aetna', 'Medicare Advantage PPO H0543-027', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 572.00, 'annual_reselection', null),

  -- ── Williams ───────────────────────────────────────────────
  -- Dorothy: Medigap Plan N — review on anniversary (Feb)
  ('c1000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000006',
   'Cigna', 'Medicare Supplement Plan N', 'medicare_supplement', 'active',
   '2020-02-01', null, '2026-02-01', 148.00, 215.00, 'ongoing', '2026-05-01'),

  -- Dorothy: Dental — review on anniversary (Feb)
  ('c1000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000006',
   'Ameritas', 'Dental Preferred PPO', 'dental', 'active',
   '2020-02-01', null, '2026-02-01', 33.00, 78.00, 'ongoing', '2026-05-01'),

  -- ── Anderson ───────────────────────────────────────────────
  -- Robert: MAPD
  ('c1000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007',
   'Humana', 'Choice Plus H5619-014', 'medicare_advantage', 'active',
   '2024-01-01', null, '2026-01-01', 0.00, 557.00, 'annual_reselection', null),

  -- Margaret: MAPD
  ('c1000000-0000-0000-0000-000000000011',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000008',
   'WellCare', 'Advantage HMO H4461-002', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 18.00, 587.00, 'annual_reselection', null),

  -- Margaret: PDP
  ('c1000000-0000-0000-0000-000000000012',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000008',
   'WellCare', 'Value Rx S5601-003', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 22.50, 100.00, 'annual_reselection', null),

  -- ── Davis ──────────────────────────────────────────────────
  -- Gerald: Health (annual_reselection)
  ('c1000000-0000-0000-0000-000000000013',
   'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000009',
   'Blue Cross Blue Shield', 'Blue Select PPO', 'health', 'active',
   '2024-03-01', null, '2026-03-01', 485.00, 720.00, 'annual_reselection', null),

  -- Gerald: Term Life
  ('c1000000-0000-0000-0000-000000000014',
   'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000009',
   'Mutual of Omaha', '15-Year Term 300K', 'life', 'active',
   '2020-09-01', null, '2026-09-01', 78.00, 936.00, 'term_expiration', null),

  -- Susan: Health
  ('c1000000-0000-0000-0000-000000000015',
   'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000010',
   'Blue Cross Blue Shield', 'Blue Select PPO', 'health', 'active',
   '2024-03-01', null, '2026-03-01', 440.00, 660.00, 'annual_reselection', null),

  -- ── Garcia ─────────────────────────────────────────────────
  -- Maria: Medigap Plan G — review on anniversary (Jan)
  ('c1000000-0000-0000-0000-000000000016',
   'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000011',
   'Aetna', 'Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2017-01-01', null, '2026-01-01', 178.00, 240.00, 'ongoing', '2026-07-01'),

  -- Maria: PDP
  ('c1000000-0000-0000-0000-000000000017',
   'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000011',
   'SilverScript', 'Choice Plus', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 24.70, 100.00, 'annual_reselection', null),

  -- Jose: MAPD
  ('c1000000-0000-0000-0000-000000000018',
   'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000012',
   'WellCare', 'Healthy Florida H1234-088', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 611.00, 'annual_reselection', null),

  -- Elena: Health
  ('c1000000-0000-0000-0000-000000000019',
   'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000013',
   'Blue Cross Blue Shield', 'Blue Choice HMO', 'health', 'active',
   '2023-10-01', null, '2025-10-01', 392.00, 470.00, 'annual_reselection', null),

  -- ── Rodriguez (null renewal_date — missing data) ───────────
  ('c1000000-0000-0000-0000-000000000020',
   'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000014',
   'Humana', 'Value Plus H0028-043', 'medicare_advantage', 'active',
   '2024-01-01', null, null, 0.00, 557.00, 'annual_reselection', null),

  -- ── Wilson ─────────────────────────────────────────────────
  -- Charles: Medigap Plan G — review on anniversary (Mar)
  ('c1000000-0000-0000-0000-000000000021',
   'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000015',
   'Mutual of Omaha', 'Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2015-03-01', null, '2026-03-01', 212.00, 290.00, 'ongoing', '2026-09-01'),

  -- Charles: PDP
  ('c1000000-0000-0000-0000-000000000022',
   'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000015',
   'SilverScript', 'Enhanced Plus S5601-052', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 36.80, 100.00, 'annual_reselection', null),

  -- Charles: Dental — review 12 months from effective
  ('c1000000-0000-0000-0000-000000000023',
   'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000015',
   'Delta Dental', 'Complete Care PPO', 'dental', 'active',
   '2015-03-01', null, '2026-03-01', 38.00, 68.00, 'ongoing', '2026-09-01'),

  -- Betty: Medigap Plan G — review on anniversary (Aug)
  ('c1000000-0000-0000-0000-000000000024',
   'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000016',
   'UnitedHealthcare', 'AARP Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2017-08-01', null, '2026-08-01', 197.00, 268.00, 'ongoing', '2026-08-01'),

  -- Betty: PDP
  ('c1000000-0000-0000-0000-000000000025',
   'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000016',
   'WellCare', 'Essential Rx H6034-001', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 19.40, 100.00, 'annual_reselection', null),

  -- ── Moore ──────────────────────────────────────────────────
  -- Helen: Medigap Plan F — review on anniversary (Jun)
  ('c1000000-0000-0000-0000-000000000026',
   'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000017',
   'Aetna', 'Medicare Supplement Plan F', 'medicare_supplement', 'active',
   '2012-06-01', null, '2026-06-01', 248.00, 310.00, 'ongoing', '2026-06-01'),

  -- Helen: Final Expense Whole Life — review on anniversary (Jun)
  ('c1000000-0000-0000-0000-000000000027',
   'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000017',
   'Transamerica', 'Final Expense Whole Life 15K', 'life', 'active',
   '2018-06-01', null, '2026-06-01', 87.00, 310.00, 'ongoing', '2026-06-01'),

  -- Helen: Dental
  ('c1000000-0000-0000-0000-000000000028',
   'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000017',
   'Ameritas', 'Preferred Plus Dental PPO', 'dental', 'active',
   '2018-06-01', null, '2026-06-01', 28.00, 58.00, 'ongoing', '2026-06-01'),

  -- ── Taylor ─────────────────────────────────────────────────
  -- James: Term Life
  ('c1000000-0000-0000-0000-000000000029',
   'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000018',
   'Pacific Life', '20-Year Term 400K', 'life', 'active',
   '2015-02-01', null, '2026-02-01', 84.00, 1008.00, 'term_expiration', null),

  -- James: Health
  ('c1000000-0000-0000-0000-000000000030',
   'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000018',
   'Blue Cross Blue Shield', 'Blue Advantage PPO', 'health', 'active',
   '2024-01-01', null, '2026-01-01', 524.00, 786.00, 'annual_reselection', null),

  -- Linda: Health
  ('c1000000-0000-0000-0000-000000000031',
   'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000019',
   'Blue Cross Blue Shield', 'Blue Advantage PPO', 'health', 'active',
   '2024-01-01', null, '2026-01-01', 480.00, 720.00, 'annual_reselection', null),

  -- ── Jackson ────────────────────────────────────────────────
  -- Clarence: Dental
  ('c1000000-0000-0000-0000-000000000032',
   'a1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000020',
   'Delta Dental', 'Dental Select PPO', 'dental', 'active',
   '2021-12-01', null, '2026-12-01', 31.00, 60.00, 'ongoing', '2026-12-01'),

  -- Clarence: Hospital Indemnity
  ('c1000000-0000-0000-0000-000000000033',
   'a1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000020',
   'Aflac', 'Hospital Indemnity Classic', 'ancillary', 'active',
   '2021-12-01', null, '2026-12-01', 22.00, 120.00, 'ongoing', '2026-12-01'),

  -- ── Lee ────────────────────────────────────────────────────
  -- David: MAPD
  ('c1000000-0000-0000-0000-000000000034',
   'a1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000021',
   'Cigna', 'Achieve Plus H0028-115', 'medicare_advantage', 'active',
   '2023-01-01', null, '2026-01-01', 0.00, 587.00, 'annual_reselection', null),

  -- David: Final Expense Whole Life — review on anniversary (Jul)
  ('c1000000-0000-0000-0000-000000000035',
   'a1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000021',
   'Mutual of Omaha', 'Final Expense Whole Life 25K', 'life', 'active',
   '2016-07-01', null, '2026-07-01', 94.00, 340.00, 'ongoing', '2026-07-01'),

  -- Nancy: Medigap Plan G — review on anniversary (Oct)
  ('c1000000-0000-0000-0000-000000000036',
   'a1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000022',
   'Aetna', 'Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2018-10-01', null, '2026-10-01', 172.00, 235.00, 'ongoing', '2026-10-01'),

  -- ── Harris ─────────────────────────────────────────────────
  -- Barbara: Health — lapsed
  ('c1000000-0000-0000-0000-000000000037',
   'a1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000023',
   'Blue Cross Blue Shield', 'Blue Select PPO', 'health', 'lapsed',
   '2023-01-01', '2024-01-01', '2024-01-01', 510.00, 765.00, 'annual_reselection', null),

  -- Barbara: MAPD
  ('c1000000-0000-0000-0000-000000000038',
   'a1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000023',
   'Humana', 'Value Plus H0028-043', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 611.00, 'annual_reselection', null),

  -- ── Clark ──────────────────────────────────────────────────
  -- Thomas: Medigap Plan G — review on anniversary (Apr)
  ('c1000000-0000-0000-0000-000000000039',
   'a1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000024',
   'UnitedHealthcare', 'AARP Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2014-04-01', null, '2026-04-01', 220.00, 300.00, 'ongoing', '2026-04-01'),

  -- Thomas: PDP
  ('c1000000-0000-0000-0000-000000000040',
   'a1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000024',
   'SilverScript', 'Choice Plus', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 24.70, 100.00, 'annual_reselection', null),

  -- Ruth: MAPD
  ('c1000000-0000-0000-0000-000000000041',
   'a1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000025',
   'Humana', 'Gold Plus H5619-014', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 572.00, 'annual_reselection', null),

  -- Michael: Term Life
  ('c1000000-0000-0000-0000-000000000042',
   'a1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000026',
   'Pacific Life', '30-Year Term 500K', 'life', 'active',
   '2019-03-01', null, '2026-03-01', 112.00, 1344.00, 'term_expiration', null),

  -- ── Lewis ──────────────────────────────────────────────────
  -- George: MAPD
  ('c1000000-0000-0000-0000-000000000043',
   'a1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000027',
   'Cigna', 'Preferred Medicare Plus H3916-002', 'medicare_advantage', 'active',
   '2022-01-01', null, '2026-01-01', 23.00, 562.00, 'annual_reselection', null),

  -- George: Dental — review rolling 12 months
  ('c1000000-0000-0000-0000-000000000044',
   'a1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000027',
   'Ameritas', 'Dental PPO Plus', 'dental', 'active',
   '2022-07-01', null, '2026-07-01', 35.00, 72.00, 'ongoing', '2026-07-01'),

  -- George: DVH Ancillary
  ('c1000000-0000-0000-0000-000000000045',
   'a1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000027',
   'Colonial Life', 'DVH Advantage', 'ancillary', 'active',
   '2022-07-01', null, '2026-07-01', 29.00, 132.00, 'ongoing', '2026-07-01'),

  -- Virginia: MAPD
  ('c1000000-0000-0000-0000-000000000046',
   'a1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000028',
   'Cigna', 'Preferred Medicare Plus H3916-002', 'medicare_advantage', 'active',
   '2022-01-01', null, '2026-01-01', 23.00, 562.00, 'annual_reselection', null),

  -- ── Robinson (pending) ─────────────────────────────────────
  ('c1000000-0000-0000-0000-000000000047',
   'a1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000029',
   'Humana', 'HMO Value H1234-005', 'medicare_advantage', 'pending',
   '2026-01-01', null, '2027-01-01', 0.00, 611.00, 'annual_reselection', null),

  -- ── Walker ─────────────────────────────────────────────────
  -- Edward: Medigap Plan N — review on anniversary (Jan)
  ('c1000000-0000-0000-0000-000000000048',
   'a1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000030',
   'Cigna', 'Medicare Supplement Plan N', 'medicare_supplement', 'active',
   '2016-01-01', null, '2026-01-01', 162.00, 220.00, 'ongoing', '2027-01-01'),

  -- Edward: PDP
  ('c1000000-0000-0000-0000-000000000049',
   'a1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000030',
   'WellCare', 'Essential Rx H6034-001', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 19.40, 100.00, 'annual_reselection', null),

  -- Frances: MAPD
  ('c1000000-0000-0000-0000-000000000050',
   'a1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000031',
   'Aetna', 'Choice Plus H3656-011', 'medicare_advantage', 'active',
   '2024-01-01', null, '2026-01-01', 0.00, 557.00, 'annual_reselection', null),

  -- Frances: Dental
  ('c1000000-0000-0000-0000-000000000051',
   'a1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000031',
   'Delta Dental', 'Preferred Plus PPO', 'dental', 'active',
   '2024-01-01', null, '2026-01-01', 28.00, 60.00, 'ongoing', '2027-01-01'),

  -- ── Hall (null renewal_date — missing data) ─────────────────
  -- Marjorie: Medigap Plan G — ongoing, review_due_date set even without renewal_date
  ('c1000000-0000-0000-0000-000000000052',
   'a1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000032',
   'UnitedHealthcare', 'AARP Medicare Supplement Plan G', 'medicare_supplement', 'active',
   '2020-03-01', null, null, 168.00, 230.00, 'ongoing', '2026-09-01'),

  -- ── Allen ──────────────────────────────────────────────────
  -- Raymond: MAPD
  ('c1000000-0000-0000-0000-000000000053',
   'a1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000033',
   'Humana', 'Gold Plus H5619-014', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 557.00, 'annual_reselection', null),

  -- Raymond: PDP
  ('c1000000-0000-0000-0000-000000000054',
   'a1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000033',
   'SilverScript', 'Choice Plus', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 24.70, 100.00, 'annual_reselection', null),

  -- Gloria: MAPD
  ('c1000000-0000-0000-0000-000000000055',
   'a1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000034',
   'Humana', 'Gold Plus H5619-014', 'medicare_advantage', 'active',
   '2025-01-01', null, '2026-01-01', 0.00, 557.00, 'annual_reselection', null),

  -- Gloria: PDP
  ('c1000000-0000-0000-0000-000000000056',
   'a1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000034',
   'SilverScript', 'Choice Plus', 'pdp', 'active',
   '2025-01-01', null, '2026-01-01', 24.70, 100.00, 'annual_reselection', null);
