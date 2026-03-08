"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gray-accent/30 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 rounded-full hover:bg-secondary">
              <ArrowLeft size={18} /> Powrót do strony głównej
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6 text-center">Polityka Prywatności</h1>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Niniejsza Polityka Prywatności określa zasady gromadzenia, przetwarzania i wykorzystywania danych osobowych pozyskanych od Państwa przez Flow Studio, prowadzone przez FlowStudioBp, z siedzibą w Jana Pawła II 11, za pośrednictwem strony internetowej www.flowstudiobp.pl.
          </p>
          <p>
            Dokładamy wszelkich starań, aby zapewnić poszanowanie Państwa prywatności i ochronę przekazanych nam danych osobowych podczas korzystania z naszej strony internetowej oraz usług.
          </p>

          <h2>1. Administrator Danych Osobowych</h2>
          <p>
            Administratorem Państwa danych osobowych jest Flow Studio, FlowStudioBp, Jana Pawła II 11.
          </p>

          <h2>2. Rodzaje Gromadzonych Danych</h2>
          <p>
            Gromadzimy następujące dane osobowe:
          </p>
          <ul>
            <li>Dane podane dobrowolnie przez Użytkownika w formularzach (np. formularz kontaktowy, formularz rezerwacji): imię, nazwisko/pseudonim, adres e-mail, numer telefonu, nazwa użytkownika Instagram.</li>
            <li>Dane zbierane automatycznie podczas korzystania ze strony internetowej: adres IP, dane o przeglądarce internetowej, systemie operacyjnym, czasie spędzonym na stronie, odwiedzanych podstronach. Dane te są zbierane za pośrednictwem plików cookies i innych technologii śledzących.</li>
          </ul>

          <h2>3. Cele Przetwarzania Danych</h2>
          <p>
            Państwa dane osobowe są przetwarzane w następujących celach:
          </p>
          <ul>
            <li>Realizacja usług świadczonych przez Flow Studio (np. rezerwacja sesji nagraniowej, miks i mastering).</li>
            <li>Obsługa zapytań kierowanych za pośrednictwem formularza kontaktowego.</li>
            <li>Marketing bezpośredni własnych usług (za Państwa zgodą).</li>
            <li>Analiza i statystyka korzystania ze strony internetowej w celu jej optymalizacji i poprawy jakości usług.</li>
            <li>Wypełnienie obowiązków prawnych ciążących na Administratorze (np. podatkowych, rachunkowych).</li>
            <li>Dochodzenie lub obrona przed roszczeniami.</li>
          </ul>

          <h2>4. Podstawa Prawna Przetwarzania Danych</h2>
          <p>
            Podstawą prawną przetwarzania Państwa danych osobowych jest:
          </p>
          <ul>
            <li>Niezbędność do wykonania umowy lub do podjęcia działań na Państwa żądanie przed zawarciem umowy (art. 6 ust. 1 lit. b RODO).</li>
            <li>Prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO), np. marketing bezpośredni, analiza danych, dochodzenie roszczeń.</li>
            <li>Państwa zgoda (art. 6 ust. 1 lit. a RODO), w przypadku celów marketingowych, na które wyrazili Państwo zgodę.</li>
            <li>Niezbędność do wypełnienia obowiązku prawnego ciążącego na Administratorze (art. 6 ust. 1 lit. c RODO).</li>
          </ul>

          <h2>5. Okres Przechowywania Danych</h2>
          <p>
            Państwa dane osobowe będą przechowywane przez okres niezbędny do realizacji celów, dla których zostały zebrane, a także przez okres wynikający z przepisów prawa (np. podatkowych, rachunkowych) lub do momentu przedawnienia ewentualnych roszczeń.
          </p>

          <h2>6. Odbiorcy Danych</h2>
          <p>
            Państwa dane osobowe mogą być przekazywane podmiotom współpracującym z Flow Studio w celu realizacji usług (np. dostawcy usług hostingowych, dostawcy usług płatniczych, podmioty świadczące usługi IT, podmioty świadczące usługi marketingowe). Wszystkie te podmioty przetwarzają dane na podstawie umów powierzenia przetwarzania danych i zapewniają odpowiedni poziom ochrony danych.
          </p>

          <h2>7. Państwa Prawa</h2>
          <p>
            Przysługują Państwu następujące prawa związane z przetwarzaniem danych osobowych:
          </p>
          <ul>
            <li>Prawo dostępu do swoich danych oraz otrzymania ich kopii.</li>
            <li>Prawo do sprostowania (poprawiania) swoich danych.</li>
            <li>Prawo do usunięcia danych (prawo do bycia zapomnianym).</li>
            <li>Prawo do ograniczenia przetwarzania danych.</li>
            <li>Prawo do przenoszenia danych.</li>
            <li>Prawo do wniesienia sprzeciwu wobec przetwarzania danych.</li>
            <li>Prawo do wycofania zgody na przetwarzanie danych w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem.</li>
            <li>Prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
          </ul>
          <p>
            W celu realizacji powyższych praw prosimy o kontakt pod adresem e-mail: flowstudiobp@gmail.com.
          </p>

          <h2>8. Pliki Cookies</h2>
          <p>
            Nasza strona internetowa wykorzystuje pliki cookies. Szczegółowe informacje na ten temat znajdują się w naszej Polityce Cookies.
          </p>

          <h2>9. Zmiany w Polityce Prywatności</h2>
          <p>
            Niniejsza Polityka Prywatności może być aktualizowana. O wszelkich zmianach będziemy informować na naszej stronie internetowej.
          </p>
          <p>
            Data ostatniej aktualizacji: 2026-01-01
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;