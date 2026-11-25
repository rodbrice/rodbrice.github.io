import { describe, expect, it } from "vitest";
import { Netcode, SNAPSHOT_TICKS, STEP_MS } from "./netcode";

const direction = (tick: number): number =>
  Math.floor(tick / 60) % 2 ? -1 : 1;
describe("authoritative network illustration", () => {
  it("replays unacknowledged inputs with zero error at every supported RTT", () => {
    for (let rtt = 0; rtt <= 400; rtt++) {
      const sim = new Netcode(rtt);
      for (let tick = 0; tick < 600; tick++) {
        sim.step(direction(tick));
        expect(sim.error).toBe(0);
      }
    }
  });
  it.each([0, 1, 50, 137, 200, 300, 400])(
    "without prediction displays a server snapshot delayed by half RTT plus snapshot cadence (%i ms)",
    (rtt) => {
      const sim = new Netcode(rtt, false);
      const serverHistory = [sim.server];
      const delay = Math.ceil(rtt / 2 / STEP_MS);
      for (let tick = 0; tick < 300; tick++) {
        sim.step(direction(tick));
        serverHistory.push(sim.server);
        expect(sim.displayed).toBe(serverHistory[sim.lastSnapshotTick]);
        if (sim.lastSnapshotTick > 0) {
          const age = sim.tick - sim.lastSnapshotTick;
          expect(age).toBeGreaterThanOrEqual(delay);
          expect(age).toBeLessThan(delay + SNAPSHOT_TICKS);
        }
      }
    },
  );
  it("loses unacknowledged movement without reconciliation after a reversal", () => {
    const sim = new Netcode(300, true, false);
    for (let tick = 0; tick < 66; tick++) sim.step(direction(tick));
    expect(sim.error).toBeGreaterThan(0);
    expect(sim.displayed).toBe(sim.ghost);
    expect(sim.pending.length).toBeGreaterThan(0);
  });
});
