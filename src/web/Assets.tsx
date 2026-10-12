import React, { useMemo } from "react";
import {
  accountSeries,
  accountSnapshot,
  formatMoney,
} from "../application/portfolio.ts";
import { accounts, history } from "../simulation/scenario.ts";

export function Assets({
  accountId,
  onAccount,
}: {
  accountId: string;
  onAccount(id: string): void;
}) {
  const snapshot = useMemo(
    () => accountSnapshot(accountId, history.asOf),
    [accountId],
  );
  const series = useMemo(() => accountSeries(accountId), [accountId]);
  const known = series.filter(
    (p): p is { date: string; value: string } => p.value !== null,
  );
  const values = known.map((p) => Number(p.value));
  const lo = Math.min(...values),
    hi = Math.max(...values);
  const path = known
    .map(
      (p, i) =>
        `${38 + (i / Math.max(1, known.length - 1)) * 924},${205 - ((Number(p.value) - lo) / Math.max(1, hi - lo)) * 165}`,
    )
    .join(" ");
  return (
    <main className="assets-body">
      <div className="demo-intro">
        <div>
          <span className="eyebrow">THE ASSET WORKSPACE</span>
          <h1>
            让每项持仓，清晰可见<span>。</span>
          </h1>
          <p>从城市走进账户，查看当前持仓与模拟市值。</p>
        </div>
        <div className="demo-date">
          模拟估值日期<b>{history.asOf}</b>
        </div>
      </div>
      <nav className="demo-tabs" aria-label="资产账户">
        {accounts.map((a) => (
          <button
            key={a.id}
            className={a.id === accountId ? "active" : ""}
            aria-pressed={a.id === accountId}
            onClick={() => onAccount(a.id)}
          >
            {a.name}
          </button>
        ))}
      </nav>
      <section className="asset-hero">
        <div>
          <span className="eyebrow">
            {snapshot.account.group} / {snapshot.account.name}
          </span>
          <h2>持仓市值</h2>
          <strong>
            <small>¥</small>
            {formatMoney(snapshot.total)}
          </strong>
          <p>仅计算持仓，不包含现金；未知数量或价格时保留未知。</p>
        </div>
        <div className="asset-secondary">
          <span>模拟现金</span>
          <b>¥{formatMoney(snapshot.account.cash)}</b>
          <span>当前持仓</span>
          <b>
            {
              snapshot.positions.filter(
                (p) => p.quantity !== null && p.quantity > 0,
              ).length
            }{" "}
            项
          </b>
        </div>
      </section>
      <section className="chart-surface">
        <div className="surface-heading">
          <h2>持仓市值变化</h2>
          <span>2025 年 · 模拟数量 × 模拟价格</span>
        </div>
        <svg
          viewBox="0 0 1000 250"
          role="img"
          aria-label={`${snapshot.account.name}模拟持仓市值历史，包含建仓和减持变化，不代表收益率`}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#729788" stopOpacity=".28" />
              <stop offset="100%" stopColor="#729788" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 95, 150, 205].map((y) => (
            <line key={y} x1="38" x2="962" y1={y} y2={y} stroke="#dce2d6" />
          ))}
          <polygon points={`38,210 ${path} 962,210`} fill="url(#chart-fill)" />
          <polyline
            points={path}
            fill="none"
            stroke="#547b68"
            strokeWidth="2.5"
          />
          <text x="38" y="240">
            01 JAN
          </text>
          <text x="910" y="240">
            20 SEP
          </text>
        </svg>
        <p className="chart-note">
          市值变化包含持仓增减，不等同投资收益。模拟行情独立生成，不用于反推交易。
        </p>
      </section>
      <section className="positions-surface">
        <div className="surface-heading">
          <h2>持仓清单</h2>
          <span>现金单独列示 · 清仓项保留在历史目录</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>资产</th>
                <th>份额</th>
                <th>模拟单价</th>
                <th>持仓市值</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.positions.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    {p.quantity === null
                      ? "未知"
                      : p.quantity.toLocaleString("zh-CN")}
                  </td>
                  <td>{formatMoney(p.price)}</td>
                  <td>{formatMoney(p.value)}</td>
                  <td>
                    <span className="holding-state">
                      {p.quantity === null
                        ? "未知"
                        : p.quantity === 0
                          ? "已清仓"
                          : "持有"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
