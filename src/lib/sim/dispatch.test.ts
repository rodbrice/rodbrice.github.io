import { describe, expect, it } from "vitest";
import { Dispatch, distance } from "./dispatch";

describe("dispatch", () => {
  it("assigns to the nearest free vehicle using corridor distance and deterministic ties", () => {
    const sim = new Dispatch(4);
    sim.enqueue(2, 3);
    expect(sim.vehicles[2]?.job?.id).toBe(1);
    sim.enqueue(3, 0);
    expect(sim.vehicles[1]?.job?.id).toBe(2);
    expect(distance(0, 2)).toBe(200);
    expect(distance(0, 1)).toBe(600);
    expect(distance(0, 0)).toBe(0);
  });
  it("chooses the vehicle that became free first, regardless of distance", () => {
    const sim = new Dispatch(4, "first");
    sim.vehicles.forEach((vehicle, i) => {
      vehicle.freeSince = i === 1 ? -3 : -2;
    });
    sim.enqueue(2, 3);
    expect(sim.vehicles[1]?.job?.id).toBe(1);
  });
  it.each(["nearest", "first"] as const)(
    "preserves FIFO and accounts for queue wait with %s",
    (policy) => {
      const sim = new Dispatch(4, policy, 1000);
      // Delay generated arrivals so this fixture contains only manually added jobs.
      sim.enqueue(0, 2); // vehicle 0: 8 s
      sim.enqueue(1, 0); // vehicle 1: 16 s
      sim.enqueue(2, 1); // vehicle 2: 16 s
      sim.enqueue(3, 1);
      sim.enqueue(0, 1);
      expect(sim.queue.map((job) => job.id)).toEqual([4, 5]);
      sim.step(8);
      expect(sim.queue.map((job) => job.id)).toEqual([5]);
      expect(sim.assigned).toBe(4);
      expect(sim.totalWait).toBe(8);
      expect(sim.meanWait).toBe(2);
      expect(sim.utilization).toBe(1);
      expect(
        sim.vehicles.flatMap((v) => (v.job ? [v.job.id] : [])).sort(),
      ).toEqual([2, 3, 4]);
      expect(sim.vehicles[0]?.job?.id).toBe(4);
    },
  );
  it("is deterministic across render step sizes and respects the selected arrival rate", () => {
    const whole = new Dispatch(40);
    const parts = new Dispatch(40);
    whole.step(120);
    for (let i = 0; i < 1200; i++) parts.step(0.1);
    expect(parts.assigned).toBe(whole.assigned);
    expect(parts.queue).toEqual(whole.queue);
    expect(parts.totalWait).toBeCloseTo(whole.totalWait, 8);
    expect(parts.busySeconds).toBeCloseTo(whole.busySeconds, 8);
    const low = new Dispatch(4);
    low.step(120);
    expect(low.assigned + low.queue.length).toBeLessThan(
      whole.assigned + whole.queue.length,
    );
  });
  it("counts idle time in utilization and preserves jobs when demand changes", () => {
    const sim = new Dispatch(4);
    sim.enqueue(0, 2);
    sim.step(1);
    expect(sim.utilization).toBeCloseTo(1 / 3);
    sim.setDemand(40);
    expect(sim.time).toBe(1);
    expect(sim.vehicles[0]?.job?.id).toBe(1);
    expect(sim.meanWait).toBe(0);
  });
});
