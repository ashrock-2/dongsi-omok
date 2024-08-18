import {
  BOARD_SIZE,
  type Board,
  ALPHABETS,
  type BoardItem,
  type Player,
  makeClientCommand,
  isValidServerCommand,
  type ServerCommand,
  type ServerCommandType,
} from '@dongsi-omok/shared';
import { check_is_win, find_item_in_board, place_a_item } from './utils';
import { match } from 'ts-pattern';
const board: Board = Array.from({ length: BOARD_SIZE }, (_) =>
  Array.from({ length: BOARD_SIZE }, (__) => null),
);
let player: Player | null = null;

document.querySelector('.board')?.addEventListener('click', (e) => {
  const button = e.target as HTMLButtonElement;
  const {
    dataset: { row, col },
  } = button;
  if (!row || !col) {
    return;
  }
  if (player === null) {
    return;
  }
  socket.send(
    JSON.stringify(
      makeClientCommand('PLACE_ITEM', {
        player,
        payload: { item: player, row, col },
      }),
    ),
  );
  place_a_item(button, 'plan');
  board[Number(row)][ALPHABETS.findIndex((alphabet) => alphabet === col)] =
    'plan';
});

const handleServerCommand = (command: ServerCommand) => {
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ServerCommandType<'PLACE_ITEM'>) => {
      if (command.payload.length === 1) {
        const {
          payload: [{ item, row, col }],
        } = command;
        place_a_item(find_item_in_board(row, col), item);
        board[Number(row)][
          ALPHABETS.findIndex((alphabet) => alphabet === col)
        ] = item;
      } else {
        const {
          payload: [
            { item: item1, row: row1, col: col1 },
            { item: item2, row: row2, col: col2 },
          ],
        } = command;
        place_a_item(find_item_in_board(row1, col1), item1);
        board[Number(row1)][
          ALPHABETS.findIndex((alphabet) => alphabet === col1)
        ] = item1;

        place_a_item(find_item_in_board(row2, col2), item2);
        board[Number(row2)][
          ALPHABETS.findIndex((alphabet) => alphabet === col2)
        ] = item2;

        if (
          check_is_win(
            board,
            Number(row1),
            ALPHABETS.findIndex((alphabet) => alphabet === col1),
          )
        ) {
          alert(`${item1} win!`);
        }
        if (
          check_is_win(
            board,
            Number(row2),
            ALPHABETS.findIndex((alphabet) => alphabet === col2),
          )
        ) {
          alert(`${item2} win!`);
        }
      }
    })
    .with(
      { id: 'SET_PLAYER_COLOR' },
      (command: ServerCommandType<'SET_PLAYER_COLOR'>) => {
        player = command.payload.color;
        console.log(`you are ${player}`);
      },
    )
    .exhaustive();
};

/** 웹소켓 */
const socket = new WebSocket('ws://localhost:8080');
socket.onopen = (e) => {
  console.log(e);
};
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
