import {
  makeClientCommand,
  isValidServerCommand,
  type ServerCommand,
} from '@dongsi-omok/shared';
import { StateStore } from '@src/scripts/states/State';
import { Board } from '@src/scripts/components/Board';
export { Board };
import { Notification } from '@src/scripts/components/Notification';
export { Notification };
import { BorderBeam } from '@src/scripts/components/BorderBeam';
import { init } from '@src/scripts/utils/omok';
import { handleServerCommand } from '@src/scripts/utils/handleServerCommand';
import { AISocket } from '@src/scripts/utils/AISocket';
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
