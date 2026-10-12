import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CityOverview } from "./city/CityOverview.tsx";
import { CityTimeline, useCityReplay } from "./city/CityTimeline.tsx";
import { Assets } from "./Assets.tsx";
import { About } from "./About.tsx";
import { cityDistricts } from "../application/portfolio.ts";
import { history } from "../simulation/scenario.ts";
import "./style.css";

function App() {
  const [page, setPage] = useState<"city" | "assets" | "about">("city");
  const [account, setAccount] = useState("broker");
  const replay = useCityReplay(history);
  const openAccount = (id: string) => {
    setAccount(id);
    setPage("assets");
    window.scrollTo({ top: 0 });
  };
  const navigate = (value: typeof page) => {
    if (page === "city" && replay.playing) replay.toggle();
    setPage(value);
  };
  return (
    <div className="portfolio-app">
      <header className="site-header">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("city");
          }}
        >
          <span className="brand-mark">⬡</span>OTTER <b>HOLDINGS</b>
        </a>
        <nav aria-label="主要导航">
          {(
            [
              ["city", "投资城市"],
              ["assets", "资产"],
              ["about", "作品说明"],
            ] as const
          ).map(([key, name]) => (
            <button
              key={key}
              aria-current={page === key ? "page" : undefined}
              onClick={() => navigate(key)}
            >
              {name}
            </button>
          ))}
        </nav>
        <span className="demo-badge">模拟数据 · 作品集</span>
      </header>
      {page === "city" && (
        <CityOverview
          districts={cityDistricts(replay.sample)}
          date={replay.sample.date}
          onAccount={openAccount}
          timeline={<CityTimeline controller={replay} />}
        />
      )}
      {page === "assets" && (
        <Assets accountId={account} onAccount={setAccount} />
      )}
      {page === "about" && <About />}
      <footer className="site-footer">
        <span>OTTER HOLDINGS / PUBLIC EDITION</span>
        <span>独立模拟场景 · MIT License</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
