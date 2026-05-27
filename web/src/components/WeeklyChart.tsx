import { useEffect, useRef } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  data: number[];
}

export function WeeklyChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const maxVal = Math.max(...data, 1);
    const barWidth = Math.floor(width / 7) - 12;
    const chartHeight = height - 28;

    // Read CSS custom properties
    const styles = getComputedStyle(document.documentElement);
    const accentColor = styles.getPropertyValue("--color-accent").trim() || "#6366f1";
    const mutedColor = styles.getPropertyValue("--color-muted").trim() || "#8a8780";
    const lineColor = styles.getPropertyValue("--color-line").trim() || "#e8e5e0";

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Horizontal guides
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 3; i++) {
      const y = chartHeight - (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Bars
    for (let i = 0; i < 7; i++) {
      const val = data[i] ?? 0;
      const barH = maxVal > 0 ? (val / maxVal) * (chartHeight - 4) : 0;
      const x = i * (width / 7) + (width / 7 - barWidth) / 2;
      const y = chartHeight - barH;

      // Bar
      ctx.fillStyle = val > 0 ? accentColor : lineColor;
      ctx.beginPath();
      const r = 3;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, chartHeight);
      ctx.lineTo(x, chartHeight);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();

      // Value label on top
      if (val > 0) {
        ctx.fillStyle = mutedColor;
        ctx.font = "10px Manrope, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${val}`, x + barWidth / 2, y - 4);
      }

      // Day label
      const label = DAYS[i] ?? "";
      ctx.fillStyle = mutedColor;
      ctx.font = "10px Manrope, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x + barWidth / 2, height - 4);
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: 140 }}
    />
  );
}
