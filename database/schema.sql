-- Alagu Decor & Wedding Planner — PostgreSQL schema (run once on Supabase)
-- Safe to re-run: every statement is idempotent.

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- FIXED service categories. No application code ever inserts, updates or
-- deletes rows here at runtime — only this seed script does.
CREATE TABLE IF NOT EXISTS gallery_categories (
    id   BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL
);

-- FIXED subcategories per category. Same rule: seed-only, never runtime-mutated.
CREATE TABLE IF NOT EXISTS gallery_subcategories (
    id          BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES gallery_categories(id) ON DELETE RESTRICT,
    slug        VARCHAR(100) NOT NULL,
    name        VARCHAR(150) NOT NULL,
    UNIQUE (category_id, slug)
);

-- The ONLY gallery table the admin can write to.
CREATE TABLE IF NOT EXISTS gallery_items (
    id                   BIGSERIAL PRIMARY KEY,
    category_id          BIGINT NOT NULL REFERENCES gallery_categories(id) ON DELETE RESTRICT,
    subcategory_id       BIGINT NOT NULL REFERENCES gallery_subcategories(id) ON DELETE RESTRICT,
    title                VARCHAR(255) NOT NULL,
    description          TEXT,
    image_url            TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    published            BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_category    ON gallery_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_subcategory ON gallery_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_published   ON gallery_items(published);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured    ON gallery_items(is_featured);

CREATE TABLE IF NOT EXISTS enquiries (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(30)  NOT NULL,
    email       VARCHAR(255) NOT NULL,
    event_type  VARCHAR(100) NOT NULL,
    event_date  DATE NOT NULL,
    location    VARCHAR(255) NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    services    TEXT,
    message     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    status      VARCHAR(30) NOT NULL DEFAULT 'NEW'
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);

-- ============================================================
-- SEED: fixed categories (mirrors frontend/src/config/services.ts)
-- ============================================================

INSERT INTO gallery_categories (slug, name) VALUES
    ('decorations',       'Decorations'),
    ('event-production',  'Event Production'),
    ('food-hospitality',  'Food & Hospitality'),
    ('entertainment',     'Entertainment'),
    ('gifts',             'Gifts'),
    ('music-and-entries', 'Music & Entries'),
    ('photography',       'Photography')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: fixed subcategories
-- ============================================================

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('wedding',    'Wedding'),
    ('engagement', 'Engagement'),
    ('haldi',      'Haldi'),
    ('reception',  'Reception'),
    ('corporate',  'Corporate'),
    ('stage',      'Stage'),
    ('entrance',   'Entrance'),
    ('floral',     'Floral'),
    ('theme',      'Theme')
) AS v(slug, name) ON true
WHERE c.slug = 'decorations'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('audio',       'Audio'),
    ('lighting',    'Lighting'),
    ('dj',          'DJ Setup'),
    ('led-screens', 'LED Screens')
) AS v(slug, name) ON true
WHERE c.slug = 'event-production'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('catering',      'Catering'),
    ('live-counters', 'Live Counters'),
    ('beverages',     'Beverages'),
    ('desserts',      'Desserts')
) AS v(slug, name) ON true
WHERE c.slug = 'food-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('couple-games',      'Couple Games'),
    ('guest-activities',  'Guest Activities'),
    ('live-performances', 'Live Performances')
) AS v(slug, name) ON true
WHERE c.slug = 'entertainment'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('return-gifts',  'Return Gifts'),
    ('favors',        'Favors'),
    ('welcome-gifts', 'Welcome Gifts')
) AS v(slug, name) ON true
WHERE c.slug = 'gifts'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('band',            'Band'),
    ('bride-entry',      'Bride Entry'),
    ('groom-entry',      'Groom Entry'),
    ('couple-entry',     'Couple Entry'),
    ('special-entries',  'Special Entries')
) AS v(slug, name) ON true
WHERE c.slug = 'music-and-entries'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO gallery_subcategories (category_id, slug, name)
SELECT c.id, v.slug, v.name FROM gallery_categories c
JOIN (VALUES
    ('wedding',     'Wedding'),
    ('engagement',  'Engagement'),
    ('candid',      'Candid'),
    ('traditional', 'Traditional'),
    ('pre-wedding', 'Pre-Wedding'),
    ('videography', 'Videography')
) AS v(slug, name) ON true
WHERE c.slug = 'photography'
ON CONFLICT (category_id, slug) DO NOTHING;

-- NOTE: no admin row is seeded here — the backend's AdminSeeder creates the
-- first admin account automatically on boot from INITIAL_ADMIN_EMAIL /
-- INITIAL_ADMIN_PASSWORD in your .env, so a real bcrypt hash is always used
-- instead of a hand-written one in this script.
