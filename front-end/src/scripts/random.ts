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

initSSE();
init(State);
