import { makeClientCommand, isValidServerCommand } from '@dongsi-omok/shared';
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
    State.socket?.send(
      JSON.stringify(makeClientCommand('JOIN_QUEUE', { payload: {} })),
    );
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
