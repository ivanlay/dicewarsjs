// Setup file to run before tests

// Mock createjs objects
global.createjs = {
  Container: class Container {
    constructor() {
      this.children = [];
      this.x = 0;
      this.y = 0;
    }
    addChild(...children) {
      this.children.push(...children);
    }
    on() {}
  },
  Shape: class Shape {
    constructor() {
      this.graphics = {
        beginFill: () => this.graphics,
        beginStroke: () => this.graphics,
        drawRoundRect: () => this.graphics,
        drawCircle: () => this.graphics,
        clear: () => this.graphics,
        endFill: () => this.graphics,
        endStroke: () => this.graphics,
        moveTo: () => this.graphics,
        lineTo: () => this.graphics,
        closePath: () => this.graphics,
        setStrokeStyle: () => this.graphics
      };
      this.x = 0;
      this.y = 0;
    }
  },
  Text: class Text {
    constructor(text, font, color) {
      this.text = text;
      this.font = font;
      this.color = color;
      this.x = 0;
      this.y = 0;
      this.textAlign = 'left';
      this.textBaseline = 'top';
    }
  },
  Sprite: class Sprite {
    constructor(spriteSheet) {
      this.spriteSheet = spriteSheet;
    }
    gotoAndStop() {}
  },
  SpriteSheetBuilder: class SpriteSheetBuilder {
    constructor() {}
    addFrame() {}
    build() {
      return {};
    }
  },
  Sound: {
    initializeDefaultPlugins: () => true,
    registerSounds: () => {},
    play: () => ({}),
    stop: () => {},
    INTERRUPT_ANY: 'interrupt'
  },
  Touch: {
    isSupported: () => false,
    enable: () => {}
  },
  Stage: class Stage {
    constructor() {}
    enableMouseOver() {}
    update() {}
  },
  Ticker: {
    timingMode: null,
    RAF: 'raf',
    addEventListener: () => {}
  },
  LoadQueue: class LoadQueue {
    constructor() {}
    installPlugin() {}
    loadManifest() {}
    on() {}
  }
};