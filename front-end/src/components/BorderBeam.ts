import { match } from 'ts-pattern';
import { State } from '../State';

export class BorderBeam extends HTMLElement {
  constructor() {
    super();
    State.addEventListener('stateChange', () => {
      this.className = match(State.gameState)
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
