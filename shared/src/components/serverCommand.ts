import type { BoardItem } from './common';

export const ServerCommands = {
  PLACE: 'PLACE',
} as const;
export type KeyOfServerCommands = keyof typeof ServerCommands;
export type ServerCommandType<COMMAND extends keyof typeof ServerCommands> = {
  id: COMMAND;
  payload: ServerCommandPayloadRegistry[COMMAND];
};
export type ServerCommand = ServerCommandType<KeyOfServerCommands>;

type ServerCommandPayloadMapType = {
  [ServerCommands.PLACE]: {
    item: BoardItem;
    row: string;
    col: string;
  };
};

export type ServerCommandPayloadRegistry = {
  [K in (typeof ServerCommands)[keyof typeof ServerCommands]]: ServerCommandPayloadMapType[K];
};

export const isValidServerCommand = (
  command: unknown,
): command is ServerCommand => {
  if (typeof command !== 'object' || command === null) return false;
  if (!('id' in command) || !('payload' in command)) return false;

  const id = command.id as KeyOfServerCommands;
  if (!(id in ServerCommands)) return false;

  const payload = command.payload as ServerCommandPayloadRegistry[typeof id];
  return payload !== undefined;
};
