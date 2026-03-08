"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess, showError } from '@/utils/toast';
import { Save, Calendar as CalendarIcon, LogOut, Loader2, ListChecks } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const hours = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 08:00 - 22:00

const AdminAvailability = () => {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*');
      
      if (error) throw error;

      const formatted: Record<string, string[]> = {};
      // Inicjalizujemy puste dni
      days.forEach(day => formatted[day] = []);
      
      // Wypełniamy danymi z bazy
      if (data) {
        data.forEach((curr: any) => {
          formatted[curr.day_name] = curr.hours;
        });
      }
      
      setAvailability(formatted);
    } catch (error: any) {
      showError("Błąd pobierania: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHour = (day: string, hour: string) => {
    setAvailability(prev => {
      const dayHours = prev[day] || [];
      if (dayHours.includes(hour)) {
        return { ...prev, [day]: dayHours.filter(h => h !== hour) };
      } else {
        return { ...prev, [day]: [...dayHours, hour] };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(availability).map(([day, hrs]) => ({
        day_name: day,
        hours: hrs
      }));

      const { error } = await supabase
        .from('availability')
        .upsert(updates, { onConflict: 'day_name' });

      if (error) throw error;
      showSuccess("Harmonogram został zapisany!");
    } catch (error: any) {
      showError("Błąd zapisu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-accent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-accent" /> Panel Realizatora
            </h1>
            <p className="text-muted-foreground">Zaznacz godziny, w których jesteś dostępny.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/bookings">
              <Button variant="outline" className="rounded-full px-6 h-12 gap-2">
                <ListChecks size={18} /> Rezerwacje
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="rounded-full px-6 h-12 gap-2">
              <LogOut size={18} /> Wyloguj
            </Button>
            <Button onClick={handleSave} className="rounded-full px-8 h-12 gap-2" disabled={saving}>
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="p-4 text-left border-b border-border font-bold">Godzina</th>
                  {days.map(day => (
                    <th key={day} className="p-4 text-center border-b border-border font-bold min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 border-b border-border font-medium text-sm">{hour}</td>
                    {days.map(day => (
                      <td key={`${day}-${hour}`} className="p-4 border-b border-border text-center">
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={(availability[day] || []).includes(hour)}
                            onCheckedChange={() => toggleHour(day, hour)}
                            className="w-6 h-6 rounded-md"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  };

export default AdminAvailability;