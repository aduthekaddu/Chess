import { Server } from "socket.io";
import Redis from "ioredis";
import db from "@chess/db/client";
import { Chess } from "chess.js";
import { Queue } from "bullmq";
import { authenticated } from "./authenticate";

const redis = new Redis();
// Create a queue for storing moves
export const moveQueue = new Queue("moveQueue", { connection: redis });
export const gameQueue = new Queue("gameQueue", { connection: redis });

const io = new Server(5000, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

const gameSockets: {
  [gameId: string]: { playerId: string; socketId: string }[];
} = {};

enum GameResult {
  COMPLETED = "COMPLETED",
  DRAW = "DRAW",
  IN_PROGRESS = "IN_PROGRESS",
  NOT_STARTED = "NOT_STARTED",
  WHITE_WON = "WHITE_WON",
  BLACK_WON = "BLACK_WON",
}

const checkGameStatus = async (gameId: number, chess: Chess) => {
  if (!chess.isGameOver()) {
    return;
  }

  let result: GameResult;

  if (chess.isCheckmate()) {
    const winner =
      chess.turn() === "w" ? GameResult.BLACK_WON : GameResult.WHITE_WON;
    result = winner;
  } else if (chess.isDraw()) {
    result = GameResult.DRAW;
  } else {
    result = GameResult.COMPLETED;
  }

  // Update the game result in the database
  await db.game.update({
    where: { id: gameId },
    data: { result },
  });

  return result;
};

const assignColorToPlayer = async (
  game: any,
  playerId: string,
  assigndColorToPlayer: "white" | "black"
) => {
  if (game.whiteId === playerId || game.blackId === playerId) {
    assigndColorToPlayer = game.whiteId === playerId ? "white" : "black";
    return assigndColorToPlayer;
  } else {
    if (!game.whiteId) {
      game.whiteId = playerId;
      assigndColorToPlayer = "white";
    } else if (!game.blackId) {
      game.blackId = playerId;
      assigndColorToPlayer = "black";
    }
  }

  await db.game.update({
    where: { id: game.id },
    data: { whiteId: game.whiteId, blackId: game.blackId },
  });

  return assigndColorToPlayer;
};

io.on("connection", async (socket) => {
  const playerId = await authenticated(socket);
  if (!playerId) {
    console.log("Authentication failed");
    return socket.emit("error", {
      message: "Authentication failed, Login Again",
    });
  }

  socket.on("join_game_by_id", async (data, callback) => {
    if (typeof data === "string") data = JSON.parse(data);

    console.log("Data received:", data);
    const { gameId } = data;

    // gameSockets[gameId] = gameSockets[gameId] || [];
    // gameSockets[gameId].push({ playerId, socketId: socket.id });

    const game = await db.game.findUnique({
      where: {
        id: Number(gameId),
      },
      include: { moves: true },
    });

    if (!game) {
      return callback(socket.emit("error", { message: "Game not found!" }));
    }

    let assigndColorToPlayer: "white" | "black" = "white";
    assigndColorToPlayer = await assignColorToPlayer(
      game,
      playerId,
      assigndColorToPlayer
    );

    if (game.whiteId && game.blackId) {
      if (game.whiteId !== playerId && game.blackId !== playerId) {
        return callback(
          socket.emit("error", {
            message: "Game already started! You can't enter",
          })
        );
      } else {
        const fen = await redis.get(`game:${gameId}:fen`);
        if (!fen) {
          const chess = new Chess();
          game.moves.forEach((m) => chess.move(m.notation));
          await redis.set(`game:${gameId}:fen`, chess.fen());
        }
        socket.join(gameId);
        socket.to(gameId).emit("player_joined", { playerId, gameId });
        return callback({
          success: true,
          message: "Joined successfully",
          fen,
          assigndColorToPlayer,
        });
      }
    }

    let fen = await redis.get(`game:${gameId}:fen`);
    if (!fen) {
      const chess = new Chess();
      //resume the game from the last position (agar game pause kar diya tha to)
      game.moves.forEach((m) => chess.move(m.notation));
      fen = chess.fen();
      await redis.set(`game:${gameId}:fen`, fen);
    }

    socket.join(gameId);
    socket
      .to(gameId)
      .emit("player_joined", { playerId, gameId, assigndColorToPlayer });
    callback({
      success: true,
      message: "Joined successfully",
      gameId,
      fen,
      assigndColorToPlayer,
    });
  });

  socket.on("move", async (data, callback) => {
    try {
      let parsedData;
      try {
        parsedData = typeof data === "string" ? JSON.parse(data) : data;
      } catch (error) {
        return callback(socket.emit("error", { message: "Invalid move" }));
      }

      const { gameId } = parsedData;
      const { from, to, notation } = parsedData.move;

      // Fetch game details
      const game = await db.game.findUnique({
        where: { id: gameId },
        select: { whiteId: true, blackId: true, fen: true },
      });

      if (!game) {
        return callback(socket.emit("error", { message: "Game not found" }));
      }

      let fen = (await redis.get(`game:${gameId}:fen`)) || game.fen;
      if (!fen) {
        return callback(
          socket.emit("error", {
            message: "Game board state is not available",
          })
        );
      }

      const chess = new Chess(fen);

      // Get the current player's color
      const playerTurn = game.whiteId === playerId ? "w" : "b";
      if (chess.turn() !== playerTurn) {
        return socket.emit("error", { message: "It's not your turn!" });
      }

      // Apply the move only if it's the correct turn
      const validMove = chess.move(notation);
      if (!validMove) {
        return callback(socket.emit("error", { message: "Invalid move" }));
      }

      // Update FEN
      fen = chess.fen();
      io.emit("opponent_move",  { from, to, notation, fen });

      // Store in DB & Redis
      await redis.set(`game:${gameId}:fen`, fen);
      const moveNumkey = `game:${gameId}:moveNum`;
      let moveNum = Number(await redis.get(moveNumkey));

      if (!moveNum) {
        const lastMove = await db.move.findFirst({
          where: { gameId },
          orderBy: { moveNum: "desc" },
          select: { moveNum: true },
        });

        moveNum = lastMove ? lastMove.moveNum : 0;
        await redis.set(moveNumkey, moveNum);
      }


      //store game in DB through queue
      gameQueue.add(
        "updateGame",
        { gameId, fen },
        { removeOnComplete: true }
      );

      // Store move in queue
      moveNum = await redis.incr(moveNumkey);
      moveQueue.add(
        "storeMove",
        { gameId, playerId, moveNum, notation },
        { removeOnComplete: true }
      );

      
      const gameStatus = await checkGameStatus(gameId, chess);
      if (gameStatus) {
        io.to(gameId).to(gameId).emit("game_over", {
          message: "Game Over",
          result: gameStatus,
        });
      }

    } catch (error: any) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:5000");
