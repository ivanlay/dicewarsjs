import { getConfig } from '../utils/config.js';
import { createButton, createText } from '../utils/render.js';

/**
 * Render the initial title screen.
 * @param {createjs.Stage} stage - The CreateJS stage to render on.
 * @param {Function} onStart - Callback when the start button is clicked.
 * @returns {createjs.Container} The title screen container.
 */
export function renderTitleScreen(stage, onStart = () => {}) {
  const cfg = getConfig();
  const { viewWidth, viewHeight } = cfg.display;

  const container = new createjs.Container();
  container.name = 'titleScreen';

  const title = createText('DICE WARS', viewWidth / 2, viewHeight * 0.3, '#000000', '48px Anton');
  container.addChild(title);

  const buttonWidth = 200;
  const buttonHeight = 60;
  const startBtn = createButton(
    'Start Game',
    viewWidth / 2 - buttonWidth / 2,
    viewHeight * 0.6,
    buttonWidth,
    buttonHeight,
    onStart
  );
  container.addChild(startBtn);

  stage.addChild(container);
  stage.update();
  return container;
}
