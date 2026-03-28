"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showSuccess, showError } from '@/utils/toast';
import { Users, Shield, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (currentRole === 'superadmin') {
      showError("Nie można zmienić roli superadministratora.");
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showSuccess(`Zmieniono rolę na ${newRole === 'admin' ? 'Administrator' : 'Użytkownik'}`);
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-gray-accent" /> Zarządzanie użytkownikami
          </h1>
          <Link to="/admin">
            <Button variant="outline" className="rounded-full gap-2">
              <ArrowLeft size={16} /> Powrót
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-gray-accent" size={32} />
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map(user => (
              <Card key={user.id} className="rounded-3xl border-none shadow-lg overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center font-bold text-lg">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{user.full_name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={user.role === 'superadmin' ? "destructive" : user.role === 'admin' ? "default" : "secondary"} className="rounded-full px-3">
                          {user.role === 'superadmin' ? 'Superadmin' : user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {user.role !== 'superadmin' && (
                    <Button 
                      variant={user.role === 'admin' ? "outline" : "default"}
                      className="rounded-2xl h-12 px-6 font-bold gap-2"
                      onClick={() => toggleAdmin(user.id, user.role)}
                    >
                      {user.role === 'admin' ? (
                        <><ShieldAlert size={18} /> Odbierz uprawnienia</>
                      ) : (
                        <><Shield size={18} /> Nadaj uprawnienia admina</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;