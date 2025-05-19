import { updatePlayerStatus } from '../utils/render.js';

/**
 * Draw player status indicators on the stage.
 * This replicates legacy draw_player_data logic using ES6 modules.
 *
 * @param {Game} game - Game instance containing player info
 * @param {Object[]} sprites - Array of CreateJS display objects
 * @param {Object} opts - Options for rendering
 * @param {number} opts.spriteIndex - Starting index for player status sprites
 * @param {number} opts.banIndex - Sprite index for the current player marker
 * @param {number} opts.viewWidth - Canvas width
 * @param {number} opts.yposArm - Y position for the status indicators
 * @param {Function} opts.resize - Scaling helper
 * @param {boolean} opts.spectate - Flag for spectator mode
 * @param {Object[]} [opts.buttons] - Button sprites array
 * @param {number} [opts.titleButton] - Index of title button in the buttons array
 */
export function drawPlayerData(
  game,
  sprites,
  {
    spriteIndex,
    banIndex,
    viewWidth,
    yposArm,
    resize,
    spectate = false,
    buttons = [],
    titleButton,
  } = {}
) {
  let activeCount = 0;

  // Hide all status sprites and count active players
  for (let i = 0; i < game.pmax; i++) {
    const sn = spriteIndex + i;
    sprites[sn].visible = false;
    const p = game.jun[i];
    if (game.player[p].area_tc > 0) {
      sprites[sn].visible = true;
      activeCount++;
    }
  }

  // Position sprites and update values
  let c = 0;
  for (let i = 0; i < game.pmax; i++) {
    const p = game.jun[i];
    if (game.player[p].area_tc === 0) continue;

    const sn = spriteIndex + i;
    const w = resize(100);
    const ox = viewWidth / 2 - ((activeCount - 1) * w) / 2 + c * w;
    const sp = sprites[sn];
    sp.x = ox;
    sp.y = yposArm;
    c++;

    // Mark current player
    if (i === game.ban) {
      const ban = sprites[banIndex];
      ban.x = ox;
      ban.y = yposArm;
      ban.gotoAndStop('ban');
      ban.visible = true;
    }
  }

  // Update text fields using utility
  updatePlayerStatus(game, sprites, spriteIndex);

  // Ensure title button visible in spectator mode
  if (spectate && titleButton != null && buttons[titleButton]) {
    const btn = buttons[titleButton];
    btn.x = resize(60);
    btn.y = resize(25);
    btn.visible = true;
  }
}
