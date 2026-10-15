import React from "react";
import type { DemoModel } from "./presentation.ts";
import { money, projectWorld } from "./presentation.ts";

const iso = (x: number, y: number, z = 0) => [
  480 + (x - y) * 0.88,
  175 + (x + y) * 0.43 - z,
];
const points = (coords: number[][]) => coords.map((p) => p.join(",")).join(" ");
export function Plane({
  x,
  y,
  w,
  d,
  z = 0,
  fill,
  stroke,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  z?: number;
  fill: string;
  stroke?: string;
}) {
  return (
    <polygon
      points={points([
        iso(x, y, z),
        iso(x + w, y, z),
        iso(x + w, y + d, z),
        iso(x, y + d, z),
      ])}
      fill={fill}
      stroke={stroke}
    />
  );
}
export function Block({
  x,
  y,
  w,
  d,
  h,
  z = 0,
  tone = "stone",
  windows = false,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z?: number;
  tone?: string;
  windows?: boolean;
}) {
  const palettes: Record<string, string[]> = {
    stone: ["#eee5d3", "#b5b3a6", "#d5ccba"],
    glass: ["#b5cbd1", "#47717c", "#719ba6"],
    copper: ["#dcb27c", "#9a714e", "#c49765"],
    dark: ["#879b9b", "#3e5659", "#5d7475"],
    green: ["#a4b193", "#596f60", "#7a9279"],
  };
  const c = palettes[tone]!;
  return (
    <g>
      <polygon
        points={points([
          iso(x, y + d, z),
          iso(x + w, y + d, z),
          iso(x + w, y + d, z + h),
          iso(x, y + d, z + h),
        ])}
        fill={c[2]}
      />
      <polygon
        points={points([
          iso(x + w, y, z),
          iso(x + w, y + d, z),
          iso(x + w, y + d, z + h),
          iso(x + w, y, z + h),
        ])}
        fill={c[1]}
      />
      <Plane x={x} y={y} w={w} d={d} z={z + h} fill={c[0]!} />
      {windows &&
        Array.from(
          { length: Math.max(0, Math.floor((h - 12) / 12)) },
          (_, i) => {
            const a = iso(x + 3, y + d, z + 10 + i * 12),
              b = iso(x + w - 3, y + d, z + 10 + i * 12),
              e = iso(x + w, y + 3, z + 10 + i * 12),
              f = iso(x + w, y + d - 3, z + 10 + i * 12);
            return (
              <g
                key={i}
                stroke={tone === "glass" ? "#d5e2df" : "#687e7d"}
                opacity={tone === "glass" ? 0.72 : 0.6}
                strokeWidth={3}
              >
                <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
                <line x1={e[0]} y1={e[1]} x2={f[0]} y2={f[1]} />
              </g>
            );
          },
        )}
      {windows &&
        Array.from({ length: Math.floor(w / 13) }, (_, i) => {
          const a = iso(x + 8 + i * 13, y + d, z + 4),
            b = iso(x + 8 + i * 13, y + d, z + h - 4);
          return (
            <line
              key={i}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke={tone === "glass" ? "#305564" : "#e4dcc9"}
              strokeWidth={2}
              opacity={0.55}
            />
          );
        })}
    </g>
  );
}
export function Tree({
  x,
  y,
  size = 1,
}: {
  x: number;
  y: number;
  size?: number;
}) {
  const p = iso(x, y, 5);
  return (
    <g transform={`translate(${p[0]} ${p[1]}) scale(${size})`}>
      <ellipse cx={7} cy={4} rx={15} ry={6} fill="#435f5420" />
      <path d="M0 0V-19" stroke="#827456" strokeWidth={3} />
      <path d="M-12-18Q-16-38 0-42Q17-35 12-18Q0-11-12-18" fill="#5f7e6c" />
      <path d="M-12-22Q-14-36 0-42Q7-34 4-23Z" fill="#829a7b" />
    </g>
  );
}
export function World({
  model,
  selected,
  asset,
  onSelect,
  mini = false,
}: {
  model: DemoModel;
  selected: boolean;
  asset: string | null;
  onSelect: (id?: string) => void;
  mini?: boolean;
}) {
  const world = projectWorld(model);
  return (
    <svg
      viewBox="75 40 810 560"
      className={`world-svg${selected ? " focused" : ""}${mini ? " miniature" : ""}`}
      role="group"
      aria-label={`${model.account.name}微缩街区：${world.holdings.length}项已记录产品；空心轮廓表示市值未知`}
    >
      <defs>
        <filter
          id={mini ? "soft-mini" : "soft"}
          x="-60%"
          y="-60%"
          width="220%"
          height="230%"
        >
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <linearGradient id={mini ? "water-mini" : "water"} x2="0" y2="1">
          <stop stopColor="#d5e1de" />
          <stop offset="1" stopColor="#e9ede6" />
        </linearGradient>
      </defs>
      <g className="camera">
        <ellipse
          cx="490"
          cy="434"
          rx="255"
          ry="82"
          fill="#314b4230"
          filter={`url(#${mini ? "soft-mini" : "soft"})`}
        />
        <Plane
          x={-95}
          y={-48}
          w={505}
          d={405}
          z={-28}
          fill={`url(#${mini ? "water-mini" : "water"})`}
        />
        {[0, 1, 2].map((i) => (
          <Plane
            key={i}
            x={-65 + i * 25}
            y={337 + i * 14}
            w={300 - i * 42}
            d={1}
            z={-25}
            fill="#b5c7c2"
          />
        ))}
        <Block x={-45} y={-28} w={380} d={305} h={22} z={-22} />
        <Plane x={-40} y={-23} w={370} d={295} fill="#dfdfd1" />
        <Plane x={-16} y={-2} w={324} d={248} fill="#c5cebb" />
        <Plane x={-16} y={119} w={324} d={28} fill="#b8b9ab" />
        <Plane x={166} y={-2} w={23} d={248} fill="#b8b9ab" />
        <Plane x={-16} y={132} w={324} d={2} fill="#eee9d9" />
        <Plane x={178} y={-2} w={2} d={248} fill="#eee9d9" />
        {[
          [-5, 30],
          [-5, 85],
          [145, 28],
          [145, 82],
          [297, 28],
          [300, 85],
        ].map(([x, y], i) => (
          <Tree key={i} x={x!} y={y!} />
        ))}
        <g
          className="district-hit"
          role={mini ? undefined : "button"}
          tabIndex={mini ? undefined : 0}
          aria-label={`选择${model.account.name}街区`}
          aria-pressed={selected}
          onClick={() => onSelect()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          <Plane
            x={-28}
            y={-14}
            w={349}
            d={270}
            z={1}
            fill="transparent"
            stroke={selected ? "#7b9688" : "#a8b9a5"}
          />
          {world.holdings.map((p, i) => {
            const columns = Math.max(
              2,
              Math.ceil(Math.sqrt(world.holdings.length)),
            );
            const x = (i % columns) * (290 / columns) + 8,
              y = Math.floor(i / columns) * 80 + 12,
              w = Math.min(93, 240 / columns),
              d = 60;
            if (p.value?.value == null)
              return (
                <g
                  key={p.assetId}
                  className="unknown-building"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(p.assetId);
                  }}
                >
                  <title>{p.name} · 市值未知；不映射高度或面积</title>
                  <Plane x={x} y={y} w={w} d={d} fill="none" stroke="#687872" />
                  <text
                    x={iso(x, y)[0]}
                    y={iso(x, y)[1]! - 12}
                    className="asset-caption"
                  >
                    {p.name} · —
                  </text>
                </g>
              );
            return (
              <g
                key={p.assetId}
                className={`asset-building ${asset === p.assetId ? "active" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`查看${p.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(p.assetId);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(p.assetId);
                }}
              >
                <title>
                  {p.name} · ¥{money(p.value?.value)} · 选择所属
                  {model.account.name}
                </title>
                <polygon
                  points={points([
                    iso(x, y),
                    iso(x + w, y),
                    iso(x + w + 70, y + d + 58),
                    iso(x + 45, y + d + 58),
                  ])}
                  fill="#4c655735"
                />
                <Block x={x - 6} y={y - 6} w={w + 12} d={d + 12} h={8} />
                <Block
                  x={x}
                  y={y}
                  w={w}
                  d={d}
                  h={p.height}
                  z={8}
                  tone={i === 0 ? "glass" : "stone"}
                  windows
                />
                <Block
                  x={x - 2}
                  y={y - 2}
                  w={w + 4}
                  d={d + 4}
                  h={4}
                  z={p.height + 8}
                />
                <Block
                  x={x + 9}
                  y={y + 9}
                  w={w - 18}
                  d={d - 18}
                  h={9}
                  z={p.height + 12}
                  tone={i === 0 ? "dark" : "green"}
                />
                <Block
                  x={x + 21}
                  y={y + 19}
                  w={24}
                  d={23}
                  h={12}
                  z={p.height + 21}
                  tone={i === 0 ? "stone" : "copper"}
                />
                <Block
                  x={x + 5}
                  y={y + d - 8}
                  w={w - 10}
                  d={22}
                  h={25}
                  z={8}
                  tone="dark"
                  windows
                />
                {Array.from({ length: 5 }, (_, j) => (
                  <Block
                    key={j}
                    x={x + 5 + j * 17}
                    y={y + d + 10}
                    w={3}
                    d={5}
                    h={30}
                    tone="stone"
                  />
                ))}
              </g>
            );
          })}
          <g
            role="button"
            tabIndex={0}
            aria-label="查看现金庭院"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onSelect("cash");
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect("cash");
            }}
          >
            <title>
              现金庭院 · {model.account.name} ·{" "}
              {model.observation.cash == null
                ? "现金未知"
                : "现金有正式估值依据"}
            </title>
            {model.observation.cash == null ? (
              <Plane
                x={9}
                y={167}
                w={122}
                d={61}
                fill="none"
                stroke="#687872"
              />
            ) : (
              <>
                <Block
                  x={9}
                  y={167}
                  w={122}
                  d={61}
                  h={25}
                  tone="stone"
                  windows
                />
                <Block x={5} y={163} w={130} d={69} h={5} z={25} />
                <Plane x={18} y={176} w={102} d={43} z={31} fill="#a8b59d" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <Block
                    key={i}
                    x={20 + i * 20}
                    y={178}
                    w={3}
                    d={40}
                    h={3}
                    z={32}
                    tone="copper"
                  />
                ))}
              </>
            )}
          </g>
        </g>
        {[
          [-4, 159],
          [-4, 228],
          [153, 185],
          [156, 235],
          [292, 211],
          [274, 173],
          [245, 212],
          [213, 177],
        ]
          .sort((a, b) => a[0]! + a[1]! - b[0]! - b[1]!)
          .map(([x, y], i) => (
            <Tree key={i} x={x!} y={y!} size={i % 3 === 0 ? 0.85 : 1} />
          ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Block
            key={i}
            x={-10 + i * 55}
            y={262}
            w={24}
            d={6}
            h={5}
            tone="stone"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <Block
            key={i}
            x={211 + i * 24}
            y={240}
            w={16}
            d={5}
            h={5}
            tone="copper"
          />
        ))}
        {!mini && world.holdings.length <= 2 && (
          <g className="world-labels">
            {world.holdings.map((p, i) => (
              <g key={p.assetId}>
                <text
                  x={i === 0 ? 145 : 710}
                  y={i === 0 ? 247 : 262}
                  className="asset-caption"
                >
                  {p.name}
                </text>
                <text
                  x={i === 0 ? 145 : 710}
                  y={i === 0 ? 267 : 282}
                  className="asset-amount"
                >
                  ¥{money(p.value?.value)}
                </text>
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
