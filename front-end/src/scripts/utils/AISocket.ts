import { initBoard, isValidClientCommand } from '@dongsi-omok/shared';
import { handleClientCommand } from '@src/scripts/utils/handleClientCommand';

const board = initBoard();

export const AISocket = {
  send(data) {
    try {
      const parsedMessage = JSON.parse(data.toString());
      if (isValidClientCommand(parsedMessage)) {
        if (this.onmessage) {
          this.onmessage({
            data: handleClientCommand(parsedMessage, board),
          } as MessageEvent);
        }
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  },
} as WebSocket;
