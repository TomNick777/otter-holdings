import React, { useState } from "react";
import { ThreeCity } from "./ThreeCity.tsx";
import type { CityDistrict } from "../../application/city-types.ts";

export function CityOverview({
  districts,
  date,
  timeline,
  onAccount,
}: {
  districts: CityDistrict[];
  date: string;
  timeline: React.ReactNode;
  onAccount(id: string): void;
}) {
  const [scope, setScope] = useState("all");
  const [asset, setAsset] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [reset, setReset] = useState(0);
  const [moving, setMoving] = useState(false);
  const [wide, setWide] = useState(false);
  const groups = [...new Set(districts.map((d) => d.scope))];
  const visible = districts.filter(
    (d) => scope === "all" || d.id === scope || d.scope === scope,
  );
  const title =
    scope === "all"
      ? "全部账户"
      : (districts.find((d) => d.id === scope)?.name ?? scope);
  const select = (id: string, key?: string) => {
    setScope(id);
    setAsset(key ?? null);
  };
  const selected = visible
    .flatMap((d) => d.assets)
    .find((h) => h.key === asset);
  return (
    <main className="city-body">
      <div className="demo-intro">
        <div>
          <span className="eyebrow">ONE WORLD. EVERY ACCOUNT.</span>
          <h1>
            账户成园，持仓成城<span>。</span>
          </h1>
          <p>每一座楼，都有一段持有的故事。</p>
        </div>
        <div className="demo-date">
          模拟持仓日期<b>{date}</b>
        </div>
      </div>
      <nav className="demo-tabs" aria-label="账户范围">
        {[
          { key: "all", name: "合并总览" },
          ...groups.map((g) => ({ key: g, name: g })),
        ].map((tab) => (
          <button
            key={tab.key}
            className={scope === tab.key ? "active" : ""}
            aria-pressed={scope === tab.key}
            onClick={() => select(tab.key)}
          >
            {tab.name}
            {tab.key === "all" && <small>{districts.length}</small>}
          </button>
        ))}
      </nav>
      <div className={`demo-workspace${wide ? " demo-wide" : ""}`}>
        <section className="demo-scene" aria-label="投资城市">
          <div className="demo-metrics">
            <span>{title} · 持仓建筑</span>
            <strong>
              {visible.reduce((n, d) => n + d.totalNumber, 0)}
              <small>座</small>
            </strong>
            <p>
              {visible.length} 个核算账户 · 建筑随数量变化，楼高不比较资产金额
            </p>
          </div>
          <ThreeCity
            districts={districts}
            scope={scope}
            selected={asset}
            zoom={zoom}
            moving={moving}
            reset={reset}
            onSelect={select}
          />
          <div className="demo-map-footer">
            <span>园区 = 账户 · 建筑 = 持仓 · 配套不计入资产</span>
            <div>
              <button onClick={() => setWide(!wide)} aria-pressed={wide}>
                {wide ? "收起城市" : "展开城市"}
              </button>
              <button onClick={() => setMoving(!moving)} aria-pressed={moving}>
                {moving ? "暂停车流" : "开启车流"}
              </button>
              <button
                aria-label="缩小城市"
                onClick={() => setZoom(Math.max(0.8, zoom - 0.2))}
              >
                −
              </button>
              <button
                aria-label="放大城市"
                onClick={() => setZoom(Math.min(2.4, zoom + 0.2))}
              >
                ＋
              </button>
              <button
                onClick={() => {
                  select("all");
                  setZoom(1);
                  setReset((n) => n + 1);
                }}
              >
                全景复位
              </button>
            </div>
          </div>
          {timeline}
        </section>
        <aside className="demo-inspector">
          <span className="eyebrow">
            {scope === "all" ? "THE DISTRICTS" : "IN FOCUS"}
          </span>
          <div className="demo-aside-title">
            <h2>{scope === "all" ? "城市里的账户" : title}</h2>
            {scope !== "all" && (
              <button aria-label="返回全部账户" onClick={() => select("all")}>
                ↗
              </button>
            )}
          </div>
          <p className="demo-muted">选择园区，查看持仓与账户详情</p>
          {(scope === "all"
            ? groups
            : [...new Set(visible.map((d) => d.scope))]
          ).map((group, index) => {
            const children = districts.filter((d) => d.scope === group);
            return (
              <div className="demo-account" key={group}>
                <button onClick={() => select(group)}>
                  <span>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <b>{group}</b>
                  </span>
                  <strong>
                    {children.reduce((n, d) => n + d.totalNumber, 0)} 项
                  </strong>
                </button>
                <div className="demo-children">
                  {children.map((d) => (
                    <button
                      key={d.id}
                      className={scope === d.id ? "active" : ""}
                      onClick={() => select(d.id)}
                    >
                      <span>{d.name}</span>
                      <b>{d.total}</b>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {scope !== "all" && (
            <div className="demo-holdings">
              <h3>园区内的持仓</h3>
              {visible.flatMap((d) =>
                d.assets
                  .filter((h) => h.held)
                  .map((h) => (
                    <button
                      key={h.key}
                      className={h.key === asset ? "active" : ""}
                      onClick={() => setAsset(h.key)}
                    >
                      <span>{h.name}</span>
                      <b>{h.amount}</b>
                    </button>
                  )),
              )}
              {visible.map((d) => (
                <button
                  className="account-link"
                  key={d.id}
                  onClick={() => onAccount(d.id)}
                >
                  查看{d.name}资产 →
                </button>
              ))}
            </div>
          )}
          <div className="demo-note">
            <b>
              {selected ? `已选择 · ${selected.name}` : "一座会记得持仓的城市"}
            </b>
            <p>
              {selected
                ? `${selected.amount}。每项资产拥有固定地块；清仓后回归绿地，再买入时重返原位。`
                : "选择“本月”或“本年”，看见建仓、增持、减持和清仓。时间回放使用模拟数量，不表示收益。"}
            </p>
          </div>
        </aside>
      </div>
      <footer className="demo-bottom">
        <span>6 个园区 / 一条共同时间轴</span>
        <p>全部账户、持仓与行情均为独立构造的模拟场景。</p>
      </footer>
    </main>
  );
}
