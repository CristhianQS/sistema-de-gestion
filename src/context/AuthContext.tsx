import React, { createContext, useContext, useState, useEffect } from 'react';
//import { supabase } from '../lib/supabase';

interface AdminUser {
  id: number;
  email: string;
  password: string;
  created_at: string;
  name: string | null;
  area_id: number | null;
  role: 'admin_black' | 'admin_oro' | 'admin_plata';
}

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), // Send email and password
    });

      if (!res.ok) {
      throw new Error('Error de inicio de sesión');
    }

    const data = await res.json();

    console.log(data)

    if (!data.success) {
      return { success: false, message: data.message || 'Email o contraseña incorrectos' };
    }

      setUser(data.data as AdminUser);
      localStorage.setItem('admin_user', JSON.stringify(data.data));
      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: 'Error al conectar con el servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};