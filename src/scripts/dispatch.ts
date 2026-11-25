import { AREAS, areaAt, Dispatch } from "../lib/sim/dispatch";
import type { dispatchLabels } from "../data/dispatch-labels";

for (const root of document.querySelectorAll<HTMLElement>("[data-dispatch]")) {
  const canvas = root.querySelector("canvas");
  const ctx = canvas?.getContext("2d");
  const pause = root.querySelector<HTMLButtonElement>("[data-pause]");
  const demand = root.querySelector<HTMLInputElement>("[data-demand]");
  const policy = root.querySelector<HTMLSelectElement>("[data-policy]");
  const interactive = root.querySelector<HTMLElement>("[data-interactive]");
  const fallback = root.querySelector<HTMLElement>("[data-fallback]");
  if (
    !canvas ||
    !ctx ||
    !pause ||
    !demand ||
    !policy ||
    !interactive ||
    !fallback ||
    !("IntersectionObserver" in window)
  )
    continue;
  const labels = JSON.parse(
    canvas.dataset.labels ?? "{}",
  ) as typeof dispatchLabels.en;
  const sim = new Dispatch();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = motion.matches;
  let visible = false;
  let frame = 0;
  let previous = 0;
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = 640 * ratio;
  canvas.height = 340 * ratio;
  ctx.scale(ratio, ratio);

  function output(selector: string, value: string): void {
    const element = root.querySelector<HTMLOutputElement>(selector);
    if (element) element.value = value;
  }
  function draw(): void {
    if (!ctx) return;
    const text = getComputedStyle(root).color;
    const accent = getComputedStyle(
      root.querySelector(".intended") ?? root,
    ).color;
    ctx.clearRect(0, 0, 640, 340);
    ctx.lineWidth = 2;
    ctx.strokeStyle = text;
    ctx.beginPath();
    ctx.moveTo(120, 70);
    ctx.lineTo(120, 270);
    ctx.moveTo(520, 70);
    ctx.lineTo(520, 270);
    ctx.moveTo(120, 170);
    ctx.lineTo(520, 170);
    ctx.stroke();
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = text;
    ctx.fillText(labels.corridor, 320, 150);
    for (const [i, area] of AREAS.entries()) {
      ctx.clearRect(area.x - 70, area.y - 26, 140, 52);
      ctx.strokeStyle = accent;
      ctx.strokeRect(area.x - 70, area.y - 26, 140, 52);
      ctx.fillStyle = text;
      ctx.fillText(`${labels.area} ${String(i + 1)}`, area.x, area.y - 34);
    }
    for (const vehicle of sim.vehicles) {
      const start = areaAt(vehicle.area);
      let x: number = start.x;
      let y: number = start.y;
      const job = vehicle.job;
      if (job) {
        const route: { x: number; y: number }[] = [{ x, y }];
        for (const target of [job.from, job.to]) {
          const destination = areaAt(target);
          const last = route[route.length - 1];
          if (!last) continue;
          if (last.x !== destination.x || last.y !== destination.y) {
            route.push(
              { x: last.x, y: 170 },
              { x: destination.x, y: 170 },
              destination,
            );
          }
        }
        let remaining = (sim.time - vehicle.started) * 50;
        for (let i = 1; i < route.length; i++) {
          const a = route[i - 1];
          const b = route[i];
          if (!a || !b) continue;
          const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
          const fraction = length ? Math.min(1, remaining / length) : 1;
          x = a.x + (b.x - a.x) * fraction;
          y = a.y + (b.y - a.y) * fraction;
          remaining -= length;
          if (remaining <= 0) break;
        }
      }
      y += job ? 0 : 34 + vehicle.id * 4;
      ctx.strokeStyle = job ? accent : text;
      ctx.strokeRect(x - 16, y - 12, 32, 24);
      ctx.fillStyle = job ? accent : text;
      if (job) ctx.fillRect(x - 11, y - 6, 6, 12);
      ctx.fillText(String(vehicle.id + 1), x + 5, y + 5);
    }
    output("[data-queue]", String(sim.queue.length));
    output("[data-wait]", sim.meanWait.toFixed(1));
    output("[data-busy]", (sim.utilization * 100).toFixed(0));
  }
  function animate(now: number): void {
    frame = 0;
    if (previous) sim.step(Math.min(now - previous, 100) / 1000);
    previous = now;
    draw();
    frame = requestAnimationFrame(animate);
  }
  function sync(): void {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (pause) {
      pause.textContent =
        (paused ? pause.dataset.play : pause.dataset.stop) ?? "";
      pause.setAttribute("aria-pressed", String(paused));
    }
    const running = !paused && visible && !document.hidden;
    root.dataset.running = String(running);
    if (running) frame = requestAnimationFrame(animate);
    draw();
  }
  pause.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  demand.addEventListener("input", () => {
    sim.setDemand(Number(demand.value));
    output("[data-demand-value]", `${demand.value} ${labels.perMinute}`);
    draw();
  });
  policy.addEventListener("change", () => {
    sim.policy = policy.value === "first" ? "first" : "nearest";
    draw();
  });
  motion.addEventListener("change", () => {
    if (motion.matches) {
      paused = true;
      sync();
    }
  });
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    sync();
  }).observe(root);
  fallback.hidden = true;
  interactive.hidden = false;
  sync();
}
