import { Netcode, STEP_MS } from "../lib/sim/netcode";
import type { netcodeLabels } from "../data/netcode-labels";

for (const root of document.querySelectorAll<HTMLElement>("[data-network]")) {
  const canvas = root.querySelector<HTMLCanvasElement>("canvas");
  const context = canvas?.getContext("2d");
  const pause = root.querySelector<HTMLButtonElement>("[data-pause]");
  const rtt = root.querySelector<HTMLInputElement>("[data-rtt]");
  const prediction = root.querySelector<HTMLInputElement>("[data-prediction]");
  const reconciliation = root.querySelector<HTMLInputElement>(
    "[data-reconciliation]",
  );
  const interactive = root.querySelector<HTMLElement>("[data-interactive]");
  const fallback = root.querySelector<HTMLElement>("[data-fallback]");
  const pending = root.querySelector<HTMLOutputElement>("[data-pending]");
  const error = root.querySelector<HTMLOutputElement>("[data-error]");
  const latency = root.querySelector<HTMLOutputElement>("[data-latency]");
  if (
    !canvas ||
    !context ||
    !pause ||
    !rtt ||
    !prediction ||
    !reconciliation ||
    !interactive ||
    !fallback ||
    !pending ||
    !error ||
    !latency
  )
    continue;
  const pixelRatio = Math.min(devicePixelRatio, 2);
  canvas.width = 640 * pixelRatio;
  canvas.height = 360 * pixelRatio;
  context.scale(pixelRatio, pixelRatio);
  const labels = JSON.parse(
    canvas.dataset.labels ?? "{}",
  ) as typeof netcodeLabels.en;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = motion.matches;
  let visible = false;
  let frame = 0;
  let previous = 0;
  let accumulated = 0;
  let sim = new Netcode();
  let history: { intended: number; displayed: number }[] = [];

  function draw(): void {
    if (!context || !canvas || !pending || !error) return;
    const style = getComputedStyle(root);
    const accent = getComputedStyle(
      root.querySelector(".intended") ?? root,
    ).color;
    const text = style.color;
    const muted = getComputedStyle(
      root.querySelector("figcaption") ?? root,
    ).color;
    context.clearRect(0, 0, 640, 360);
    context.font = "13px monospace";
    context.lineWidth = 2;
    const line = (points: number[][], color: string, dashed = false): void => {
      context.strokeStyle = color;
      context.setLineDash(dashed ? [6, 5] : []);
      context.beginPath();
      points.forEach(([x = 0, y = 0], i) => {
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
      context.setLineDash([]);
    };
    const dot = (
      x: number,
      y: number,
      color: string,
      outline = false,
    ): void => {
      context.fillStyle = color;
      context.strokeStyle = color;
      context.beginPath();
      context.arc(x, y, outline ? 9 : 5, 0, Math.PI * 2);
      if (outline) context.stroke();
      else context.fill();
    };
    context.fillStyle = text;
    context.fillText(labels.client, 24, 25);
    context.fillText(labels.server, 24, 85);
    line(
      [
        [24, 55],
        [616, 55],
      ],
      muted,
    );
    line(
      [
        [24, 100],
        [616, 100],
      ],
      muted,
    );
    dot(sim.displayed, 55, accent);
    dot(sim.ghost, 55, text, true);
    dot(sim.server, 100, text);
    // Separate packet lanes show opposite directions, independent of position.
    for (const [packets, y, reverse] of [
      [sim.inputs, 142, false],
      [sim.snapshots, 180, true],
    ] as const) {
      line(
        [
          [24, y],
          [616, y],
        ],
        muted,
      );
      for (const packet of packets) {
        const progress =
          (sim.tick - packet.sent) / (packet.arrives - packet.sent);
        dot(24 + (reverse ? 1 - progress : progress) * 592, y, accent);
      }
    }
    context.fillStyle = text;
    context.fillText(`${labels.input} →`, 24, 132);
    context.fillText(`← ${labels.state}`, 24, 170);
    context.fillText("4 s", 590, 225);
    line(
      [
        [24, 240],
        [24, 336],
        [616, 336],
      ],
      muted,
    );
    // Fixed position scale (180–340 px), shared by both traces.
    for (const [key, color, dashed] of [
      ["intended", accent, false],
      ["displayed", text, true],
    ] as const) {
      line(
        history.map((sample, i) => [
          24 + ((240 - history.length + i) / 239) * 592,
          336 - ((sample[key] - 180) / 160) * 96,
        ]),
        color,
        dashed,
      );
    }
    pending.value = String(sim.pending.length);
    error.value = sim.error.toFixed(0);
  }
  function animate(now: number): void {
    frame = 0;
    accumulated += previous ? Math.min(now - previous, 100) : 0;
    previous = now;
    while (accumulated >= STEP_MS) {
      sim.step(Math.floor(sim.tick / 60) % 2 ? -1 : 1);
      history.push({ intended: sim.intended, displayed: sim.displayed });
      if (history.length > 240) history.shift();
      accumulated -= STEP_MS;
    }
    draw();
    frame = requestAnimationFrame(animate);
  }
  function sync(): void {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    accumulated = 0;
    if (pause) {
      pause.textContent =
        (paused ? pause.dataset.play : pause.dataset.stop) ?? "";
      pause.setAttribute("aria-pressed", String(paused));
    }
    root.dataset.running = String(!paused && visible && !document.hidden);
    if (!paused && visible && !document.hidden)
      frame = requestAnimationFrame(animate);
    draw();
  }
  pause.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  for (const control of [rtt, prediction, reconciliation]) {
    control.addEventListener("input", () => {
      sim = new Netcode(
        Number(rtt.value),
        prediction.checked,
        reconciliation.checked,
      );
      history = [];
      latency.value = `${rtt.value} ms`;
      draw();
    });
  }
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
