import { Controller } from './controller';
import { ImageLoader } from './model/image-loader';

const canvasElement = document.querySelector<HTMLCanvasElement>('#app');

if (!canvasElement) {
  throw new Error('Canvas element not found');
}

const MOCK_IMAGE_URL = 'https://picsum.photos/1920/1080';

ImageLoader.load(MOCK_IMAGE_URL).then((image) => {
  const controller = new Controller(canvasElement, image);

  controller.render();
});
