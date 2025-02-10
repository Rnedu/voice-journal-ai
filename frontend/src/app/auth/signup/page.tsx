"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        email,
        password,
      });
      router.push("/auth/login");
    } catch (err) {
      setError("Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input
        className="border p-2 mb-2 w-64"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mb-4 w-64"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-green-500 text-white p-2 rounded" onClick={handleSignup}>
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
