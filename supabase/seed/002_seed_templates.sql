-- ─────────────────────────────────────────────────────────────────
--  Seed: 002_seed_templates.sql
--  50 launch templates across 6 categories (PRD Section 6.2)
--  Run via: supabase db push OR npx supabase db reset
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.templates (title, category, thumbnail_url, prompt, style_preset, aspect_ratio, is_featured, is_free, sort_order) VALUES

-- ── Social Posts (12 templates) ───────────────────────────────────
('Instagram Quote Card',      'social_post', '/templates/instagram-quote.webp',    'Minimal aesthetic Instagram quote card with soft pastel background, elegant serif font, warm lighting', 'photorealistic', '1:1', TRUE,  TRUE,  1),
('TikTok Thumbnail Pop',      'social_post', '/templates/tiktok-thumb.webp',       'Bold vibrant TikTok video thumbnail, young energetic person with expressive face, bright neon background', 'digital_art',   '9:16',FALSE, TRUE,  2),
('Twitter/X Header Banner',   'social_post', '/templates/twitter-header.webp',     'Wide clean professional Twitter header banner, abstract geometric gradient background, modern tech aesthetic', 'digital_art',   '3:2', TRUE,  TRUE,  3),
('LinkedIn Thought Leadership','social_post', '/templates/linkedin-banner.webp',   'Professional LinkedIn banner with subtle blue gradient, corporate but human feel, minimalist and clean', 'photorealistic','16:9',FALSE, FALSE, 4),
('Pinterest Infographic',     'social_post', '/templates/pinterest-info.webp',     'Elegant Pinterest-style infographic layout, botanical illustration, cream background, decorative borders', 'watercolor',    '2:3', FALSE, TRUE,  5),
('Instagram Reel Cover',      'social_post', '/templates/ig-reel.webp',            'Stunning Instagram Reel cover art, dramatic cinematic lighting, subject centered with lens flare', 'cinematic',     '9:16',FALSE, TRUE,  6),
('YouTube Community Post',    'social_post', '/templates/yt-community.webp',       'Eye-catching YouTube community post image, colorful and fun, bold typography space, creator aesthetic', 'digital_art',   '1:1', FALSE, FALSE, 7),
('Twitter/X Profile Banner',  'social_post', '/templates/twitter-profile.webp',   'Creative personal brand Twitter banner, hand-drawn illustration style, whimsical and unique', 'watercolor',    '3:2', FALSE, TRUE,  8),
('Facebook Cover Photo',      'social_post', '/templates/facebook-cover.webp',     'Warm and inviting Facebook cover photo, golden hour lighting, lifestyle feel, natural and authentic', 'photorealistic','16:9',FALSE, TRUE,  9),
('Instagram Story Background','social_post', '/templates/ig-story-bg.webp',       'Beautiful abstract Instagram story background, pastel gradient swirls, minimal and aesthetic', 'digital_art',   '9:16',FALSE, TRUE,  10),
('Threads Post Visual',       'social_post', '/templates/threads-visual.webp',     'Clean bold Threads app visual, high contrast, typographic layout space, modern editorial style', 'photorealistic','1:1', FALSE, FALSE, 11),
('BeReal Aesthetic',          'social_post', '/templates/bereal.webp',             'Candid authentic lifestyle moment, natural indoor lighting, lo-fi cozy aesthetic, genuine feel', 'photorealistic','1:1', FALSE, TRUE,  12),

-- ── YouTube & Thumbnails (10 templates) ──────────────────────────
('Gaming Epic Thumbnail',     'thumbnail',   '/templates/gaming-thumb.webp',      'Epic gaming YouTube thumbnail, dramatic character pose, explosion effects, bold neon colors, intense expression', 'digital_art',   '16:9',TRUE,  TRUE,  1),
('Vlog Travel Cover',         'thumbnail',   '/templates/vlog-cover.webp',        'Cinematic travel vlog thumbnail, beautiful landscape at golden hour, adventurer silhouette, wanderlust aesthetic', 'cinematic',     '16:9',FALSE, TRUE,  2),
('Tutorial How-To Thumb',     'thumbnail',   '/templates/tutorial-thumb.webp',    'Clean professional tutorial thumbnail, before and after comparison layout, bright background, informative feel', 'photorealistic','16:9',FALSE, TRUE,  3),
('Reaction Face Meme',        'thumbnail',   '/templates/reaction-thumb.webp',    'Exaggerated shocked reaction face thumbnail, bright yellow/red background, comic meme style exaggeration', 'digital_art',   '16:9',FALSE, TRUE,  4),
('Cooking Recipe Card',       'thumbnail',   '/templates/recipe-thumb.webp',      'Mouth-watering food photography thumbnail, restaurant-quality plating, warm lighting, delicious close-up', 'photorealistic','16:9',FALSE, TRUE,  5),
('Fitness Transformation',    'thumbnail',   '/templates/fitness-thumb.webp',     'Motivational fitness thumbnail, athletic silhouette in dramatic lighting, bold and energetic composition', 'cinematic',     '16:9',FALSE, FALSE, 6),
('Tech Review Clean',         'thumbnail',   '/templates/tech-thumb.webp',        'Clean modern tech review thumbnail, product on white/light background, professional studio lighting', 'photorealistic','16:9',FALSE, FALSE, 7),
('True Crime Documentary',    'thumbnail',   '/templates/truecrime-thumb.webp',   'Moody dark true crime thumbnail, newspaper clippings aesthetic, dramatic shadows, investigative feel', 'cinematic',     '16:9',FALSE, FALSE, 8),
('Kids Educational',          'thumbnail',   '/templates/kids-thumb.webp',        'Bright colorful kids educational YouTube thumbnail, cartoon animal characters, friendly and fun', 'anime',         '16:9',FALSE, TRUE,  9),
('Podcast Episode Cover',     'thumbnail',   '/templates/podcast-thumb.webp',     'Professional podcast episode thumbnail, two person conversation setup, clean modern layout, mic and headphone elements', 'photorealistic','16:9',FALSE, TRUE, 10),

-- ── Wallpapers (8 templates) ──────────────────────────────────────
('Neon City at Night',        'wallpaper',   '/templates/neon-city.webp',         'Cyberpunk neon city at night, rain reflections on streets, Tokyo-inspired, blade runner aesthetic, ultra-detailed', 'digital_art',   '16:9',TRUE,  TRUE,  1),
('Forest Dawn Desktop',       'wallpaper',   '/templates/forest-dawn.webp',       'Misty forest at dawn, sunbeams through ancient trees, ethereal and peaceful, soft atmospheric light', 'photorealistic','16:9',FALSE, TRUE,  2),
('Abstract Gradient Art',     'wallpaper',   '/templates/abstract-grad.webp',     'Beautiful abstract fluid art, vivid gradients of purple orange and pink, smooth flowing shapes', 'digital_art',   '16:9',FALSE, TRUE,  3),
('Lo-Fi Cozy Room',           'wallpaper',   '/templates/lofi-room.webp',         'Cozy lo-fi bedroom at night, rain on window, warm lamp light, desk setup, anime aesthetic', 'anime',         '16:9',FALSE, TRUE,  4),
('Mountain Landscape',        'wallpaper',   '/templates/mountain.webp',          'Breathtaking mountain range at sunset, reflection in crystal lake, dramatic clouds, landscape photography', 'photorealistic','16:9',FALSE, TRUE,  5),
('Space Nebula',              'wallpaper',   '/templates/nebula.webp',            'Stunning space nebula with stars, vibrant cosmic colors, deep space photography style, galactic wonder', 'digital_art',   '16:9',FALSE, FALSE, 6),
('Minimalist Zen',            'wallpaper',   '/templates/zen-minimal.webp',       'Minimalist zen wallpaper, single cherry blossom branch, white background, Japanese ink painting style', 'watercolor',    '16:9',FALSE, TRUE,  7),
('Phone Wallpaper — Floral',  'wallpaper',   '/templates/floral-phone.webp',      'Beautiful floral phone wallpaper, botanical illustration, soft watercolor flowers, delicate and feminine', 'watercolor',    '9:16',FALSE, TRUE,  8),

-- ── Profile Avatars (8 templates) ────────────────────────────────
('Anime Avatar Female',       'avatar',      '/templates/anime-f.webp',           'Cute anime girl profile avatar, expressive eyes, colorful hair, studio quality, clean background', 'anime',         '1:1', TRUE,  TRUE,  1),
('Anime Avatar Male',         'avatar',      '/templates/anime-m.webp',           'Cool anime male character avatar, dark hair, serious expression, action anime style', 'anime',         '1:1', FALSE, TRUE,  2),
('Pixel Art Character',       'avatar',      '/templates/pixel-avatar.webp',      '16-bit pixel art character portrait, retro RPG game style, cute and expressive, colorful', 'pixel_art',     '1:1', FALSE, TRUE,  3),
('Fantasy Portrait Female',   'avatar',      '/templates/fantasy-f.webp',         'Beautiful fantasy elf portrait, glowing eyes, magical atmosphere, detailed fantasy art', 'digital_art',   '1:1', FALSE, TRUE,  4),
('Fantasy Portrait Male',     'avatar',      '/templates/fantasy-m.webp',         'Heroic fantasy knight portrait, armored, dramatic lighting, epic fantasy art style', 'digital_art',   '1:1', FALSE, TRUE,  5),
('Chibi Cartoon Self',        'avatar',      '/templates/chibi.webp',             'Adorable chibi cartoon character, big head small body, cute expression, clean line art', 'anime',         '1:1', FALSE, FALSE, 6),
('3D Cartoon Avatar',         'avatar',      '/templates/3d-avatar.webp',         'Playful 3D cartoon avatar, Pixar-inspired style, friendly expression, smooth render', '3d_render',     '1:1', FALSE, FALSE, 7),
('Oil Portrait Classic',      'avatar',      '/templates/oil-portrait.webp',      'Classical oil painting portrait avatar, old master style, dramatic side lighting, rich colors', 'oil_painting',  '1:1', FALSE, FALSE, 8),

-- ── Artistic / Creative (10 templates) ───────────────────────────
('Impressionist Landscape',   'artistic',    '/templates/impressionist.webp',     'Monet-inspired impressionist landscape painting, dappled sunlight on water, soft brushstrokes, garden scene', 'oil_painting',  '3:2', TRUE,  TRUE,  1),
('Watercolor Botanicals',     'artistic',    '/templates/botanicals.webp',        'Delicate watercolor botanical illustration, tropical leaves and flowers, scientific illustration style', 'watercolor',    '2:3', FALSE, TRUE,  2),
('Retro Movie Poster',        'artistic',    '/templates/retro-poster.webp',      '1950s retro movie poster aesthetic, bold typography layout, dramatic illustration, vintage Americana', 'digital_art',   '2:3', FALSE, TRUE,  3),
('Surreal Dream Scene',       'artistic',    '/templates/surreal.webp',           'Surrealist painting inspired by Dali, impossible landscape, melting objects, dreamlike and strange', 'digital_art',   '3:2', FALSE, FALSE, 4),
('Ukiyo-e Woodblock',         'artistic',    '/templates/ukiyo-e.webp',           'Traditional Japanese ukiyo-e woodblock print style, Mount Fuji, flat bold colors, decorative borders', 'digital_art',   '3:2', FALSE, TRUE,  5),
('Street Art Graffiti',       'artistic',    '/templates/street-art.webp',        'Urban street art mural, bold graffiti lettering, vibrant colors, city wall backdrop', 'digital_art',   '3:2', FALSE, FALSE, 6),
('Stained Glass Pattern',     'artistic',    '/templates/stained-glass.webp',     'Beautiful stained glass window design, geometric floral pattern, vibrant colored light, cathedral style', 'digital_art',   '1:1', FALSE, TRUE,  7),
('Pencil Sketch Portrait',    'artistic',    '/templates/pencil-sketch.webp',     'Detailed pencil sketch portrait, cross-hatching technique, white paper texture, fine art drawing', 'digital_art',   '2:3', FALSE, TRUE,  8),
('Art Nouveau Poster',        'artistic',    '/templates/art-nouveau.webp',       'Art Nouveau decorative poster, flowing organic lines, botanical motifs, Mucha-inspired, elegant', 'digital_art',   '2:3', FALSE, FALSE, 9),
('Abstract Expressionism',    'artistic',    '/templates/abstract-exp.webp',      'Bold abstract expressionist painting, gestural brushstrokes, primary colors, raw emotional energy', 'oil_painting',  '3:2', FALSE, FALSE, 10),

-- ── Seasonal & Events (6 templates) ──────────────────────────────
('Birthday Celebration Card', 'seasonal',    '/templates/birthday.webp',          'Festive birthday celebration art, colorful balloons and confetti, cheerful and joyful atmosphere', 'digital_art',   '1:1', TRUE,  TRUE,  1),
('Winter Holiday Greeting',   'seasonal',    '/templates/holiday.webp',           'Cozy winter holiday scene, snow-covered cabin, warm glowing windows, pine trees, festive and warm', 'watercolor',    '1:1', FALSE, TRUE,  2),
('Valentine Heart Art',       'seasonal',    '/templates/valentines.webp',        'Romantic Valentine art, soft pink and red roses, hearts, dreamy bokeh background, love and warmth', 'watercolor',    '1:1', FALSE, TRUE,  3),
('New Year Fireworks',        'seasonal',    '/templates/newyear.webp',           'Spectacular New Year fireworks over city skyline, midnight celebration, colorful light show', 'photorealistic','16:9',FALSE, TRUE,  4),
('Halloween Spooky Scene',    'seasonal',    '/templates/halloween.webp',         'Spooky Halloween scene, haunted house on hill, full moon, bats flying, orange and purple palette', 'digital_art',   '16:9',FALSE, TRUE,  5),
('Spring Cherry Blossoms',    'seasonal',    '/templates/spring.webp',            'Beautiful spring cherry blossom scene, sakura petals falling, peaceful Japanese garden, pastel pink', 'watercolor',    '3:2', FALSE, TRUE,  6);
