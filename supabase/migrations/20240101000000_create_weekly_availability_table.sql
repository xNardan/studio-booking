-- Create weekly_availability table
CREATE TABLE public.weekly_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date DATE NOT NULL UNIQUE,
  availability_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.weekly_availability ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_availability
-- Admins can manage all weekly availability
CREATE POLICY "Admins can manage weekly availability" ON public.weekly_availability
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Users can view weekly availability (if needed, otherwise remove)
CREATE POLICY "Users can view weekly availability" ON public.weekly_availability
FOR SELECT USING (true);

-- Optional: Function to update 'updated_at' on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_availability_updated_at
BEFORE UPDATE ON public.weekly_availability
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();