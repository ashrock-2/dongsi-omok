import type { GameState, Player } from '@dongsi-omok/shared';

class StateStore extends EventTarget {
  private static _instance: StateStore;
  private _player: Player | null = null;
  private _gameState: GameState = 'WAITING_FOR_OPPONENT';
  private _roomId: string | null = null;

  constructor() {
    super();
  }

  static get instance(): StateStore {
    if (!StateStore._instance) {
      StateStore._instance = new StateStore();
    }
    return StateStore._instance;
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
}

export const State = StateStore.instance;
