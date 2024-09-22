import { ALPHABETS, type BoardItem, type Player } from '@dongsi-omok/shared';

export class Board extends HTMLElement {
  constructor() {
    super();
  }

  public setItemOnBoard(
    row: string,
    col: string,
    item: BoardItem,
    player: Player,
  ) {
    const button = this.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (button) {
      button.className = `item ${item} ${player}`;
      button.setAttribute('disabled', 'true');
    }
  }

  public highlightWinningCoordinates(
    coordinates: Array<{ row: number; col: number }>,
  ) {
    coordinates.forEach(({ row, col }) => {
      const button = this.querySelector(
        `[data-row="${row}"][data-col="${ALPHABETS[col]}"]`,
      );
      if (button) {
        button.classList.add('winning');
      }
    });
  }

  public resetBoard() {
    this.querySelectorAll('button').forEach((button) => {
      button.className = '';
      button.removeAttribute('disabled');
    });
  }
}

customElements.define('omok-board', Board);
