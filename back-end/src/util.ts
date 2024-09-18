import { type Board, type PlaceCommandQueue } from '@dongsi-omok/shared';
import type { Response } from 'express';
import { match } from 'ts-pattern';

export type Rooms = Map<
  string,
  {
    clients: Array<{ clientId: string; sseResponse: Response }>;
    queue: PlaceCommandQueue;
    board: Board;
  }
>;

/** Map<clientId, roomId> */
export type ClientMap = Map<string, string>;
/** Array<clientId> */
export type GameQueue = Array<string>;

export const getCommandQueueState = (queue: PlaceCommandQueue) =>
  match(queue)
    .returnType<'EMPTY' | 'BLACK' | 'WHITE' | 'FULL'>()
    .when(
      (queue) => queue.length === 0,
      () => 'EMPTY',
    )
    .when(
      (queue) => queue.length === 1 && queue[0].payload.item === 'white',
      () => 'WHITE',
    )
    .when(
      (queue) => queue.length === 1 && queue[0].payload.item === 'black',
      () => 'BLACK',
    )
    .when(
      (queue) => queue.length === 2,
      () => 'FULL',
    )
    .otherwise(() => 'FULL');

export const generateRoomId = () => Math.random().toString(36).substring(2, 9);
