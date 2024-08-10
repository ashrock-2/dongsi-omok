export type BOARD_TYPE = Array<Array<null | "black" | "white" | "prohibit">>;

type ACTION_ID = "PLACE";
export type ACTION_TYPE = {
  id: ACTION_ID;
  item: null | "black" | "white" | "prohibit";
  row: string;
  col: string;
};
export const BOARD_SIZE = 19;
export const ALPHABETS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;
