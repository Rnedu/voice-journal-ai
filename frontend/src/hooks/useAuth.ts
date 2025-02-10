"use client";
import { useState } from "react";
import axios from "axios";
import { atom, useAtom } from "jotai";

// Store JWT token globally
const authAtom = atom<string | null>(null);

export const useAuth = () => {
  const [authToken, setAuthToken] = useAtom(authAtom);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      });
      setAuthToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem("token");
  };

  return { authToken, login, logout, loading };
};
