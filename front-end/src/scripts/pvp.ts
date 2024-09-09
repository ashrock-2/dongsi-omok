import {
  makeClientCommand,
  isValidServerCommand,
  type ServerCommand,
  type ServerCommandType,
  type Player,
  ProhibitedGameStateForClientPlaceItem,
} from '@dongsi-omok/shared';
import { find_item_in_board, place_a_item } from '../utils';
import { match } from 'ts-pattern';
import { StateStore } from '../states/State';
import { Board } from '../components/Board';
export { Board };
import { Notification } from '../components/Notification';
export { Notification };
import { BorderBeam } from '../components/BorderBeam';
import { init } from './omok';
import { handleServerCommand } from './handleServerCommand';
export { BorderBeam };

const State = new StateStore();
const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'ws://localhost:8080';
let reconnectAttempts = 0;

const connectSocket = () => {
  State.socket = new WebSocket(backendUrl);
  State.socket.onopen = (e) => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId');
    if (!roomId) {
      State.socket?.send(
        JSON.stringify(
          makeClientCommand('CREATE_ROOM', {
            payload: {},
          }),
        ),
      );
    } else {
      State.socket?.send(
        JSON.stringify(
          makeClientCommand('JOIN_ROOM', {
            payload: { roomId },
          }),
        ),
      );
    }
    State.socket!.onclose = (event) => {
      if (!event.wasClean && reconnectAttempts < 3) {
        setTimeout(() => {
          connectSocket();
          reconnectAttempts++;
        }, Math.random() * 1000);
      }
    };
    State.socket!.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data.toString());
        console.log(parsedMessage);
        if (isValidServerCommand(parsedMessage)) {
          handleServerCommand(parsedMessage, State);
        }
      } catch (err) {
        console.error('Failed to parse message', err);
      }
    };
  };
};

connectSocket();
init(State);
