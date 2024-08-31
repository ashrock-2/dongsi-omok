import { match, P } from 'ts-pattern';
import { State } from '../State';
import type { GameState } from '@dongsi-omok/shared';
import { applyParticleEffect } from './ParticleEffect';

const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${new URL('./Notification.css', import.meta.url)}"></link>
  <div class="snackbar"></div>
  <p>
    <span></span>
    <br/>
    <strong></strong>
  </p>
`;

export class Notification extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(template.content.cloneNode(true));
    const wrapper = this.shadowRoot?.querySelector('p') as HTMLParagraphElement;
    const span = this.shadowRoot?.querySelector('span') as HTMLSpanElement;
    const strong = this.shadowRoot?.querySelector('strong')!;
    wrapper.style.display = getVisibility(State.gameState);
    span.innerText = getSpanText(State);
    strong.innerText = getStrongText(State);
    State.addEventListener('stateChange', () => {
      wrapper.style.display = getVisibility(State.gameState);
      span.innerText = getSpanText(State);
      strong.innerText = getStrongText(State);
    });
    applyParticleEffect(wrapper);
    wrapper.addEventListener('click', () => {
      copyText(strong).then(() => this.showCopyComplete());
    });
  }
  private showCopyComplete() {
    const snackbar = this.shadowRoot?.querySelector(
      '.snackbar',
    ) as HTMLDivElement;
    snackbar.innerText = '주소 복사 완료!';
    snackbar.style.display = 'block';
    setTimeout(() => {
      snackbar.innerText = '';
      snackbar.style.display = 'none';
    }, 3000);
  }
}

const copyText = (dom: HTMLElement) =>
  new Promise<void>((resolve) =>
    navigator.clipboard.writeText(dom.innerText).then(() => resolve()),
  );

const getSpanText = (state: typeof State) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      () => '다음 주소를 상대방에게 공유해주세요.',
    )
    .with({ gameState: 'GAME_OVER' }, () => `다시 시작?`)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId === null),
      },
      () => `방을 생성 중입니다...`,
    )
    .otherwise(() => '');

const getStrongText = (state: typeof State) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      ({ roomId }) => `https://dongsi-omok.vercel.app?roomId=${roomId}`,
    )
    .otherwise(() => '');

const getVisibility = (state: GameState) =>
  match(state)
    .with('WAITING_FOR_OPPONENT', () => 'block' as const)
    .with('GAME_OVER', () => 'block' as const)
    .otherwise(() => 'none' as const);

customElements.define('game-notification', Notification);
