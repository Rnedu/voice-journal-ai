"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Fetch user profile (optional, if backend has a /profile route)
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {user && <p className="text-lg mb-4">Welcome, {user.email}!</p>}
      <button
        className="bg-red-500 text-white p-2 rounded"
        onClick={() => {
          logout();
          router.push("/auth/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
