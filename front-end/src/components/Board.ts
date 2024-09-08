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
      this.dispatchEvent(
        new CustomEvent('board-click', { detail: { row, col } }),
      );
    });
  }
}

customElements.define('omok-board', Board);
