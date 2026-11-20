-- Add optional responsive video backgrounds to homepage hero slides.
ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS mobile_video_url TEXT;
