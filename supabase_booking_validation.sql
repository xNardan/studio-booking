-- 1. Add a unique constraint to prevent double bookings on the same date and hour
ALTER TABLE public.bookings 
ADD CONSTRAINT unique_booking_slot UNIQUE (booking_date, booking_hour);

-- 2. Create a function to validate that the booking matches the studio's availability
CREATE OR REPLACE FUNCTION public.validate_booking_availability()
RETURNS TRIGGER AS $$
DECLARE
    day_name_pl TEXT;
    is_available BOOLEAN;
BEGIN
    -- Map PostgreSQL day of week (0-6) to Polish day names used in the availability table
    SELECT CASE EXTRACT(DOW FROM NEW.booking_date)
        WHEN 0 THEN 'Niedziela'
        WHEN 1 THEN 'Poniedziałek'
        WHEN 2 THEN 'Wtorek'
        WHEN 3 THEN 'Środa'
        WHEN 4 THEN 'Czwartek'
        WHEN 5 THEN 'Piątek'
        WHEN 6 THEN 'Sobota'
    END INTO day_name_pl;

    -- Check if the requested hour exists in the availability for that specific day
    SELECT EXISTS (
        SELECT 1 
        FROM public.availability 
        WHERE day_name = day_name_pl 
        AND NEW.booking_hour = ANY(hours)
    ) INTO is_available;

    -- If the slot is not in the availability table, block the insert
    IF NOT is_available THEN
        RAISE EXCEPTION 'Wybrany termin (%) w dniu % nie jest dostępny w grafiku.', NEW.booking_hour, day_name_pl;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger that runs before every insert on the bookings table
DROP TRIGGER IF EXISTS check_booking_availability ON public.bookings;
CREATE TRIGGER check_booking_availability
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_availability();