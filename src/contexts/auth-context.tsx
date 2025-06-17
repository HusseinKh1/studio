
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TokenDto, AppUser } from '@/types/api';
import { loginUser as apiLogin, registerUser as apiRegister, signOutUser as apiSignOut } from '@/lib/api-service';
import type { UserLoginRequest, UserRegisterRequest } from '@/types/api';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Using jwt-decode for simplicity, consider a more robust library for production

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: UserLoginRequest) => Promise<void>;
  register: (userData: UserRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  email: string;
  role: 'Admin' | 'User';
  nameid: string; // Standard claim for User ID
  unique_name: string; // Often used for UserName
  exp: number;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(storedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            id: decodedToken.nameid,
            email: decodedToken.email,
            role: decodedToken.role,
            userName: decodedToken.unique_name,
            firstName: decodedToken.unique_name, 
            lastName: '', 
            address: '', 
          });
        } else {
          // Token expired
          localStorage.removeItem('accessToken');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('accessToken');
        setUser(null);
        setToken(null);
      }
    } else {
      // No token in storage, ensure states are null
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = (tokenDto: TokenDto) => {
    localStorage.setItem('accessToken', tokenDto.accessToken);
    setToken(tokenDto.accessToken);
    setUser({
      id: tokenDto.id,
      email: tokenDto.email,
      role: tokenDto.role,
      userName: tokenDto.userName,
      firstName: tokenDto.userName, 
      lastName: '', 
      address: '', 
    });
  };

  const login = async (credentials: UserLoginRequest) => {
    setIsLoading(true);
    try {
      const tokenDto = await apiLogin(credentials);
      handleAuthResponse(tokenDto);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegisterRequest) => {
    setIsLoading(true);
    try {
      const tokenDto = await apiRegister(userData);
      handleAuthResponse(tokenDto);
      router.push('/'); 
    } catch (error) {
      console.error('Registration failed:', error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
        try {
            await apiSignOut(user.id);
        } catch (error) {
            console.error("Sign out API call failed:", error);
        }
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const isAuthenticated = () => !!token && !!user;
  const isAdmin = () => !!user && user.role === 'Admin';


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
