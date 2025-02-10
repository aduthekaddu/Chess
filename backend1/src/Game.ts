import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private moves: string[];
  private startTime: Date;
  private moveCount: number;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date();
    this.moveCount = 0;
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      console.log("illegal move by player 1");
      return;
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      console.log("illegal move by player 2");
      return;
    }
    try {
      this.board.move(move);
    } catch (e) {
      console.log(e);
      return;
    }
    if (this.board.isGameOver()) {
      console.log("game over");
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        })
      );

      return;
    }
    if (this.moveCount % 2 === 0) {
      console.log("sending to user 2");
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      console.log("sending to user 1");
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
  }
}
