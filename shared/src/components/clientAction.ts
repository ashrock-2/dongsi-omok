import type { ITEM_TYPE } from './common';

export const ClientCommands = {
  PLACE: 'PLACE',
} as const;
export type KeyOfClientCommands = keyof typeof ClientCommands;
export type ClientCommandType<COMMAND extends keyof typeof ClientCommands> = {
  id: COMMAND;
  player: 'black' | 'white';
  playerId?: string;
  payload: ClientCommandPayloadRegistry[COMMAND];
};
export type ClientCommand = ClientCommandType<KeyOfClientCommands>;

type ClientCommandPayloadMapType = {
  [ClientCommands.PLACE]: {
    item: ITEM_TYPE;
    row: string;
    col: string;
  };
};

export type ClientCommandPayloadRegistry = {
  [K in (typeof ClientCommands)[keyof typeof ClientCommands]]: ClientCommandPayloadMapType[K];
};

export const isValidClientCommand = (
  command: unknown,
): command is ClientCommand => {
  if (typeof command !== 'object' || command === null) return false;
  if (!('id' in command) || !('payload' in command)) return false;

  const id = command.id as KeyOfClientCommands;
  if (!(id in ClientCommands)) return false;

  const payload = command.payload as ClientCommandPayloadRegistry[typeof id];
  return payload !== undefined;
};
