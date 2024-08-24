import {
  type Player,
  makeClientCommand,
  isValidServerCommand,
  type ServerCommand,
  type ServerCommandType,
  type GameState,
  ProhibitedGameStateForClientPlaceItem,
} from '@dongsi-omok/shared';
import { find_item_in_board, place_a_item } from './utils';
import { match } from 'ts-pattern';
/** 웹소켓 */
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'ws://localhost:8080';
console.log(backendUrl);
const socket = new WebSocket(`${backendUrl}/ws`);

let player: Player | null = null;
let gameState: GameState = 'WAITING_FOR_OPPONENT';

document.querySelector('.board')?.addEventListener('click', (e) => {
  const button = e.target as HTMLButtonElement;
  const {
    dataset: { row, col },
  } = button;
  if (!row || !col) {
    return;
  }
  if (ProhibitedGameStateForClientPlaceItem.includes(gameState)) {
    console.log(gameState);
    console.log('wait for opponent');
    return;
  }
  if (player === null) {
    return;
  }
  socket.send(
    JSON.stringify(
      makeClientCommand('PLACE_ITEM', {
        payload: { item: player, row, col },
      }),
    ),
  );
  place_a_item(button, 'plan');
  gameState = 'AWAIT_MOVE';
});

const handleServerCommand = (command: ServerCommand) => {
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ServerCommandType<'PLACE_ITEM'>) => {
      if (command.payload.length === 1) {
        const {
          payload: [{ item, row, col }],
        } = command;
        place_a_item(find_item_in_board(row, col), item);
      } else {
        const {
          payload: [
            { item: item1, row: row1, col: col1 },
            { item: item2, row: row2, col: col2 },
          ],
        } = command;
        place_a_item(find_item_in_board(row1, col1), item1);
        place_a_item(find_item_in_board(row2, col2), item2);
      }
      gameState = 'IN_PROGRESS';
    })
    .with(
      { id: 'SET_PLAYER_COLOR' },
      (command: ServerCommandType<'SET_PLAYER_COLOR'>) => {
        player = command.payload.color;
        console.log(`you are ${player}`);
      },
    )
    .with({ id: 'START_GAME' }, () => {
      gameState = 'IN_PROGRESS';
    })
    .with(
      { id: 'SEND_ROOM_ID' },
      (command: ServerCommandType<'SEND_ROOM_ID'>) => {
        const { roomId } = command.payload;
        console.log(roomId);
        // TODO: roomId가 결합된 URL을 공유 URL로써 화면에 표기
      },
    )
    .with(
      { id: 'NOTIFY_WINNER' },
      (command: ServerCommandType<'NOTIFY_WINNER'>) => {
        match(command.payload)
          .with(
            { isFinish: true, winner: 'black' },
            { isFinish: true, winner: 'white' },
            ({ winner }) => {
              alert(`${winner} is winner`);
            },
          )
          .with({ isFinish: true, winner: null }, () => {
            alert('draw!');
          })
          .otherwise(() => {
            // do nothing
          });
      },
    )
    .exhaustive();
};

socket.onopen = (e) => {
  console.log(e);
  const searchParams = new URLSearchParams(window.location.search);
  const roomId = searchParams.get('roomId');
  if (!roomId) {
    // room 생성 ClientCommand
    socket.send(
      JSON.stringify(
        makeClientCommand('CREATE_ROOM', {
          payload: {},
        }),
      ),
    );
  } else {
    // room 참가 ClientCommand
    socket.send(
      JSON.stringify(
        makeClientCommand('JOIN_ROOM', {
          payload: { roomId },
        }),
      ),
    );
  }
  socket.onmessage = (event) => {
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
