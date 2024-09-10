import {
  makeClientCommand,
  isValidServerCommand,
  type ServerCommand,
} from '@dongsi-omok/shared';
import { StateStore } from '../states/State';
import { Board } from '../components/Board';
export { Board };
import { Notification } from '../components/Notification';
export { Notification };
import { BorderBeam } from '../components/BorderBeam';
import { init } from './omok';
import { handleServerCommand } from './handleServerCommand';
import { AISocket } from './AISocket';
export { BorderBeam };

const State = new StateStore();

const connectSocket = () => {
  State.player = 'black';
  State.gameState = 'IN_PROGRESS';
  State.socket = AISocket;
  State.socket!.onmessage = (event: MessageEvent<ServerCommand>) => {
    const command = event.data;
    try {
      if (isValidServerCommand(command)) {
        handleServerCommand(command, State);
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  };
};

connectSocket();
init(State);
