interface Props {
  source: "healthpoint" | "demo" | null;
  total: number;
}

export function Header({ source, total }: Props) {
  return (
    <header className="site-header">
      <div className="header-brand">
        <div className="logo">
          <span className="logo-icon">🏥</span>
          <div>
            <h1>Healthpoint Finder</h1>
            <p className="tagline">
              Healthcare, community services, ACC / WINZ &amp; urgent care near you
            </p>
          </div>
        </div>
        <div className="header-meta">
          {source && (
            <span className={`source-badge ${source}`}>
              {source === "healthpoint" ? "Live Healthpoint data" : "Demo data"}
            </span>
          )}
          {total > 0 && <span className="result-count">{total} providers found</span>}
          <a
            href="https://www.healthpoint.co.nz/"
            target="_blank"
            rel="noopener noreferrer"
            className="healthpoint-link"
          >
            healthpoint.co.nz ↗
          </a>
        </div>
      </div>
    </header>
  );
}