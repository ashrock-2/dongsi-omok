import { match } from 'ts-pattern';
import { StateStore } from '@src/scripts/states/State';

export class BorderBeam extends HTMLElement {
  private state: StateStore | null = null;
  constructor() {
    super();
  }
  setState(state: StateStore) {
    this.state = state;
    this.state.addEventListener('stateChange', () => {
      this.className = match(state.gameState)
        .with(
          'AWAIT_MOVE',
          'WAITING_FOR_OPPONENT',
          'GAME_OVER',
          () => 'loading' as const,
        )
        .with('IN_PROGRESS', () => 'active' as const)
        .with('LEAVE_OPPONENT', () => 'loading')
        .exhaustive();
    });
  }
}

customElements.define('border-beam', BorderBeam);
