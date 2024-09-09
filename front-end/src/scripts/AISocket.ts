import { isValidClientCommand, type ClientCommand } from '@dongsi-omok/shared';

export const AISocket = {
  send(data) {
    try {
      const parsedMessage = JSON.parse(data.toString());
      if (isValidClientCommand(parsedMessage)) {
        if (this.onmessage) {
          this.onmessage({
            data: handleClientCommand(parsedMessage),
          } as MessageEvent);
        }
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  },
} as WebSocket;

const handleClientCommand = (command: ClientCommand) => {
  return '{}';
};
