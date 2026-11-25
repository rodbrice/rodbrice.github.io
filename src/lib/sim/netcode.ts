/** Deterministic illustration: reliable, ordered packets, no packet loss.
 * Every input carries one fixed 60 Hz movement step. Server snapshots at 20 Hz
 * acknowledge the last applied input; reconciliation replays the remaining ones.
 * One-way latency is rounded up to the next simulation tick (at most 16.7 ms).
 */
export const STEP_MS = 1000 / 60;
export const SNAPSHOT_TICKS = 3;
interface Input {
  sequence: number;
  delta: number;
  sent: number;
  arrives: number;
}
interface Snapshot {
  position: number;
  acknowledged: number;
  sent: number;
  arrives: number;
}
export class Netcode {
  tick = 0;
  intended = 200;
  displayed = 200;
  server = 200;
  ghost = 200;
  lastSnapshotTick = 0;
  acknowledged = 0;
  pending: Input[] = [];
  inputs: Input[] = [];
  snapshots: Snapshot[] = [];
  constructor(
    readonly rtt = 200,
    readonly prediction = true,
    readonly reconciliation = true,
  ) {}
  get error(): number {
    return Math.abs(this.intended - this.displayed);
  }
  step(direction: number): void {
    this.tick++;
    const delay = Math.ceil(this.rtt / 2 / STEP_MS);
    const input = {
      sequence: this.tick,
      delta: direction * 2,
      sent: this.tick,
      arrives: this.tick + delay,
    };
    this.intended += input.delta;
    if (this.prediction) this.displayed += input.delta;
    this.pending.push(input);
    this.inputs.push(input);
    while (this.inputs[0] && this.inputs[0].arrives <= this.tick) {
      const received = this.inputs.shift();
      if (!received) break;
      this.server += received.delta;
      this.acknowledged = received.sequence;
    }
    if (this.tick % SNAPSHOT_TICKS === 0) {
      this.snapshots.push({
        position: this.server,
        acknowledged: this.acknowledged,
        sent: this.tick,
        arrives: this.tick + delay,
      });
    }
    while (this.snapshots[0] && this.snapshots[0].arrives <= this.tick) {
      const state = this.snapshots.shift();
      if (!state) break;
      this.ghost = state.position;
      this.lastSnapshotTick = state.sent;
      this.pending = this.pending.filter(
        (entry) => entry.sequence > state.acknowledged,
      );
      this.displayed = state.position;
      if (this.prediction && this.reconciliation) {
        for (const entry of this.pending) this.displayed += entry.delta;
      }
    }
  }
}
