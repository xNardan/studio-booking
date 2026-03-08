CREATE OR REPLACE FUNCTION public.check_booking_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_booking_start_timestamp TIMESTAMP;
    new_booking_end_timestamp TIMESTAMP;
    existing_booking_start_timestamp TIMESTAMP;
    existing_booking_end_timestamp TIMESTAMP;
BEGIN
    -- Oblicz timestampy dla nowej rezerwacji
    new_booking_start_timestamp := (NEW.booking_date::TEXT || ' ' || NEW.booking_hour)::TIMESTAMP;
    new_booking_end_timestamp := new_booking_start_timestamp + (NEW.number_of_hours || ' hours')::INTERVAL;

    -- Sprawdź, czy nowa rezerwacja nakłada się na istniejące rezerwacje
    IF EXISTS (
        SELECT 1
        FROM public.bookings
        WHERE
            id != NEW.id AND -- Wyklucz aktualizowaną rezerwację (jeśli to update)
            -- Oblicz timestampy dla istniejącej rezerwacji
            (
                (booking_date::TEXT || ' ' || booking_hour)::TIMESTAMP,
                (booking_date::TEXT || ' ' || booking_hour)::TIMESTAMP + (number_of_hours || ' hours')::INTERVAL
            ) OVERLAPS (new_booking_start_timestamp, new_booking_end_timestamp)
    ) THEN
        RAISE EXCEPTION 'Wybrany termin lub część wybranego terminu jest już zajęta.';
    END IF;

    RETURN NEW;
END;
$function$;