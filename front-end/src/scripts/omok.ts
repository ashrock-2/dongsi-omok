import {
  makeClientCommand,
  ProhibitedGameStateForClientPlaceItem,
} from '@dongsi-omok/shared';
import { find_item_in_board, place_a_item } from '../utils';
import { StateStore } from '../states/State';
import { Board } from '../components/Board';
export { Board };
import { Notification } from '../components/Notification';
export { Notification };
import { BorderBeam } from '../components/BorderBeam';
export { BorderBeam };

export const init = (State: StateStore) => {
  const board = document.querySelector('omok-board') as Board;
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
  const borderBeam = board?.querySelector('border-beam') as BorderBeam;
  borderBeam.setState(State);
  const notification = document.querySelector(
    'game-notification',
  ) as Notification;
  notification?.setState(State);
};
