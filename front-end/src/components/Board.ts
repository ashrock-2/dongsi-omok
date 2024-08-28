import {
  makeClientCommand,
  ProhibitedGameStateForClientPlaceItem,
} from '@dongsi-omok/shared';
import { State } from '../State';
import { place_a_item } from '../utils';

export class Board extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        width: 100%;
        max-width: 600px;
        aspect-ratio: 1;
        display: grid;
        grid-template-columns: repeat(var(--boardSize), 1fr);
        grid-template-rows: repeat(var(--boardSize), 1fr);
        background-color: burlywood;
        border-radius: 8px;
      }
    `;
    this.shadowRoot?.append(style);

    this.addEventListener('click', (e) => {
      const button = e.target as HTMLButtonElement;
      const {
        dataset: { row, col },
      } = button;
      if (!row || !col) {
        return;
      }
      if (ProhibitedGameStateForClientPlaceItem.includes(State.gameState)) {
        console.log('wait for opponent');
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
      place_a_item(button, 'plan');
      State.gameState = 'AWAIT_MOVE';
    });
  }
}

customElements.define('omok-board', Board);
