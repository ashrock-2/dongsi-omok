import { match, P } from 'ts-pattern';
import { State } from '../State';
import type { GameState } from '@dongsi-omok/shared';
import { applyParticleEffect } from './ParticleEffect';

export class Notification extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('p');
    const style = document.createElement('style');
    style.textContent = `
      p {
        text-align: center;
        background-color: hsla(0, 0%, 0%, 25%);
        padding: 8px 6px;
        border-radius: 6px;
        z-index: 1;
        color: hsl(0, 47%, 94%);
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        &:hover {
          background-color: hsla(0, 0%, 0%, 42%);
        }
      }
      strong {
        font-size: 1.25rem;
      }
      `;
    applyParticleEffect(wrapper);
    this.shadowRoot?.append(style, wrapper);
    updateTextAndVisibility(wrapper);
    State.addEventListener('stateChange', () =>
      updateTextAndVisibility(wrapper),
    );
    wrapper.addEventListener('click', () => {
      const textToCopy = wrapper.querySelector('strong');
      if (textToCopy) {
        copyText(textToCopy).then(() => this.showCopyComplete());
      }
    });
  }
  private showCopyComplete() {
    // TODO
  }
}

const updateTextAndVisibility = (dom: HTMLElement) => {
  dom.innerHTML = getText(State);
  dom.style.display = getVisibility(State.gameState);
};

const copyText = (dom: HTMLElement) =>
  new Promise<void>((resolve) =>
    navigator.clipboard.writeText(dom.innerText).then(() => resolve()),
  );

const getText = (state: typeof State) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      ({ roomId }) => `다음 주소를 상대방에게 공유해주세요.<br/>
      <strong>https://dongsi-omok.vercel.app?roomId=${roomId}</strong>`,
    )
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId === null),
      },
      () => `방을 생성 중입니다...`,
    )
    .otherwise(() => '');

const getVisibility = (state: GameState) =>
  match(state)
    .with('WAITING_FOR_OPPONENT', () => 'block' as const)
    .otherwise(() => 'none' as const);

customElements.define('game-notification', Notification);
