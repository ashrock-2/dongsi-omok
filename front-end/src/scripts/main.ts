import { GameController } from 'src/scripts/GameController';
import { Board } from 'src/scripts/components/Board';
import { Notification } from 'src/scripts/components/Notification';
import { BorderBeam } from 'src/scripts/components/BorderBeam';

export { Board, Notification, BorderBeam };

document.addEventListener('DOMContentLoaded', () => {
  const board = document.querySelector('omok-board') as Board;
  const borderBeam = board.querySelector('border-beam') as BorderBeam;
  const notification = document.querySelector(
    'game-notification',
  ) as Notification;

  const gameController = new GameController(board);
  borderBeam.setState(gameController.getState());
  notification.setState(gameController.getState());
});
