import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { MOVE } from "../screens/Game";
import { useState } from "react";
interface ChessBoardIT {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  setBoard: any;
  chess: any;
}

export function ChessBoard({ chess, board, socket, setBoard }: ChessBoardIT) {
  const [from, setFrom] = useState<null | Square>(null);
  // const [to, setTo] = useState<null | Square>(null);
  return (
    <div className="text-white-200">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const currSquare = (String.fromCharCode(97 + (j % 8)) +
                "" +
                (8 - i)) as Square;
              // console.log(currSquare);
              return (
                <div
                  onClick={() => {
                    if (!from) {
                      setFrom(currSquare);
                    } else {
                      // setTo(square?.square ?? null);
                      socket.send(
                        JSON.stringify({
                          type: MOVE,
                          payload: {
                            move: { from, to: currSquare },
                          },
                        })
                      );
                      setFrom(null);
                      chess.move({ from, to: currSquare });
                      setBoard(chess.board());
                      console.log({ from, to: currSquare });
                    }
                  }}
                  key={j}
                  className={`w-16 h-16 ${
                    (i + j) % 2 ? "bg-green-300" : "bg-slate-300"
                  }`}
                >
                  <div className="w-full flex justify-center h-full">
                    <div className="h-full justify-center flex flex-col">
                      {square ? (
                        <img
                          className="w-10 h-10"
                          src={`/${
                            square?.color === "b"
                              ? `b${square.type}`
                              : `w${square.type}`
                          }.png`}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
