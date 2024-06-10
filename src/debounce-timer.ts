export class DebounceTimer {
  private handle: any;

  private shouldTrigger = false;

  constructor(delayMs: number = 100) {
    this.handle = setInterval(() => {
      if (this.shouldTrigger) {
        this.onTrigger();
        this.shouldTrigger = false;
      }
    }, delayMs);
  }

  public dispose() {
    clearInterval(this.handle);
  }

  public onTrigger: () => void = () => undefined;

  public queueTrigger() {
    this.shouldTrigger = true;
  }
}
