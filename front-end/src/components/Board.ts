import {
  makeClientCommand,
  ProhibitedGameStateForClientPlaceItem,
} from '@dongsi-omok/shared';
import { State } from '../State';
import { place_a_item } from '../utils';

export class Board extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (e) => {
      const button = e.target as HTMLButtonElement;
      const {
        dataset: { row, col },
      } = button;
      if (!row || !col) {
        return;
      }
      if (ProhibitedGameStateForClientPlaceItem.includes(State.gameState)) {
        return;
      }
      if (State.player === null) {
        return;
      }
      State.socket?.send(
        JSON.stringify(
          makeClientCommand('PLACE_ITEM', {
            payload: { item: State.player, row, col },
          }),
        ),
      );
      place_a_item(button, 'plan', State.player);
      State.gameState = 'AWAIT_MOVE';
    });
  }
}

customElements.define('omok-board', Board);
