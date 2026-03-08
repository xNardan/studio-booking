"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showSuccess, showError } from '@/utils/toast';
import { Calendar as CalendarIcon, LogOut, Loader2, Trash2, Mail, Phone, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: true });
      
      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      showError("Błąd pobierania rezerwacji: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę rezerwację?")) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => prev.filter(b => b.id !== id));
      showSuccess("Rezerwacja została usunięta.");
    } catch (error: any) {
      showError("Błąd usuwania: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow w-12 h-12" />
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
              <CalendarIcon className="text-yellow" /> Lista Rezerwacji
            </h1>
            <p className="text-muted-foreground">Zarządzaj nadchodzącymi sesjami w studio.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin">
              <Button variant="outline" className="rounded-full px-6 h-12 gap-2">
                <ArrowLeft size={18} /> Harmonogram
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="rounded-full px-6 h-12 gap-2">
              <LogOut size={18} /> Wyloguj
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="font-bold">Data i Godzina</TableHead>
                    <TableHead className="font-bold">Klient</TableHead>
                    <TableHead className="font-bold">Usługa</TableHead>
                    <TableHead className="font-bold">Kontakt</TableHead>
                    <TableHead className="text-right font-bold">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-secondary/10 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold">{format(new Date(booking.booking_date), "dd.MM.yyyy", { locale: pl })}</span>
                          <span className="text-muted-foreground">{booking.booking_hour}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-muted-foreground" />
                          <span className="font-semibold">{booking.customer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize bg-yellow/10 text-yellow px-3 py-1 rounded-full text-xs font-bold">
                          {booking.service}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <a href={`mailto:${booking.customer_email}`} className="flex items-center gap-2 hover:text-yellow transition-colors">
                            <Mail size={14} /> {booking.customer_email}
                          </a>
                          <a href={`tel:${booking.customer_phone}`} className="flex items-center gap-2 hover:text-yellow transition-colors">
                            <Phone size={14} /> {booking.customer_phone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="rounded-xl h-10 w-10"
                          onClick={() => handleDelete(booking.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground">Brak rezerwacji</h3>
              <p className="text-sm text-muted-foreground mt-1">Wszystkie nowe rezerwacje pojawią się tutaj.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBookings;