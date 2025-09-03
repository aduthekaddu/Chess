"use client";
import { useState } from "react";
import ChessBoard from "@/components/ChessBoard";
import { useRouter } from "next/navigation";

export default function Home() {
  const [gameId, setGameId] = useState<number>(3);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const router = useRouter();

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Online Chess Game</h1>

      {!isGameStarted ? (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(Number(e.target.value))}
            className="border p-2 rounded"
          />
          
          <button
            onClick={() => setIsGameStarted(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Join Game 2
          </button>

          <button
            onClick={() =>router.push("/create")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
          
        </div>
      ) : (
        <ChessBoard gameId={gameId} />
      )}
    </div>
  );
}
