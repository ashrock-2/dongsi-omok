import { match, P } from 'ts-pattern';
import { StateStore } from '@src/scripts/states/State';
import type { GameState } from '@dongsi-omok/shared';
import { applyParticleEffect } from '@src/scripts/components/ParticleEffect';
import { computePosition } from '@floating-ui/dom';
import { copyable } from '@src/scripts/icons/svg';
import { REMATCH_REQUEST, REMATCH_RESPONSE } from '../events/GameEvents';

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
  private state: StateStore | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  public setState(state: StateStore) {
    this.state = state;
    this.state.addEventListener('stateChange', () => {
      this.updateContent();
    });
    this.updateContent();

    const wrapper = this.shadowRoot?.querySelector(
      '.container',
    ) as HTMLDivElement;
    const strong = this.shadowRoot?.querySelector('strong')!;
    // applyParticleEffect(wrapper);
    wrapper.addEventListener('click', () => {
      match(this.state).with(
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
    wrapper.style.display = getVisibility(this.state!.gameState);
    subText.style.display = getSubTextVisibility(this.state!);
    mainText.innerText = getMainText(this.state!);
    strong.innerText = getStrongText(this.state!);

    // 기존 버튼들 제거
    wrapper.querySelectorAll('button').forEach((button) => button.remove());

    // 새로운 버튼 추가
    const buttons = getButtons(this.state!);
    if (buttons) {
      wrapper.insertAdjacentHTML('beforeend', buttons);
      this.addButtonListeners(wrapper);
    }
  }

  private addButtonListeners(wrapper: HTMLElement) {
    const acceptButton = wrapper.querySelector('#accept-rematch');
    const rejectButton = wrapper.querySelector('#reject-rematch');
    const requestButton = wrapper.querySelector('#request-rematch');

    acceptButton?.addEventListener('click', () =>
      this.dispatchRematchResponse(true),
    );
    rejectButton?.addEventListener('click', () =>
      this.dispatchRematchResponse(false),
    );
    requestButton?.addEventListener('click', () =>
      this.dispatchRematchRequest(),
    );
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

  private dispatchRematchRequest() {
    const event = new CustomEvent(REMATCH_REQUEST);
    document.dispatchEvent(event);
  }

  private dispatchRematchResponse(accept: boolean) {
    const event = new CustomEvent(REMATCH_RESPONSE, { detail: accept });
    document.dispatchEvent(event);
  }
}

const copyText = (dom: HTMLElement) =>
  new Promise<void>((resolve) =>
    navigator.clipboard.writeText(dom.innerText).then(() => resolve()),
  );

const getMainText = (state: StateStore) =>
  match(state)
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId !== null),
      },
      () => '다음 주소를 상대방에게 공유해주세요.',
    )
    .with({ gameState: 'GAME_OVER' }, (state) => {
      const baseText = match({ winner: state.winner, player: state.player })
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

      return match(state)
        .with(
          { rematchRequesterId: P.when((id) => id === state.playerId) },
          () =>
            `${baseText} 재경기 요청을 보냈습니다. 상대방의 응답을 기다리는 중...`,
        )
        .with(
          {
            rematchRequesterId: P.when(
              (id) => id !== null && id !== state.playerId,
            ),
          },
          () => `${baseText} 상대방이 재경기를 요청했습니다. 수락하시겠습니까?`,
        )
        .otherwise(() => `${baseText} 재경기를 요청하시겠습니까?`);
    })
    .with(
      {
        gameState: 'WAITING_FOR_OPPONENT',
        roomId: P.when((roomId) => roomId === null),
      },
      () => `상대방을 기다리고 있습니다...`,
    )
    .with({ gameState: 'LEAVE_OPPONENT' }, () => '상대방이 나갔습니다.')
    .otherwise(() => '');

const getButtons = (state: StateStore) =>
  match(state)
    .with(
      {
        gameState: 'GAME_OVER',
        rematchRequesterId: P.when(
          (id) => id !== null && id !== state.playerId,
        ),
      },
      () => `
        <button id="accept-rematch">수락</button>
        <button id="reject-rematch">거절</button>
      `,
    )
    .with(
      {
        gameState: 'GAME_OVER',
        rematchRequesterId: null,
      },
      () => `<button id="request-rematch">재경기 요청</button>`,
    )
    .otherwise(() => null);

const getStrongText = (state: StateStore) =>
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

const getSubTextVisibility = (state: StateStore) =>
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
