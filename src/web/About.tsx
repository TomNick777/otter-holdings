import React from "react";

export function About() {
  return (
    <main className="about-body">
      <span className="eyebrow">THE STORY BEHIND THE CITY</span>
      <h1>
        财务信息，也可以被看见<span>。</span>
      </h1>
      <p className="about-lead">
        Otter Holdings
        是一个投资可视化作品。它将分散的账户化为园区，将持仓化为建筑，让长期持有与增减变化有可感知的空间形态。
      </p>
      <div className="about-grid">
        <section>
          <span className="eyebrow">01 / EXPERIENCE</span>
          <h2>城市记得每一项资产</h2>
          <p>
            地块由资产身份决定。建仓时升起，增持时扩建，减持时收缩，清仓时回归绿地；再次买入回到同一处。
          </p>
        </section>
        <section>
          <span className="eyebrow">02 / CLARITY</span>
          <h2>数量与金额，各有含义</h2>
          <p>
            城市的楼高只随数量变化。金额在资产页独立呈现，行情变化不会让持仓建筑变高，不同资产楼高也不用于比较财富。
          </p>
        </section>
        <section>
          <span className="eyebrow">03 / ENGINEERING</span>
          <h2>计算与展示分层</h2>
          <p>
            通用财务核心计算金额、完整性和收益指标；应用层准备账户视图；React
            消费视图，Three.js 负责场景与交互。未知信息保留未知。
          </p>
        </section>
        <section>
          <span className="eyebrow">04 / PUBLIC EDITION</span>
          <h2>独立、可复现的模拟版</h2>
          <p>
            所有名称、数量、变化记录及价格均来自虚构场景。公开版无需数据库、账单、账户连接或网络服务，可作为静态网站运行。
          </p>
        </section>
      </div>
      <section className="about-footer">
        <h2>从本地财务工具，到公开作品</h2>
        <p>
          原项目探索了本地优先、证据边界、财务重建和多账户展示。这个公开版保留交互成果与通用计算核心，聚焦于可浏览、可理解的演示。真实账户资料和历史数据未包含在公开源码中。
        </p>
        <a
          className="primary-link"
          href="https://github.com/TomNick777/otter-holdings"
          target="_blank"
          rel="noreferrer"
        >
          查看源码 ↗
        </a>
        <span>React · TypeScript · Three.js · Decimal.js</span>
      </section>
    </main>
  );
}
