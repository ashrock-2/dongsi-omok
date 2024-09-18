import type { GameState, Player } from '@dongsi-omok/shared';

export class StateStore extends EventTarget {
  private _player: Player | null = null;
  private _gameState: GameState = 'WAITING_FOR_OPPONENT';
  private _roomId: string | null = null;
  private _playerId: string | null = null;
  private _winner: Player | null = null;
  private _winningCoordinates: Array<{ row: number; col: number }> = [];
  private _socket: WebSocket | null = null;

  constructor() {
    super();
  }

  get player() {
    return this._player;
  }

  set player(val: Player | null) {
    this._player = val;
    this.dispatchEvent(new Event('stateChange'));
  }

  get gameState() {
    return this._gameState;
  }

  set gameState(val: GameState) {
    this._gameState = val;
    this.dispatchEvent(new Event('stateChange'));
  }

  get roomId() {
    return this._roomId;
  }

  set roomId(val: string | null) {
    this._roomId = val;
    this.dispatchEvent(new Event('stateChange'));
  }

  get playerId() {
    return this._playerId;
  }

  set playerId(val: string | null) {
    this._playerId = val;
  }

  get winningCoordinates() {
    return this._winningCoordinates;
  }

  set winningCoordinates(val: Array<{ row: number; col: number }>) {
    this._winningCoordinates = val;
    this.dispatchEvent(new Event('stateChange'));
  }

  get socket() {
    return this._socket;
  }

  set socket(val: WebSocket | null) {
    this._socket = val;
  }

  get winner() {
    return this._winner;
  }
  set winner(val: Player | null) {
    this._winner = val;
  }
}
