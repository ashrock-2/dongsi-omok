import {
  type ServerCommand,
  type ServerCommandType,
  type Player,
} from '@dongsi-omok/shared';
import { find_item_in_board, place_a_item } from '../utils';
import { match } from 'ts-pattern';
import { State } from '../states/State';
export { Notification } from '../components/Notification';
export { Board } from '../components/Board';
export { BorderBeam } from '../components/BorderBeam';

const connectSocket = () => {
  State.socket = {} as WebSocket;
};

const handleServerCommand = (command: ServerCommand) => {
  match(command)
    .with(
      { id: 'PLACE_ITEM' },
      ({ payload }: ServerCommandType<'PLACE_ITEM'>) => {
        /** TODO: 3번째 인자 수정 */
        payload.forEach(({ item, row, col }) =>
          place_a_item(find_item_in_board(row, col), item, item as Player),
        );
        State.gameState = 'IN_PROGRESS';
      },
    )
    .with(
      { id: 'SET_PLAYER_COLOR' },
      (command: ServerCommandType<'SET_PLAYER_COLOR'>) => {
        State.player = command.payload.color;
        console.log(`you are ${State.player}`);
      },
    )
    .with({ id: 'START_GAME' }, () => {
      State.gameState = 'IN_PROGRESS';
    })
    .with(
      { id: 'SEND_ROOM_ID' },
      (command: ServerCommandType<'SEND_ROOM_ID'>) => {
        const { roomId } = command.payload;
        State.roomId = roomId;
      },
    )
    .with(
      { id: 'NOTIFY_WINNER' },
      (command: ServerCommandType<'NOTIFY_WINNER'>) => {
        match(command.payload)
          .with(
            { isFinish: true, winner: 'black' },
            { isFinish: true, winner: 'white' },
            ({ winner, winningCoordinates }) => {
              State.winner = winner;
              State.gameState = 'GAME_OVER';
              State.winningCoordinates = winningCoordinates!;
            },
          )
          .with({ isFinish: true, winner: null }, ({ winningCoordinates }) => {
            State.gameState = 'GAME_OVER';
            State.winningCoordinates = winningCoordinates!;
          })
          .otherwise(() => {
            // do nothing
          });
      },
    )
    .with({ id: 'LEAVE_OPPONENT' }, () => {
      State.gameState = 'LEAVE_OPPONENT';
    })
    .exhaustive();
};

connectSocket();
