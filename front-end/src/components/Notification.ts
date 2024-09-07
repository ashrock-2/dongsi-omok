import { match, P } from 'ts-pattern';
import { State } from '../State';
import type { GameState } from '@dongsi-omok/shared';
import { applyParticleEffect } from './ParticleEffect';
import { computePosition } from '@floating-ui/dom';
import { copyable } from '../icons/svg';

const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${new URL('./Notification.css', import.meta.url)}"></link>
  <div class="snackbar"></div>
  <div class="container">
    <p class="main_text"></p>
    <p class="sub_text">
      <strong></strong>
      ${copyable}
    </p>
  </div>
`;

export class Notification extends HTMLElement {
  private timeout: NodeJS.Timeout | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(template.content.cloneNode(true));
    this.updateContent();
    State.addEventListener('stateChange', () => {
      this.updateContent();
    });
    const wrapper = this.shadowRoot?.querySelector(
      '.container',
    ) as HTMLDivElement;
    const strong = this.shadowRoot?.querySelector('strong')!;
    applyParticleEffect(wrapper);
    wrapper.addEventListener('click', () => {
      match(State).with(
        {
          gameState: 'WAITING_FOR_OPPONENT',
          roomId: P.when((roomId) => roomId !== null),
        },
        () => {
          copyText(strong).then(() => this.showCopyComplete());
        },
      );
    });
  }
  private updateContent() {
    const wrapper = this.shadowRoot?.querySelector(
      '.container',
    ) as HTMLDivElement;
    const mainText = this.shadowRoot?.querySelector(
      '.main_text',
    ) as HTMLParagraphElement;
    const strong = this.shadowRoot?.querySelector('strong')!;
    const subText = this.shadowRoot?.querySelector(
      '.sub_text',
    ) as HTMLParagraphElement;
    wrapper.style.display = getVisibility(State.gameState);
    subText.style.display = getSubTextVisibility(State);
    mainText.innerText = getMainText(State);
    strong.innerText = getStrongText(State);
  }
  private showCopyComplete() {
    const wrapper = this.shadowRoot?.querySelector('.container') as HTMLElement;
    const snackbar = this.shadowRoot?.querySelector(
      '.snackbar',
    ) as HTMLDivElement;
    const updatePosition = () => {
      computePosition(wrapper, snackbar, { placement: 'top' }).then(
        ({ x, y }) => {
          Object.assign(snackbar.style, {
            left: `${x}px`,
            top: `${y - 4}px`,
          });
        },
      );
    };
    updatePosition();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    this.resizeObserver.observe(document.body);

    snackbar.innerText = '복사 완료!';
    snackbar.style.display = 'block';
    this.timeout = setTimeout(() => {
      snackbar.innerText = '';
      snackbar.style.display = 'none';
    }, 3000);
  }
}

const copyText = (dom: HTMLElement) =>
  new Promise<void>((resolve) =>
    navigator.clipboard.writeText(dom.innerText).then(() => resolve()),
  );

const getMainText = (state: typeof State) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      () => '다음 주소를 상대방에게 공유해주세요.',
    )
    .with({ gameState: 'GAME_OVER' }, (state) => {
      return match({ winner: state.winner, player: state.player })
        .with(
          { winner: 'black', player: 'black' },
          { winner: 'white', player: 'white' },
          () => '당신이 이겼습니다!',
        )
        .with(
          { winner: 'black', player: 'white' },
          { winner: 'white', player: 'black' },
          () => '당신이 졌습니다!',
        )
        .otherwise(() => '비겼습니다!');
    })
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId === null),
      },
      () => `방을 생성 중입니다...`,
    )
    .with({ gameState: 'LEAVE_OPPONENT' }, () => '상대방이 나갔습니다.')
    .otherwise(() => '');

const getStrongText = (state: typeof State) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      ({ roomId }) => `https://dongsi-omok.vercel.app/pvp?roomId=${roomId}`,
    )
    .otherwise(() => '');

const getVisibility = (state: GameState) =>
  match(state)
    .with('WAITING_FOR_OPPONENT', () => 'block' as const)
    .with('GAME_OVER', 'LEAVE_OPPONENT', () => 'block' as const)
    .otherwise(() => 'none' as const);

const getSubTextVisibility = (state: typeof State) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      () => 'block' as const,
    )
    .otherwise(() => 'none' as const);

customElements.define('game-notification', Notification);
