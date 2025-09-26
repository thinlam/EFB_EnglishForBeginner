// đơn giản & không phụ thuộc lib ngoài
type Listener = () => void;

class HistoryBus {
  private listeners = new Set<Listener>();
  emit() { for (const l of this.listeners) l(); }
  on(cb: Listener) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
}

export const historyBus = new HistoryBus();
