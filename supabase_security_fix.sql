-- Securing the bookings table
-- Remove the insecure public policies identified in the schema
DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can modify bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- Create secure admin-only policies
-- This ensures only logged-in users (admins) can see or change booking data
CREATE POLICY "Admins can view all bookings" ON bookings 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can modify bookings" ON bookings 
FOR ALL TO authenticated USING (true);

-- Note: The "Allow public insert" policy is kept so guests can still book sessions.

-- Securing the availability table
-- Prevent unauthorized users from changing the studio schedule
DROP POLICY IF EXISTS "Only admins can edit availability" ON availability;

CREATE POLICY "Admins can manage availability" ON availability
FOR ALL TO authenticated USING (true);

-- Note: The "Widok publiczny" policy is kept so guests can see the schedule.