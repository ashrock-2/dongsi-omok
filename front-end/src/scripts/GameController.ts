import { StateStore } from 'src/scripts/states/State';
import { sendCommand, connectSSE } from 'src/scripts/utils/apiClient';
import { handleServerCommand } from 'src/scripts/utils/handleServerCommand';
import {
  makeClientCommand,
  isValidServerCommand,
  ALPHABETS,
} from '@dongsi-omok/shared';
import type { Board } from './main';

export class GameController {
  private readonly state: StateStore;
  private board: Board;

  constructor(board: Board) {
    this.state = new StateStore();
    this.board = board;
    this.board.addEventListener('click', (event) => {
      const button = event.target as HTMLButtonElement;
      const {
        dataset: { row, col },
      } = button;
      if (!row || !col) {
        return;
      }
      this.handleBoardClick(row, col);
    });
    this.initSSE();
  }

  private async initSSE() {
    const eventSource = connectSSE((data) => {
      if (isValidServerCommand(data)) {
        handleServerCommand(data, this.state);
      }
    });
    return () => {
      eventSource.close();
    };
  }

  public handleBoardClick(row: string, col: string) {
    if (this.state.canPlaceItem()) {
      this.state.setAwaitMove();
      this.board.setItemOnBoard(row, col, 'plan', this.state.player!);
      sendCommand(
        makeClientCommand('PLACE_ITEM', {
          playerId: this.state.playerId!,
          payload: {
            item: this.state.player!,
            row,
            col: col as (typeof ALPHABETS)[number],
          },
        }),
      );
    }
  }

  public getState() {
    return this.state;
  }
}
