"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showSuccess, showError } from '@/utils/toast';
import { Calendar as CalendarIcon, LogOut, Loader2, Trash2, Mail, Instagram, User, ArrowLeft, Clock, Filter, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { format, startOfToday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [showAll]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: true })
        .order('booking_hour', { ascending: true });
      
      if (!showAll) {
        const today = format(startOfToday(), 'yyyy-MM-dd');
        query = query.gte('booking_date', today);
      }

      const { data, error } = await query;
      
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-accent shrink-0" /> Lista Rezerwacji
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {showAll ? "Wszystkie rezerwacje (historia i nadchodzące)." : "Tylko dzisiejsze i nadchodzące sesje."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)} 
              className="flex-1 sm:flex-none rounded-full px-4 h-11 gap-2 text-sm"
            >
              <Filter size={16} /> {showAll ? "Nadchodzące" : "Historia"}
            </Button>
            <Link to="/admin" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full rounded-full px-4 h-11 gap-2 text-sm">
                <ArrowLeft size={16} /> Harmonogram
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="flex-1 sm:flex-none rounded-full px-4 h-11 gap-2 text-sm">
              <LogOut size={16} /> Wyloguj
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-accent w-12 h-12" />
          </div>
        ) : bookings.length > 0 ? (
          <>
            {/* Widok tabeli dla desktopów */}
            <div className="hidden md:block bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="font-bold">Data i Godzina</TableHead>
                    <TableHead className="font-bold">Klient</TableHead>
                    <TableHead className="font-bold">Usługa</TableHead>
                    <TableHead className="font-bold">Czas</TableHead>
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
                        <span className="capitalize bg-gray-accent/10 text-gray-accent px-3 py-1 rounded-full text-xs font-bold">
                          {booking.service}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-muted-foreground" />
                          <span>{booking.number_of_hours}h</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <a href={`mailto:${booking.customer_email}`} className="flex items-center gap-2 hover:text-gray-accent transition-colors">
                            <Mail size={14} /> {booking.customer_email}
                          </a>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Instagram size={14} /> {booking.customer_instagram || "Brak IG"}
                          </div>
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

            {/* Widok kart dla mobile */}
            <div className="md:hidden space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border-none shadow-lg rounded-3xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-accent uppercase tracking-wider mb-1">
                          {format(new Date(booking.booking_date), "EEEE, dd.MM", { locale: pl })}
                        </p>
                        <p className="text-2xl font-black">{booking.booking_hour}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-gray-accent/10 text-gray-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                          {booking.service}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                          <Clock size={12} /> {booking.number_of_hours}h
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
                          <User size={14} className="text-muted-foreground" />
                        </div>
                        <span className="font-bold">{booking.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
                          <Mail size={14} className="text-muted-foreground" />
                        </div>
                        <a href={`mailto:${booking.customer_email}`} className="text-sm text-muted-foreground truncate">
                          {booking.customer_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
                          <Instagram size={14} className="text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {booking.customer_instagram || "Brak Instagrama"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        className="flex-1 rounded-2xl h-12 font-bold gap-2"
                        onClick={() => handleDelete(booking.id)}
                      >
                        <Trash2 size={18} /> Usuń rezerwację
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-[2rem] shadow-xl">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground">Brak rezerwacji</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {showAll ? "Baza danych jest pusta." : "Nie masz żadnych nadchodzących rezerwacji."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBookings;