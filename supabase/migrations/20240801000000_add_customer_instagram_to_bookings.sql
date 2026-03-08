ALTER TABLE public.bookings
ADD COLUMN customer_instagram TEXT;

-- Opcjonalnie, jeśli chcesz, aby to pole było wymagane (NOT NULL), możesz użyć:
-- ALTER TABLE public.bookings
-- ADD COLUMN customer_instagram TEXT NOT NULL DEFAULT '';
-- Pamiętaj, aby w takim przypadku zaktualizować istniejące wiersze, jeśli takie są,
-- aby miały wartość domyślną przed dodaniem NOT NULL.