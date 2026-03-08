"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      setHasAccepted(true);
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setHasAccepted(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setHasAccepted(false); // Możesz dostosować, co się dzieje po odrzuceniu
    setIsVisible(false);
    // Tutaj można dodać logikę do blokowania niepotrzebnych cookies
  };

  if (!isVisible || hasAccepted) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[999] bg-card border-t border-border shadow-lg p-4 md:p-6",
      "flex flex-col md:flex-row items-center justify-between gap-4",
      "rounded-t-3xl md:rounded-t-none md:rounded-tl-3xl md:rounded-tr-3xl"
    )}>
      <p className="text-sm text-muted-foreground text-center md:text-left">
        Używamy plików cookie, aby zapewnić najlepszą jakość korzystania z naszej strony. Kontynuując, zgadzasz się na ich użycie. Więcej informacji znajdziesz w naszej{" "}
        <Link to="/privacy-policy" className="text-gray-accent hover:underline font-medium">
          Polityce Prywatności
        </Link>
        .
      </p>
      <div className="flex gap-3 w-full md:w-auto">
        <Button onClick={handleAccept} className="w-full md:w-auto rounded-full font-bold bg-gray-accent text-primary-foreground hover:bg-gray-accent/90">
          Akceptuję
        </Button>
        <Button onClick={handleDecline} variant="outline" className="w-full md:w-auto rounded-full font-bold border-border hover:bg-secondary">
          Odrzucam
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;