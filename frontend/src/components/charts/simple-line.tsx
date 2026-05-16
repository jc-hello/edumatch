'use client';

import * as React from 'react';

interface SimpleLineProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  formatValue?: (v: number) => string;
}

export function SimpleLine({ data, height = 180, className, formatValue }: SimpleLineProps) {
  const width = 600;
  if (data.length === 0) {
    return (
      <div
        className={className}
        style={{ height }}
      >
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Chưa có dữ liệu
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const padX = 24;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padY + innerH - ((d.value - min) / range) * innerH;
    return { x, y, label: d.label, value: d.value };
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const area = `${path} L ${points[points.length - 1].x} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: '100%', height }}
      aria-hidden
    >
      <defs>
        <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#line-fill)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--accent)" />
          <circle cx={p.x} cy={p.y} r="8" fill="var(--accent)" opacity="0.15" />
          <text x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
            {p.label}
          </text>
          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--foreground)">
            {formatValue ? formatValue(p.value) : p.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
