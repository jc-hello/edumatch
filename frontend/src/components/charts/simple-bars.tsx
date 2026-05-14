'use client';

import * as React from 'react';

interface SimpleBarsProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
}

export function SimpleBars({ data, height = 180, className }: SimpleBarsProps) {
  const width = 600;
  const max = Math.max(...data.map((d) => d.value), 1);
  const padX = 24;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const gap = 14;
  const barW = (innerW - gap * (data.length - 1)) / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: '100%', height }}
      aria-hidden
    >
      <defs>
        <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-secondary)" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = padX + i * (barW + gap);
        const y = padY + innerH - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill="url(#bar-fill)" />
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--foreground)">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
