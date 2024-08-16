import type { ITEM_TYPE } from "./common";

export const ClientCommands = {
  PLACE: 'PLACE',
} as const;
export type KeyOfClientCommands = keyof typeof ClientCommands;
export type ClientCommandType<COMMAND extends keyof typeof ClientCommands> = {
  id: COMMAND;
  payload: ClientCommandPayloadRegistry[COMMAND]
};
export type ClientCommand = ClientCommandType<KeyOfClientCommands>;

type ClientCommandPayloadMapType = {
  [ClientCommands.PLACE]: {
    item: ITEM_TYPE;
    row: string;
    col: string;
  }
}

export type ClientCommandPayloadRegistry = {
  [K in typeof ClientCommands[keyof typeof ClientCommands]]: ClientCommandPayloadMapType[K];
}
