-- Usuwamy starą, niebezpieczną politykę, która pozwalała każdemu zalogowanemu użytkownikowi na edycję
DROP POLICY IF EXISTS "Edycja dla admina" ON availability;

-- Tworzymy nową, bezpieczną politykę ograniczoną do konkretnego adresu email administratora
CREATE POLICY "Admin only access" ON availability
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@flowstudio.pl')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@flowstudio.pl');

-- Upewniamy się, że publiczny widok (tylko do odczytu) nadal działa dla klientów
-- Ta polityka już istnieje w schemacie jako "Widok publiczny"
-- CREATE POLICY "Widok publiczny" ON availability FOR SELECT USING (true);