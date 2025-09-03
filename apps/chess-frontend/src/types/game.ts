export interface Move {
    gameId: number;
    from: string;
    to: string;
    notation: string;
  }
  
  export interface GameState {
    fen: string;
  }
  