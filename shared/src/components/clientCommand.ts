import type { BoardItem, Player } from './common';

export const ClientCommands = {
  PLACE: 'PLACE',
} as const;
export type KeyOfClientCommands = keyof typeof ClientCommands;
export type ClientCommandType<COMMAND extends keyof typeof ClientCommands> = {
  id: COMMAND;
  player: Player;
  playerId?: string;
  payload: ClientCommandPayloadRegistry[COMMAND];
};
export type ClientCommand = ClientCommandType<KeyOfClientCommands>;

type ClientCommandPayloadMapType = {
  [ClientCommands.PLACE]: {
    item: BoardItem;
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
