type ITEM_TYPE = null | "black" | "white" | "prohibit";

export const ACTION_TYPES = {
  PLACE: 'PLACE',
} as const;
export type KeyOfActionTypes = keyof typeof ACTION_TYPES;
export type AnyActionType = ACTION_TYPE<KeyOfActionTypes>;

type ActionPayloadMapType = {
  [ACTION_TYPES.PLACE]: {
    item: ITEM_TYPE;
    row: string;
    col: string;
  }
}

export type ActionPayloadRegistry = {
  [K in typeof ACTION_TYPES[keyof typeof ACTION_TYPES]]: ActionPayloadMapType[K];
}

export type BOARD_TYPE = Array<Array<ITEM_TYPE>>;
export type ACTION_TYPE<ACTION extends keyof typeof ACTION_TYPES> = {
  id: ACTION;
  payload: ActionPayloadRegistry[ACTION]
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
