-- Funkcja sprawdzająca dostępność godzin z uwzględnieniem czasu trwania rezerwacji
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
    existing_booking_end_time TIME;
    new_booking_start_time TIME;
    new_booking_end_time TIME;
BEGIN
    -- Konwertuj godziny rezerwacji na typ TIME
    new_booking_start_time := NEW.booking_hour::TIME;
    new_booking_end_time := (NEW.booking_hour::TIME + (NEW.number_of_hours || ' hours')::INTERVAL);

    -- Sprawdź, czy nowa rezerwacja nakłada się na istniejące rezerwacje
    IF EXISTS (
        SELECT 1
        FROM public.bookings
        WHERE
            booking_date = NEW.booking_date AND
            id != NEW.id AND -- Wyklucz aktualizowaną rezerwację (jeśli to update)
            (
                -- Istniejąca rezerwacja zaczyna się w trakcie nowej rezerwacji
                (booking_hour::TIME >= new_booking_start_time AND booking_hour::TIME < new_booking_end_time)
                OR
                -- Istniejąca rezerwacja kończy się w trakcie nowej rezerwacji
                ((booking_hour::TIME + (number_of_hours || ' hours')::INTERVAL) > new_booking_start_time AND (booking_hour::TIME + (number_of_hours || ' hours')::INTERVAL) <= new_booking_end_time)
                OR
                -- Nowa rezerwacja zawiera istniejącą rezerwację
                (booking_hour::TIME < new_booking_start_time AND (booking_hour::TIME + (number_of_hours || ' hours')::INTERVAL) > new_booking_end_time)
                OR
                -- Istniejąca rezerwacja zawiera nową rezerwację
                (new_booking_start_time < booking_hour::TIME AND new_booking_end_time > (booking_hour::TIME + (number_of_hours || ' hours')::INTERVAL))
            )
    ) THEN
        RAISE EXCEPTION 'Wybrany termin lub część wybranego terminu jest już zajęta.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger wywoływany przed wstawieniem nowej rezerwacji
CREATE TRIGGER check_booking_overlap_trigger
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION check_booking_overlap();

-- Trigger wywoływany przed aktualizacją rezerwacji (jeśli kiedykolwiek będzie taka możliwość)
CREATE TRIGGER check_booking_overlap_update_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION check_booking_overlap();