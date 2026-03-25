/*
  # SmileShot Admin Control Schema

  1. New Tables
    - `roast_messages`
      - `id` (uuid, primary key)
      - `level` (int, 0-4)
      - `message` (text)
      - `audio_url` (text, optional)
      - `is_active` (boolean)
      - `order_index` (int)
      - `created_at` (timestamptz)
    
    - `app_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `updated_at` (timestamptz)
    
    - `smile_detected_messages`
      - `id` (uuid, primary key)
      - `message` (text)
      - `audio_url` (text, optional)
      - `is_active` (boolean)
      - `order_index` (int)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Allow public read access for app functionality
    - Require authentication for write operations (admin only)
*/

CREATE TABLE IF NOT EXISTS roast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level int NOT NULL DEFAULT 0,
  message text NOT NULL,
  audio_url text,
  is_active boolean DEFAULT true,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smile_detected_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  audio_url text,
  is_active boolean DEFAULT true,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE smile_detected_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roast messages"
  ON roast_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert roast messages"
  ON roast_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update roast messages"
  ON roast_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete roast messages"
  ON roast_messages FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert app settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read smile detected messages"
  ON smile_detected_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert smile detected messages"
  ON smile_detected_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update smile detected messages"
  ON smile_detected_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete smile detected messages"
  ON smile_detected_messages FOR DELETE
  TO authenticated
  USING (true);