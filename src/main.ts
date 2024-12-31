import { Controller } from './controller';

const canvasElement = document.querySelector<HTMLCanvasElement>('#app');

if (!canvasElement) {
  throw new Error('Canvas element not found');
}

const controller = new Controller(canvasElement);

controller.render();
