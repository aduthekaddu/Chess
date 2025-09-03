import { Worker } from "bullmq";
import db from "@chess/db/client"; 
import Redis from "ioredis";

const redisConnection = new Redis();

// Create a worker that processes moves
const moveWorker = new Worker(
  "moveQueue",
  async (job) => {
    const { gameId, playerId, moveNum, notation } = job.data;
    
    await db.move.create({
      data: {
        gameId,
        playerId,
        moveNum,
        notation,
      },
    });

  },
  { connection: redisConnection }
);

moveWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});


