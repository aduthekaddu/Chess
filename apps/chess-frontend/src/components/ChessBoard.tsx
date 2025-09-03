"use client";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io, Socket } from "socket.io-client";
import { Move } from "@/types/game";
import toast from "react-hot-toast";
import { WS_URL } from "@/lib/utils";

interface ChessBoardProps {
  gameId: number;
}

interface JoinGameResponse {
  assigndColorToPlayer: "white" | "black";
  fen: string;
  error?: string;
}

interface MoveResponse {
  fen: string;
  error?: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ gameId }) => {
  const [game] = useState(new Chess());
  const [boardFen, setBoardFen] = useState<string>();
  const socketRef = useRef<Socket | null>(null);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    const socket = io(WS_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_game_by_id", { gameId }, (data: JoinGameResponse) => {
        if (data?.error) {
          toast.error(data.error);
          return;
        }
        setPlayerColor(data.assigndColorToPlayer);
        setBoardFen(data.fen);
      });
    });

    socket.on("player_joined", () => {
      toast.success("Second Player joined the game");
    });

    socket.on("error", (data: { message?: string }) => {
      if (data?.message) {
        toast.error(data.message);
      }
    });

    socket.on("opponent_move", (data: { fen: string }) => {
      console.log("Opponent move received:", data);
      setBoardFen(data.fen);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socket.off("opponent_move");
    };
  }, [gameId]);

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    const newGame = new Chess(boardFen || game.fen());

    let validMove;
    try {
      validMove = newGame.move({
        from: sourceSquare,
        to: targetSquare,
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Invalid move! " + err.message);
      } else {
        toast.error("Invalid move!");
      }
      return false;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      console.log("Socket is not connected!");
      return false;
    }

    const move: Move = {
      gameId,
      from: sourceSquare,
      to: targetSquare,
      notation: validMove.san,
    };

    socketRef.current.emit("move", { gameId, move }, (data: MoveResponse) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      console.log("Move successful:", data);
      setBoardFen(data.fen);
    });

    if (newGame.isCheckmate()) {
      alert("Checkmate! Game Over.");
      return false;
    }

    if (newGame.isStalemate()) {
      alert("Stalemate! Game Over.");
      return false;
    }

    if (newGame.isInsufficientMaterial()) {
      alert("Insufficient material! Game Over.");
      return false;
    }

    return true;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <h2 className="text-lg font-semibold">Chess Game</h2>
      <div>
        <Chessboard
          position={boardFen}
          onPieceDrop={onDrop}
          boardOrientation={playerColor}
          boardWidth={800}
        />
      </div>
    </div>
  );
};

export default ChessBoard;
