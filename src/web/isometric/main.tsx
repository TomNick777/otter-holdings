import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { World } from "./World.tsx";
import { money } from "./presentation.ts";
import { campuses } from "../../application/isometric.ts";
import "./identity.css";
import "./portfolio.css";

const pages = ["总览", "账户与持仓", "活动", "表现", "数据与证据"];
function App() {
  const [page, setPage] = useState("总览");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(false);
  const [asset, setAsset] = useState<string | null>(null);
  const [detail, setDetail] = useState(false);
  const model = campuses[index]!;
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (detail && !dialog.current?.open) {
      returnFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    } else if (!detail && dialog.current?.open) {
      dialog.current.close();
      returnFocus.current?.focus();
    }
  }, [detail]);
  const choose = (id?: string) => {
    setSelected(true);
    setAsset(id ?? null);
  };
  const reset = () => {
    setSelected(false);
    setAsset(null);
  };
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        reset();
        setDetail(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <div className="otter-app">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            setPage("总览");
            reset();
          }}
          aria-label="Otter Holdings 首页"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <path
              d="M3 10L15 4L27 10V22L15 28L3 22ZM3 10L15 16L27 10M15 16V28M9 7L21 13V25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          <span>
            OTTER<small>HOLDINGS</small>
          </span>
        </button>
        <nav aria-label="主要导航">
          {pages.map((p) => (
            <button
              key={p}
              aria-current={p === page ? "page" : undefined}
              onClick={() => {
                setPage(p);
                reset();
              }}
            >
              {p}
            </button>
          ))}
        </nav>
        <span className="local-status">
          <i />
          作品集 · 模拟数据
        </span>
      </header>
      <div className="edition-bar">
        <span>我的投资组合 / 等距园区</span>
        <span>
          视觉研究 <b>01</b> · 模拟时点 2025-09-20
        </span>
      </div>
      {page === "总览" ? (
        <main className={`overview ${selected ? "has-selection" : ""}`}>
          <section className="world-stage" aria-label="空间组合总览">
            <div className="overview-heading">
              <span className="eyebrow">YOUR PORTFOLIO, IN PLACE</span>
              <h1>
                我的投资世界<span>.</span>
              </h1>
              <p>一片属于你的街区，每一笔资产都有来处。</p>
            </div>
            <div className="world-total">
              <span>
                账户估值 <small>/ CNY</small>
              </span>
              <div>
                <em>¥</em>
                <button
                  className="fact-number"
                  onClick={() => setDetail(true)}
                  aria-label="查看估值组成"
                >
                  {money(model.total)}
                  <i>●</i>
                </button>
              </div>
              <p>2025-09-20 · 独立构造的模拟快照</p>
            </div>
            <World
              model={model}
              selected={selected}
              asset={asset}
              onSelect={choose}
            />
            <div className="district-chip">
              <button onClick={() => choose()}>
                <span className="district-index">0{index + 1}</span>
                <span>
                  <b>{model.account.name}</b>
                  <small>2 项持仓 · 现金庭院</small>
                </span>
                <span className="arrow">↗</span>
              </button>
            </div>
            <div className="scene-footer">
              <span>
                ISOMETRIC STUDY <b>01 / 园区</b>
              </span>
              <button onClick={reset}>⌖ 返回全景</button>
            </div>
          </section>
          {selected && (
            <aside className="inspector" aria-label="账户检查器">
              <div className="inspector-top">
                <span className="eyebrow">ACCOUNT / 0{index + 1}</span>
                <button onClick={reset} aria-label="关闭账户检查器">
                  ×
                </button>
              </div>
              <h2>{model.account.name}</h2>
              <p className="muted">独立模拟账户 · CNY</p>
              <div className="inspector-value">¥{money(model.total)}</div>
              {asset && (
                <p className="selection-note">
                  已聚焦 ·{" "}
                  {asset === "cash"
                    ? "现金庭院"
                    : model.holdings.find((p) => p.assetId === asset)?.name}
                </p>
              )}
              <div className="inspector-holdings">
                {model.holdings.map((p) => (
                  <div key={p.assetId}>
                    <span>
                      {p.name}
                      <small>{p.quantity} 份 / 股</small>
                    </span>
                    <b>¥{money(p.value)}</b>
                  </div>
                ))}
              </div>
              <p>现金庭院　¥{money(model.observation.cash)}</p>
              <button className="primary" onClick={() => setPage("账户与持仓")}>
                查看账户 →
              </button>
            </aside>
          )}
          <section className="overview-bottom">
            <div>
              <span className="eyebrow">THE WORLD, EXPLAINED</span>
              <h3>看清当下，也保留未知。</h3>
              <p>这里呈现一个独立模拟的投资街区，不连接真实账户。</p>
            </div>
            <button onClick={() => setDetail(true)}>
              <span>
                时点估值 <i className="verified">●</i>
              </span>
              <b>所需组成齐备</b>
              <small>查看模拟持仓与现金组成 ↗</small>
            </button>
            <button onClick={() => setPage("数据与证据")}>
              <span>
                设计说明 <i className="caution">◐</i>
              </span>
              <b>让资产拥有空间感</b>
              <small>查看数据边界与视觉映射 ↗</small>
            </button>
          </section>
          <p className="world-legend">
            空间说明：地块 = 账户 · 建筑 = 持仓 · 低层庭院 =
            账户内现金。高度仅提示相对市值，准确金额以数字为准。
          </p>
        </main>
      ) : (
        <main className="demo-workspace">
          <span className="eyebrow">THE WORLD, EXPLAINED</span>
          <h1>{page}</h1>
          {page === "账户与持仓" && (
            <>
              <div className="account-tabs">
                {campuses.map((m, i) => (
                  <button
                    key={m.account.id}
                    aria-pressed={i === index}
                    onClick={() => {
                      setIndex(i);
                      reset();
                    }}
                  >
                    {m.account.name}
                  </button>
                ))}
              </div>
              <h2>{model.account.name}</h2>
              <p>
                账户估值 ¥{money(model.total)} · 现金 ¥
                {money(model.observation.cash)}
              </p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>资产</th>
                      <th>数量</th>
                      <th>模拟市值 / CNY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.holdings.map((p) => (
                      <tr key={p.assetId}>
                        <td>{p.name}</td>
                        <td>{p.quantity}</td>
                        <td>{money(p.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="primary" onClick={() => setPage("总览")}>
                在园区中查看 →
              </button>
            </>
          )}
          {page === "活动" && (
            <>
              <h2>只有快照，不补造交易</h2>
              <p>
                此设计演示提供两个模拟账户的时点持仓，未提供交易历史。历史活动保持未知。
              </p>
              <p className="empty-state">暂无模拟交易记录</p>
            </>
          )}
          {page === "表现" && (
            <>
              <h2>保留未知，胜过一个漂亮的数字</h2>
              <p>
                缺少完整现金流与历史价格，累计收益、年化收益和历史曲线均不展示。
              </p>
              <div className="metric-grid">
                <div>
                  累计收益<strong>—</strong>
                </div>
                <div>
                  年化收益<strong>—</strong>
                </div>
                <div>
                  历史表现<strong>—</strong>
                </div>
              </div>
            </>
          )}
          {page === "数据与证据" && (
            <>
              <h2>一座可以阅读的微缩园区</h2>
              <p>
                等距建筑、低饱和配色和留白，将账户与资产转化为可探索的空间。点击建筑、现金庭院或账户卡片，可以查看对应信息。
              </p>
              <p>
                账户、产品、数量和金额均为独立构造的虚拟场景；没有真实账单、账户连接或后台服务。此版以
                SVG 呈现，建筑高度提示账户内部的相对市值，不用于跨账户比较。
              </p>
              <p>
                估值组成 = 模拟持仓市值 +
                模拟现金。未提供交易历史与收益资料，相关值保持未知。
              </p>
              <a href="../">查看三维投资城市版 ↗</a>
              <p>
                <a
                  href="https://github.com/TomNick777/otter-holdings"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub 源码 ↗
                </a>
              </p>
            </>
          )}
        </main>
      )}
      <footer className="demo-footer">
        <span>OTTER HOLDINGS / ISOMETRIC EDITION</span>
        <a href="../">三维城市版 ↗</a>
        <span>独立模拟数据 · MIT License</span>
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setDetail(false)}
        aria-label="估值组成"
        className="demo-dialog"
      >
        <button
          autoFocus
          onClick={() => setDetail(false)}
          aria-label="关闭估值组成"
        >
          关闭 ×
        </button>
        <h2>时点估值的组成</h2>
        <p>{model.account.name} · 2025-09-20 · 模拟数据</p>
        {model.holdings.map((p) => (
          <p key={p.assetId}>
            {p.name}　¥{money(p.value)}
          </p>
        ))}
        <p>现金　¥{money(model.observation.cash)}</p>
        <h3>合计　¥{money(model.total)}</h3>
      </dialog>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
