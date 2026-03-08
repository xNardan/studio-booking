-- 1. Enable Row Level Security on the availability table
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- 2. Allow anyone (including unauthenticated users) to view the availability
-- This is necessary for the public booking form to function.
CREATE POLICY "Allow public read access" 
ON public.availability 
FOR SELECT 
TO public 
USING (true);

-- 3. Allow only authenticated users (admins) to insert, update, or delete
-- This prevents unauthorized users from modifying the schedule.
CREATE POLICY "Allow authenticated users to manage availability" 
ON public.availability 
FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');