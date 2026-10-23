import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with persisted user or default customer
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedEmail = localStorage.getItem('apex_user_email') || 'customer@apexstore.com';
        const res = await api.login(savedEmail);
        if (res.user) {
          setUser(res.user);
        }
      } catch (e) {
        console.warn('Auth auto-login failed, using fallback customer:', e);
        // Fallback default
        setUser({
          id: 'user-customer-01',
          name: 'Sophia Bennett',
          email: 'customer@apexstore.com',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
          createdAt: new Date().toISOString(),
          addresses: [
            {
              id: 'addr-cust-1',
              fullName: 'Sophia Bennett',
              street: '350 5th Avenue, Apt 18B',
              city: 'New York',
              state: 'NY',
              zipCode: '10118',
              country: 'United States',
              phone: '+1 (555) 987-6543',
              isDefault: true,
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('apex_user_email', res.user.email);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    const targetEmail = newRole === 'admin' ? 'admin@apexstore.com' : 'customer@apexstore.com';
    await login(targetEmail);
  };

  const logout = () => {
    localStorage.removeItem('apex_user_email');
    setUser(null);
  };

  const updateProfile = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const role: UserRole = user?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isLoading,
        login,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
