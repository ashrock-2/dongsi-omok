import type { BoardItem, GameState, Player } from './common';

export const ClientCommands = {
  PLACE_ITEM: 'PLACE_ITEM',
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM: 'JOIN_ROOM',
  JOIN_QUEUE: 'JOIN_QUEUE',
} as const;
export type KeyOfClientCommands = keyof typeof ClientCommands;
export type ClientCommandType<COMMAND extends keyof typeof ClientCommands> = {
  id: COMMAND;
  playerId?: string;
  payload: ClientCommandPayloadRegistry[COMMAND];
};
export type ClientCommand = ClientCommandType<KeyOfClientCommands>;

type ClientCommandPayloadMapType = {
  [ClientCommands.PLACE_ITEM]: {
    item: BoardItem;
    row: string;
    col: string;
  };
  [ClientCommands.CREATE_ROOM]: {};
  [ClientCommands.JOIN_ROOM]: {
    roomId: string;
  };
  [ClientCommands.JOIN_QUEUE]: {};
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

export const makeClientCommand = <T extends KeyOfClientCommands>(
  id: T,
  {
    playerId,
    payload,
  }: {
    playerId?: ClientCommand['playerId'];
    payload: ClientCommandPayloadRegistry[T];
  },
) => {
  const command: ClientCommandType<T> = {
    id,
    playerId,
    payload,
  };
  return command;
};

export const ProhibitedGameStateForClientPlaceItem: Array<GameState> = [
  'WAITING_FOR_OPPONENT',
  'AWAIT_MOVE',
  'GAME_OVER',
  'LEAVE_OPPONENT',
] as const;

export type PlaceCommandQueue = Array<ClientCommandType<'PLACE_ITEM'>>;
