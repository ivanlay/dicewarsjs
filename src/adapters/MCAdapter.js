export class MCAdapter {
  constructor() {
    if (!window.MC) {
      throw new Error('MC not initialized');
    }
    this.mc = window.MC;
  }

  drawElement(element, properties) {
    this.mc.drawElement(element, properties);
    return this;
  }

  addEventListener(event, callback) {
    this.mc.setEventHandler(event, (...args) => {
      callback(...args);
    });
  }
}

export default MCAdapter;
