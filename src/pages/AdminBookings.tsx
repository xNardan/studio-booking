"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showSuccess, showError } from '@/utils/toast';
import { Calendar as CalendarIcon, LogOut, Loader2, Trash2, Mail, Instagram, User, ArrowLeft, Clock, Filter, Headphones } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { format, startOfToday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [admins, setAdmins] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
    fetchBookings();
  }, [showAll]);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(a => map[a.id] = a.full_name || 'Realizator');
      setAdmins(map);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = supabase.from('bookings').select('*').order('booking_date', { ascending: true });
      if (!showAll) query = query.gte('booking_date', format(startOfToday(), 'yyyy-MM-dd'));
      const { data, error } = await query;
      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć rezerwację?")) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
      showSuccess("Usunięto.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarIcon className="text-gray-accent" /> Rezerwacje</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="rounded-full"><Filter size={16} /></Button>
            <Link to="/admin"><Button variant="outline" className="rounded-full"><ArrowLeft size={16} /></Button></Link>
          </div>
        </div>

        {loading ? <Loader2 className="animate-spin mx-auto" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="rounded-3xl border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-accent uppercase">{format(new Date(booking.booking_date), "EEEE, dd.MM", { locale: pl })}</p>
                      <p className="text-xl font-black">{booking.booking_hour}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground justify-end"><Clock size={12} /> {booking.number_of_hours}h</div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-gray-accent bg-gray-accent/10 px-2 py-0.5 rounded-full">
                        <Headphones size={10} /> {admins[booking.admin_id] || 'Realizator'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 font-bold"><User size={14} /> {booking.customer_name}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Mail size={14} /> {booking.customer_email}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Instagram size={14} /> {booking.customer_instagram || "Brak IG"}</div>
                  </div>
                  <Button variant="destructive" className="w-full rounded-2xl h-12 font-bold gap-2" onClick={() => handleDelete(booking.id)}>
                    <Trash2 size={18} /> Usuń rezerwację
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBookings;