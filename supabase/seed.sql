-- Seed templates for CreativeAI
INSERT INTO public.templates (title, category, prompt, style_preset, aspect_ratio, is_featured, is_free, sort_order, thumbnail_url)
VALUES
  ('Cyberpunk Street', 'wallpaper', 'A futuristic cyberpunk street with neon signs, rain on the pavement, cinematic lighting', 'digital_art', '16:9', true, true, 1, 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=800'),
  ('Lush Jungle Portal', 'artistic', 'A mystical stone portal leading to a lush alien jungle, glowing flora, high detail', 'photorealistic', '1:1', true, true, 2, 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800'),
  ('Minimalist Portrait', 'avatar', 'A minimalist vector portrait of a woman with aesthetic accessories, beige background', 'digital_art', '1:1', false, true, 3, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'),
  ('Samurai Sunset', 'artistic', 'A silhouette of a samurai standing on a cliff at sunset, vibrant orange clouds, Japanese ink style', 'anime', '16:9', true, false, 4, 'https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&q=80&w=800'),
  ('Tech YouTube Thumbnail', 'thumbnail', 'Close up of a futuristic sleek gadget on a dark pedestal, glowing blue lights, macro photography', 'photorealistic', '16:9', true, true, 5, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'),
  ('Cosmic Astronaut', 'wallpaper', 'An astronaut floating in deep space, reflections of a nebula on the visor, interstellar vibes', 'cinematic', '9:16', false, true, 6, 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800');
