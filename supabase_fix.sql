-- 1. Create the availability table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_name TEXT UNIQUE NOT NULL,
  hours TEXT[] DEFAULT '{}' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
-- This prevents any access to the table unless a policy allows it.
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow anyone (public) to view the schedule
-- This is necessary so customers can see available slots in the booking form.
DROP POLICY IF EXISTS "Allow public read access" ON availability;
CREATE POLICY "Allow public read access" 
ON availability FOR SELECT 
TO public 
USING (true);

-- 4. Create a policy to allow only authenticated users to manage the schedule
-- This ensures only you (after logging in) can update the hours.
DROP POLICY IF EXISTS "Allow authenticated management" ON availability;
CREATE POLICY "Allow authenticated management" 
ON availability FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. (Optional) Insert initial data if the table is empty
INSERT INTO availability (day_name, hours)
VALUES 
  ('Poniedziałek', '{"09:00", "10:00", "11:00", "12:00"}'),
  ('Wtorek', '{"09:00", "10:00", "11:00", "12:00"}'),
  ('Środa', '{"09:00", "10:00", "11:00", "12:00"}'),
  ('Czwartek', '{"09:00", "10:00", "11:00", "12:00"}'),
  ('Piątek', '{"09:00", "10:00", "11:00", "12:00"}'),
  ('Sobota', '{}'),
  ('Niedziela', '{}')
ON CONFLICT (day_name) DO NOTHING;