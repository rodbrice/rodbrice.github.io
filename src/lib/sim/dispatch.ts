/** Distances follow the central corridor; time is in seconds. */
export const AREAS = [
  { x: 120, y: 70 },
  { x: 520, y: 70 },
  { x: 120, y: 270 },
  { x: 520, y: 270 },
] as const;
export const areaAt = (index: number) => AREAS[index] ?? AREAS[0];
export const distance = (a: number, b: number): number =>
  a === b ? 0 : Math.abs(areaAt(a).x - areaAt(b).x) + 200;
export type Policy = "nearest" | "first";
export interface Job {
  id: number;
  from: number;
  to: number;
  arrived: number;
}
export interface Vehicle {
  id: number;
  area: number;
  freeSince: number;
  job?: Job;
  until: number;
  started: number;
}
export class Dispatch {
  time = 0;
  queue: Job[] = [];
  vehicles: Vehicle[] = [0, 1, 2].map((id) => ({
    id,
    area: id,
    freeSince: 0,
    until: 0,
    started: 0,
  }));
  assigned = 0;
  totalWait = 0;
  busySeconds = 0;
  private seed: number;
  private nextArrival: number;
  private sequence = 0;
  constructor(
    public demand = 16,
    public policy: Policy = "nearest",
    seed = 42,
  ) {
    this.seed = seed;
    this.nextArrival = this.time + this.interval();
  }
  private random(): number {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return (this.seed + 0.5) / 4294967296;
  }
  private interval(): number {
    return (-Math.log(1 - this.random()) * 60) / this.demand;
  }
  /** Changing demand preserves elapsed time and jobs, and resamples the next arrival. */
  setDemand(demand: number): void {
    this.demand = Math.max(4, Math.min(40, demand));
    this.nextArrival = this.time + this.interval();
  }
  enqueue(from: number, to: number): void {
    this.queue.push({ id: ++this.sequence, from, to, arrived: this.time });
    this.dispatch();
  }
  private dispatch(): void {
    while (this.queue.length) {
      const job = this.queue[0];
      if (!job) break;
      const free = this.vehicles.filter((vehicle) => !vehicle.job);
      free.sort((a, b) =>
        this.policy === "nearest"
          ? distance(a.area, job.from) - distance(b.area, job.from) ||
            a.id - b.id
          : a.freeSince - b.freeSince || a.id - b.id,
      );
      const vehicle = free[0];
      if (!vehicle) break;
      this.queue.shift();
      this.totalWait += this.time - job.arrived;
      this.assigned++;
      vehicle.job = job;
      vehicle.started = this.time;
      // 50 diagram units/s, plus 4 s for loading and unloading.
      vehicle.until =
        this.time +
        (distance(vehicle.area, job.from) + distance(job.from, job.to)) / 50 +
        4;
    }
  }
  /** Process exact event times, independent of rendering or caller step size. */
  step(seconds: number): void {
    const end = this.time + Math.max(0, seconds);
    while (this.time < end) {
      const event = Math.min(
        end,
        this.nextArrival,
        ...this.vehicles.filter((v) => v.job).map((v) => v.until),
      );
      this.busySeconds +=
        (event - this.time) * this.vehicles.filter((v) => v.job).length;
      this.time = event;
      for (const vehicle of this.vehicles) {
        if (vehicle.job && vehicle.until <= this.time) {
          vehicle.area = vehicle.job.to;
          delete vehicle.job;
          vehicle.freeSince = this.time;
        }
      }
      this.dispatch();
      if (this.nextArrival <= this.time) {
        const from = Math.floor(this.random() * 4);
        const to = (from + 1 + Math.floor(this.random() * 3)) % 4;
        this.nextArrival = this.time + this.interval();
        this.enqueue(from, to);
      }
    }
  }
  get meanWait(): number {
    return this.assigned ? this.totalWait / this.assigned : 0;
  }
  get utilization(): number {
    return this.time ? this.busySeconds / (this.time * 3) : 0;
  }
}
