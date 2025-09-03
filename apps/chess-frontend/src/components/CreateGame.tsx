"use client";

import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CreateGame() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [color, setColor] = useState<string>("white");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/game/create`, { color },{withCredentials: true});
      setGameId(response.data.id);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to create game");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Chess Game</h1>

      <div className="mb-4">
        <label className="mr-2 text-lg">Choose Color:</label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
      </div>

      <button
        onClick={createGame}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-700"
      >
        {loading ? "Creating..." : "Create Game"}
      </button>

      {gameId && (
        <div className="mt-6 p-4 bg-green-700 rounded-lg text-lg">
          Game ID: <span className="font-bold">{gameId}</span>
        </div>
      )}
      {error && <div className="mt-4 text-red-400">{error}</div>}

      <button
        onClick={() => router.push("/")}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-700"
      >
        join
      </button>
    </div>
  );
}
