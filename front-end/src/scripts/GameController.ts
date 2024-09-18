import { StateStore } from 'src/scripts/states/State';
import { sendCommand, connectSSE } from 'src/scripts/utils/apiClient';
import {
  makeClientCommand,
  isValidServerCommand,
  ALPHABETS,
  type ServerCommand,
  type ServerCommandType,
  type Player,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';
import type { Board } from './components/Board';

export class GameController {
  private readonly state: StateStore;
  private board: Board;

  constructor(board: Board) {
    this.state = new StateStore();
    this.board = board;
    this.board.addEventListener('click', this.handleBoardClick.bind(this));
    this.initSSE();
  }

  private async initSSE() {
    const eventSource = connectSSE((data) => {
      if (isValidServerCommand(data)) {
        this.handleServerCommand(data);
      }
    });
    return () => {
      eventSource.close();
    };
  }

  private handleBoardClick(event: Event) {
    const button = event.target as HTMLButtonElement;
    const { row, col } = button.dataset;
    if (!row || !col) return;

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

  private handleServerCommand(command: ServerCommand) {
    match(command)
      .with(
        { id: 'PLACE_ITEM' },
        ({ payload }: ServerCommandType<'PLACE_ITEM'>) => {
          payload.forEach(({ item, row, col }) =>
            this.board.setItemOnBoard(row, col, item, item as Player),
          );
          this.state.gameState = 'IN_PROGRESS';
        },
      )
      .with(
        { id: 'SET_PLAYER_COLOR' },
        (command: ServerCommandType<'SET_PLAYER_COLOR'>) => {
          this.state.player = command.payload.color;
          console.log(`you are ${this.state.player}`);
        },
      )
      .with(
        { id: 'START_GAME' },
        (command: ServerCommandType<'START_GAME'>) => {
          this.state.playerId = command.payload.playerId;
          this.state.gameState = 'IN_PROGRESS';
        },
      )
      .with(
        { id: 'SEND_ROOM_ID' },
        (command: ServerCommandType<'SEND_ROOM_ID'>) => {
          const { roomId } = command.payload;
          this.state.roomId = roomId;
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
                this.state.winner = winner;
                this.state.gameState = 'GAME_OVER';
                this.state.winningCoordinates = winningCoordinates!;
                this.board.highlightWinningCoordinates(winningCoordinates!);
              },
            )
            .with(
              { isFinish: true, winner: null },
              ({ winningCoordinates }) => {
                this.state.gameState = 'GAME_OVER';
                this.state.winningCoordinates = winningCoordinates!;
                this.board.highlightWinningCoordinates(winningCoordinates!);
              },
            )
            .otherwise(() => {
              // do nothing
            });
        },
      )
      .with({ id: 'LEAVE_OPPONENT' }, () => {
        this.state.gameState = 'LEAVE_OPPONENT';
      })
      .exhaustive();
  }

  public getState() {
    return this.state;
  }
}
