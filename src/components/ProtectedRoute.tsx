"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log("ProtectedRoute: No user found", authError);
        navigate('/login');
        setLoading(false);
        return;
      }

      // Verify admin role in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("ProtectedRoute: Error fetching profile", profileError);
        showError("Błąd weryfikacji profilu. Spróbuj zalogować się ponownie.");
        await supabase.auth.signOut();
        navigate('/login');
      } else if (profile?.role !== 'admin') {
        console.warn(`ProtectedRoute: Access denied. User role is: ${profile?.role}`);
        showError("Brak uprawnień administratora.");
        await supabase.auth.signOut();
        navigate('/login');
      } else {
        setAuthenticated(true);
      }
      
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Weryfikacja uprawnień...</p>
        </div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
};

export default ProtectedRoute;