import { Worker } from "bullmq";
import db from "@chess/db/client"; 
import Redis from "ioredis";

const redisConnection = new Redis();

// Create a worker that processes moves
const gameWorker = new Worker(
  "updateGame",
  async (job) => {
    const { gameId, fen } = job.data;
    
    await db.game.update({
        where: {
            id: Number(gameId),
        },
        data: {
            fen: fen,
        },
    });

  },
  { connection: redisConnection }
);

gameWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});


