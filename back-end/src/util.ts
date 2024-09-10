import { type Board, type PlaceCommandQueue } from '@dongsi-omok/shared';
import { match } from 'ts-pattern';
import type WebSocket from 'ws';

export type Rooms = Map<
  string,
  { clients: Array<WebSocket>; queue: PlaceCommandQueue; board: Board }
>;

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
