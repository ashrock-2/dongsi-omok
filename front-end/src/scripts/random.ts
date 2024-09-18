import { makeClientCommand, isValidServerCommand } from '@dongsi-omok/shared';
import { StateStore } from '@src/scripts/states/State';
import { Board } from '@src/scripts/components/Board';
export { Board };
import { Notification } from '@src/scripts/components/Notification';
export { Notification };
import { BorderBeam } from '@src/scripts/components/BorderBeam';
import { init } from '@src/scripts/utils/omok';
import { handleServerCommand } from '@src/scripts/utils/handleServerCommand';
import { connectSSE } from './utils/apiClient';
export { BorderBeam };

const State = new StateStore();
const initSSE = async () => {
  const eventSource = connectSSE((data) => {
    console.log(data);
    if (isValidServerCommand(data)) {
      handleServerCommand(data, State);
    }
  });
  return () => {
    eventSource.close();
  };
};

// const connectSocket = () => {
//   State.socket = new WebSocket(backendUrl);
//   State.socket.onopen = (e) => {
//     State.gameState = 'WAITING_FOR_OPPONENT';
//     State.socket?.send(
//       JSON.stringify(makeClientCommand('JOIN_QUEUE', { payload: {} })),
//     );
//     State.socket!.onclose = (event) => {
//       if (!event.wasClean && reconnectAttempts < 3) {
//         setTimeout(() => {
//           connectSocket();
//           reconnectAttempts++;
//         }, Math.random() * 1000);
//       }
//     };
//     State.socket!.onmessage = (event) => {
//       try {
//         const parsedMessage = JSON.parse(event.data.toString());
//         console.log(parsedMessage);
//         if (isValidServerCommand(parsedMessage)) {
//           handleServerCommand(parsedMessage, State);
//         }
//       } catch (err) {
//         console.error('Failed to parse message', err);
//       }
//     };
//   };
// };

// connectSocket();
initSSE();
init(State);
