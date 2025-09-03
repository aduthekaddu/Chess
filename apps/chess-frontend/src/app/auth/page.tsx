"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/utils";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await axios.post(
      `${BASE_URL}/auth/${isLogin ? "login" : "signup"}`,
      { email, password },
      {withCredentials: true}
     
    );
    const data = await res.data;
    if(isLogin){
      localStorage.setItem("chess_app_token", JSON.stringify(data?.token));
      router.push("/create");
      return;
    }

    setIsLogin(true);
    
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96 shadow-lg p-6">
        <CardContent>
          <h2 className="text-2xl font-bold text-center mb-4">
            {isLogin ? "Login" : "Signup"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Signup"}
            </Button>
          </form>
          <p className="text-sm text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-blue-500 underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
