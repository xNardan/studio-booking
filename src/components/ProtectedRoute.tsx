"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          navigate('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle(); // Używamy maybeSingle zamiast single, aby uniknąć błędu 406

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // Nie wylogowujemy od razu, dajemy szansę na odświeżenie
          showError("Problem z dostępem do profilu. Spróbuj odświeżyć stronę.");
          return;
        }

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
          showError("Brak uprawnień administratora.");
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        setAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Weryfikacja uprawnień...</p>
        </div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
};

export default ProtectedRoute;