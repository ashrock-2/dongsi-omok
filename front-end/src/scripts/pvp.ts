import {
  makeClientCommand,
  isValidServerCommand,
  type ServerCommand,
  type ServerCommandType,
  type Player,
  ProhibitedGameStateForClientPlaceItem,
} from '@dongsi-omok/shared';
import { find_item_in_board, place_a_item } from '../utils';
import { match } from 'ts-pattern';
import { State } from '../states/State';
export { Notification } from '../components/Notification';
export { Board } from '../components/Board';
export { BorderBeam } from '../components/BorderBeam';

const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'ws://localhost:8080';
let reconnectAttempts = 0;
const board = document.querySelector('omok-board');
board?.addEventListener('board-click', (event) => {
  const customEvent = event as CustomEvent<{ row: string; col: string }>;
  if (ProhibitedGameStateForClientPlaceItem.includes(State.gameState)) {
    return;
  }
  if (State.player === null) {
    return;
  }
  const { row, col } = customEvent.detail;
  State.socket?.send(
    JSON.stringify(
      makeClientCommand('PLACE_ITEM', {
        payload: { item: State.player, row, col },
      }),
    ),
  );
  place_a_item(find_item_in_board(row, col), 'plan', State.player);
  State.gameState = 'AWAIT_MOVE';
});

const connectSocket = () => {
  State.socket = new WebSocket(backendUrl);
  State.socket.onopen = (e) => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId');
    if (!roomId) {
      State.socket?.send(
        JSON.stringify(
          makeClientCommand('CREATE_ROOM', {
            payload: {},
          }),
        ),
      );
    } else {
      State.socket?.send(
        JSON.stringify(
          makeClientCommand('JOIN_ROOM', {
            payload: { roomId },
          }),
        ),
      );
    }
    State.socket!.onclose = (event) => {
      if (!event.wasClean && reconnectAttempts < 3) {
        setTimeout(() => {
          connectSocket();
          reconnectAttempts++;
        }, Math.random() * 1000);
      }
    };
    State.socket!.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data.toString());
        console.log(parsedMessage);
        if (isValidServerCommand(parsedMessage)) {
          handleServerCommand(parsedMessage);
        }
      } catch (err) {
        console.error('Failed to parse message', err);
      }
    };
  };
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
