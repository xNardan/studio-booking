"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess } from '@/utils/toast';
import { Save, Calendar as CalendarIcon } from 'lucide-react';

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i + 1).padStart(2, '0')}:00`);

const AdminAvailability = () => {
  // Stan przechowujący dostępność: { "Poniedziałek": ["09:00", "10:00"], ... }
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

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

  const handleSave = () => {
    console.log("Zapisano dostępność:", availability);
    showSuccess("Harmonogram został zapisany pomyślnie!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-primary" /> Panel Realizatora
            </h1>
            <p className="text-muted-foreground">Zaznacz godziny, w których jesteś dostępny w studiu.</p>
          </div>
          <Button onClick={handleSave} className="rounded-full px-8 h-12 gap-2">
            <Save size={18} /> Zapisz zmiany
          </Button>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAvailability;