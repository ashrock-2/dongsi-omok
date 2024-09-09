export type Player = 'black' | 'white';
export type BoardItem = Player | 'prohibit' | 'plan';
export type Board = Array<Array<BoardItem | null>>;
export type GameState =
  | 'WAITING_FOR_OPPONENT'
  | 'AWAIT_MOVE'
  | 'IN_PROGRESS'
  | 'GAME_OVER'
  | 'LEAVE_OPPONENT';

export const BOARD_SIZE = 19;
export const ALPHABETS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;
export const initBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, (_) =>
    Array.from({ length: BOARD_SIZE }, (__) => null),
  );
