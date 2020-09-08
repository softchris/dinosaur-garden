class MessageBus {
  listeners: {};
  constructor() {
    this.listeners = {}; 
  }
  subscribe(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }
  dispatch(message: string, payload) {
    this.listeners[message].forEach(l => {
      l(payload);
    });
  }
}

export const bus = new MessageBus();