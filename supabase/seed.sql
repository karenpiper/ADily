-- ============================================
-- EDITION 1: 2/2/2026 (Current)
-- ============================================

INSERT INTO editions (id, date, hero_summary, hero_description, featured_meme_url, is_current)
VALUES (
  'e1000000-0000-4000-8000-000000000001',
  '2026-02-02',
  'This week, users are reflecting on simpler times and exploring ways to use social media more intentionally, while some express frustration with how platforms are influencing their online experience and communities.',
  'A lightweight, always-on social intelligence and inspiration program designed to keep Amazon Ads'' social work modern, credible, and performance-driven',
  '/images/placeholder.jpg',
  true
);

-- ============================================
-- MEMES — Edition 2/2/2026
-- ============================================

INSERT INTO posts (id, edition_id, category_id, headline)
VALUES (
  'b1000000-0000-4000-8000-000000000001',
  'e1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE slug = 'memes'),
  'Audiences, yearning for more, are transforming online fatigue into real-life fulfillment.'
);

INSERT INTO post_insights (post_id, label, description, sort_order) VALUES
('b1000000-0000-4000-8000-000000000001', 'Nostalgia Reigns:', 'Audiences crave nostalgic content that provides an emotional connection and reflects both the evolution of pop culture and their own personal lives.', 1),
('b1000000-0000-4000-8000-000000000001', 'Social Media Fatigue:', 'Users are growing weary of endless scrolling through the ever-changing landscapes of social media, feeling overwhelmed by constant updates and curated content.', 2),
('b1000000-0000-4000-8000-000000000001', 'Audience Seek Empowerment:', 'Inspirational content that encourages people to embrace spontaneity and be more experimental with life choices.', 3);

-- Memes media items (2/2/2026) — 4 images in the grid
INSERT INTO media_items (post_id, type, url, caption, sort_order, size) VALUES
('b1000000-0000-4000-8000-000000000001', 'image', '/images/placeholder.jpg', '2026 is the new 2016 - nostalgia meme', 1, 'large'),
('b1000000-0000-4000-8000-000000000001', 'image', '/images/placeholder.jpg', 'People in 1999 vs 2026 - internet escape meme', 2, 'medium'),
('b1000000-0000-4000-8000-000000000001', 'image', '/images/placeholder.jpg', 'Life is too short, buy that dress - street sign meme', 3, 'medium'),
('b1000000-0000-4000-8000-000000000001', 'image', '/images/placeholder.jpg', 'Me every time I scroll on LinkedIn - frustration meme', 4, 'medium');

-- ============================================
-- MEMES — Edition 12/2025 (older edition, images only, no headline/insights)
-- ============================================

INSERT INTO editions (id, date, hero_summary, hero_description, is_current)
VALUES (
  'e2000000-0000-4000-8000-000000000002',
  '2025-12-01',
  '',
  'A lightweight, always-on social intelligence and inspiration program designed to keep Amazon Ads'' social work modern, credible, and performance-driven',
  false
);

INSERT INTO posts (id, edition_id, category_id, headline)
VALUES (
  'b2000000-0000-4000-8000-000000000002',
  'e2000000-0000-4000-8000-000000000002',
  (SELECT id FROM categories WHERE slug = 'memes'),
  ''
);

INSERT INTO media_items (post_id, type, url, caption, sort_order, size) VALUES
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Whitney Houston reaction', 1, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Salt Bae seasoning', 2, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'chatGPT algorithms battle meme', 3, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Bernie Sanders once again asking what', 4, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'I cant go the rest of my life asking if its AI or not', 5, 'large'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Marketer tiktok client meetings ad budgets mental health meme', 6, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Elaine from Seinfeld dancing', 7, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'SEO bubble chart - keyword research, comp analysis, etc', 8, 'large'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Meryl Streep - Truth is no one can do what I do', 9, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Me organizing my Pinterest boards instead of doing my real responsibilities', 10, 'medium'),
('b2000000-0000-4000-8000-000000000002', 'image', '/images/placeholder.jpg', 'Pills rattling meme', 11, 'medium');


-- ============================================
-- DESIGN — Edition 2/2/2026
-- ============================================

INSERT INTO posts (id, edition_id, category_id, headline)
VALUES (
  'b3000000-0000-4000-8000-000000000003',
  'e1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE slug = 'design'),
  'Design That Cuts Through Complexity, Humanizes Experience, and Brings Creative Ideas to Life Through Shape, Scale, and Motion'
);

INSERT INTO post_insights (post_id, label, description, sort_order) VALUES
('b3000000-0000-4000-8000-000000000003', 'These brands don''t add complexity - they clarify:', 'Clear forms, deliberate choices, and purposeful design make the message easier to see, understand, and remember.', 1),
('b3000000-0000-4000-8000-000000000003', 'They simplify the complex and humanize UI:', 'brands are making innovation feel accessible by turning powerful tools into experiences audiences instantly understand and trust.', 2),
('b3000000-0000-4000-8000-000000000003', 'Shape, Scale, and Perspective:', 'using motion, sound, and perspective to guide attention, create depth, and make ideas feel more immersive and intuitive.', 3);

INSERT INTO media_items (post_id, type, url, caption, sort_order, size) VALUES
('b3000000-0000-4000-8000-000000000003', 'image', '/images/placeholder.jpg', 'Aesop store front - dark moody retail design', 1, 'medium'),
('b3000000-0000-4000-8000-000000000003', 'image', '/images/placeholder.jpg', 'YOUR BEST YEAR - bold typography design', 2, 'medium'),
('b3000000-0000-4000-8000-000000000003', 'video', '/images/placeholder.jpg', 'Woman with pink Stanley cup at 8:00 AM - social video', 3, 'medium'),
('b3000000-0000-4000-8000-000000000003', 'image', '/images/placeholder.jpg', 'Paper magazine POV collage - what everyone was talking about on our street corner of the internet this week', 4, 'large'),
('b3000000-0000-4000-8000-000000000003', 'video', '/images/placeholder.jpg', 'Rose/flower macro close-up video', 5, 'medium'),
('b3000000-0000-4000-8000-000000000003', 'video', '/images/placeholder.jpg', 'Metallic staircase/surface video', 6, 'medium');

-- Design 12/2025 — images only grid (no headline/insights visible)
INSERT INTO posts (id, edition_id, category_id, headline)
VALUES (
  'b4000000-0000-4000-8000-000000000004',
  'e2000000-0000-4000-8000-000000000002',
  (SELECT id FROM categories WHERE slug = 'design'),
  ''
);

INSERT INTO media_items (post_id, type, url, caption, sort_order, size) VALUES
('b4000000-0000-4000-8000-000000000004', 'image', '/images/placeholder.jpg', 'Green gradient sunscreen product shot', 1, 'large'),
('b4000000-0000-4000-8000-000000000004', 'image', '/images/placeholder.jpg', 'LinkedIn Like Comment Repost Send - Appinventiv 163k followers', 2, 'medium'),
('b4000000-0000-4000-8000-000000000004', 'image', '/images/placeholder.jpg', 'Pizza Hut box hand delivery - playful brand design', 3, 'medium'),
('b4000000-0000-4000-8000-000000000004', 'image', '/images/placeholder.jpg', 'AG water bottle - A life without bloating ad', 4, 'medium'),
('b4000000-0000-4000-8000-000000000004', 'image', '/images/placeholder.jpg', 'Phone with tiny people arranging products - ecommerce UX', 5, 'medium'),
('b4000000-0000-4000-8000-000000000004', 'image', '/images/placeholder.jpg', 'Oatside oat milk on laptop - packaging design', 6, 'large');


-- ============================================
-- VIDEO — Edition 2/2/2026
-- ============================================

INSERT INTO posts (id, edition_id, category_id, headline)
VALUES (
  'b5000000-0000-4000-8000-000000000005',
  'e1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE slug = 'video'),
  'Audiences crave content that puts humans first, digs beneath the surface, offers space to recharge and connect.'
);

INSERT INTO post_insights (post_id, label, description, sort_order) VALUES
('b5000000-0000-4000-8000-000000000005', 'Beyond the Surface:', 'Audiences are looking for content that offers escape through obscure layered humor or uncovers a deeper meaning, giving audiences more than what meets the eye', 1),
('b5000000-0000-4000-8000-000000000005', 'Unplug to Recharge:', 'Users are making efforts to escape endless feeds, looking for offline experiences to recharge, find balance, and fight social media burnout', 2),
('b5000000-0000-4000-8000-000000000005', 'Creators Shine, Audiences Engage:', 'Audiences light up for content that spotlights brand-creator partnerships, while fast, culturally tuned brand reactions boost engagement and signal authenticity', 3),
('b5000000-0000-4000-8000-000000000005', 'See the People, Not Just the Product:', 'Users are drawn to content that goes beyond the product, highlighting office culture through behind-the-scenes content and offering a more human-focused perspective from the brand.', 4);

INSERT INTO media_items (post_id, type, url, caption, sort_order, size) VALUES
('b5000000-0000-4000-8000-000000000005', 'video', '/images/placeholder.jpg', 'Whats in my analog bag - vintage items haul', 1, 'large'),
('b5000000-0000-4000-8000-000000000005', 'video', '/images/placeholder.jpg', 'What the office looks like when you work in k-beauty', 2, 'medium'),
('b5000000-0000-4000-8000-000000000005', 'video', '/images/placeholder.jpg', 'Penguins on ice - Those - cinematic nature', 3, 'large'),
('b5000000-0000-4000-8000-000000000005', 'video', '/images/placeholder.jpg', 'My impression of an owl if the owl was Jennifer Coolidge - TikTok @lukefranchina', 4, 'medium'),
('b5000000-0000-4000-8000-000000000005', 'video', '/images/placeholder.jpg', 'What 2016 was actually like btw - TikTok @notgr4ce', 5, 'medium'),
('b5000000-0000-4000-8000-000000000005', 'video', '/images/placeholder.jpg', 'Editing the boys trip like a reality show', 6, 'medium');


-- ============================================
-- ARTICLES — Edition 2/2/2026
-- ============================================

INSERT INTO posts (id, edition_id, category_id, headline)
VALUES (
  'b6000000-0000-4000-8000-000000000006',
  'e1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE slug = 'articles'),
  'People First, Platforms Second: Authentic engagement matters more than clicks or features, putting humans rather than mechanics at the center of social.'
);

INSERT INTO post_insights (post_id, label, description, sort_order) VALUES
('b6000000-0000-4000-8000-000000000006', 'Connection Over Clicks:', 'As social platforms evolve,users are craving the human side of social — prioritizing authentic connection and resisting changes that feel transactional or inauthentic.', 1),
('b6000000-0000-4000-8000-000000000006', 'Authenticity Isn''t Optional:', 'While platforms introduce new features to address this tension, skepticism remains. For B2B marketers, this raises the bar;relevance and trust must be earned, not engineered.', 2);

-- Article 1: Desocialized Media
INSERT INTO articles (post_id, title, url, summary, image_url, sort_order) VALUES
('b6000000-0000-4000-8000-000000000006',
 'Welcome to Desocialized Media: Platforms built to connect people, for better or for worse, are now for doing the opposite',
 'https://example.com/desocialized-media',
 'Instagram''s shift to Reels has moved the platform from social connection to algorithm-driven entertainment, ushering in what the article calls "desocialized media." The article argues that by prioritizing AI-driven recommendations over content from people''s actual networks, Instagram now feels more like a passive consumption feed than a true social network.',
 '/images/placeholder.jpg',
 1);

-- Article 2: UpScrolled
INSERT INTO articles (post_id, title, url, summary, image_url, sort_order) VALUES
('b6000000-0000-4000-8000-000000000006',
 'Social network Upscrolled sees surge in downloads following TikTok''s US takeover',
 'https://example.com/upscrolled-surge',
 'UpScrolled, a new social app, saw a sharp rise in downloads after TikTok''s U.S. takeover as users searched for alternatives. The app, which offers familiar features like photos, videos, and messaging, has climbed the App Store charts and is expanding to support the surge of new users.',
 '/images/placeholder.jpg',
 2);

-- Article 3: TikTok concerns
INSERT INTO articles (post_id, title, url, summary, image_url, sort_order) VALUES
('b6000000-0000-4000-8000-000000000006',
 'So you want to leave TikTok?',
 'https://example.com/leave-tiktok',
 'After TikTok''s U.S. business was taken over by American investors including Oracle''s Larry Ellison, some users and creators noticed posts about topics like ICE disappearing, prompting accusations of censorship from figures such as Billie Eilish and Megan Stalter, and a loss of trust in the platform. In response, many people are exploring alternatives like the UpScrolled app, which offers a more chronological and independent social experience',
 '/images/placeholder.jpg',
 3);

-- Article 4: Instagram Friends
INSERT INTO articles (post_id, title, url, summary, image_url, sort_order) VALUES
('b6000000-0000-4000-8000-000000000006',
 'Instagram Tests Displaying ''Friends'' Instead of ''Following''',
 'https://example.com/instagram-friends',
 'Instagram is testing a change that would replace the traditional "Following" display on profiles with a "Friends" count that shows only mutual followers, highlighting two-way connections instead of everyone you follow. The company says the test is meant to make real connections more visible, though it could also change how people perceive popularity and discovery on the platform',
 '/images/placeholder.jpg',
 4);
