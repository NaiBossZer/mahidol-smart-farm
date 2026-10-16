import { useState, type ReactNode } from "react";

type IconName =
  | "activity"
  | "arrow"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "compare"
  | "drone"
  | "field"
  | "grid"
  | "history"
  | "image"
  | "layers"
  | "leaf"
  | "location"
  | "menu"
  | "more"
  | "note"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "sun"
  | "temperature"
  | "water"
  | "wind";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    activity: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    compare: <><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M12 2v20" /></>,
    drone: <><path d="M8 10h8l2 4H6l2-4ZM12 6v4M4 7h4M16 7h4" /><circle cx="3" cy="7" r="2" /><circle cx="21" cy="7" r="2" /><path d="M8 14v3M16 14v3" /></>,
    field: <><path d="M4 21c2-7 6-12 16-18M4 14c4 0 7 1 9 4M9 8c3 0 6 1 9 4" /><path d="M4 21h16" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-5L5 20" /></>,
    layers: <><path d="m12 3-9 5 9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    leaf: <><path d="M20 4c-9 0-15 4-15 10a5 5 0 0 0 5 5c6 0 10-6 10-15Z" /><path d="M4 21c3-7 8-10 13-13" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    spark: <path d="m12 3 1.3 4.1L17 9l-3.7 1.9L12 15l-1.3-4.1L7 9l3.7-1.9L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15ZM19 13l.6 1.4L21 15l-1.4.6L19 17l-.6-1.4L17 15l1.4-.6L19 13Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    temperature: <><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" /><path d="M12 9v7" /></>,
    water: <path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" />,
    wind: <><path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const fieldImage = "https://images.unsplash.com/photo-1771131826047-f2f32bd24dac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=82&w=1600";
const fieldImagePrevious = "https://images.unsplash.com/photo-1780167603284-6124c80f084c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=82&w=1600";

type View = "overview" | "history" | "compare";

function Button({ children, icon, tone = "secondary", onClick, className = "" }: { children: ReactNode; icon?: IconName; tone?: "primary" | "secondary" | "ghost"; onClick?: () => void; className?: string }) {
  return (
    <button className={`button button--${tone} ${className}`} onClick={onClick}>
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
    </button>
  );
}

function SelectControl({ label, value }: { label: string; value: string }) {
  return (
    <button className="select-control">
      <span className="select-control__label">{label}</span>
      <strong>{value}</strong>
      <Icon name="chevron" size={16} />
    </button>
  );
}

function Sidebar({ view, setView }: { view: View; setView: (view: View) => void }) {
  const items: { id: View; label: string; icon: IconName }[] = [
    { id: "overview", label: "Survey overview", icon: "grid" },
    { id: "history", label: "Survey history", icon: "history" },
    { id: "compare", label: "Compare imagery", icon: "compare" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand-mark"><Icon name="leaf" size={22} /></div>
        <div><strong>Smart Farm</strong><span>Mahidol University</span></div>
      </div>
      <div className="sidebar__section-label">DRONE SYSTEM</div>
      <nav className="sidebar__nav" aria-label="Drone system">
        {items.map((item) => (
          <button key={item.id} className={view === item.id ? "nav-item is-active" : "nav-item"} onClick={() => setView(item.id)}>
            <Icon name={item.icon} size={19} /><span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__section-label">MANAGE</div>
      <nav className="sidebar__nav">
        <button className="nav-item"><Icon name="field" size={19} /><span>Fields & crops</span></button>
        <button className="nav-item"><Icon name="drone" size={19} /><span>Drone fleet</span><span className="nav-count">2</span></button>
        <button className="nav-item"><Icon name="settings" size={19} /><span>Settings</span></button>
      </nav>
      <div className="sidebar__footer">
        <div className="integration-card">
          <span className="integration-card__icon"><Icon name="layers" size={17} /></span>
          <strong>Data integrations</strong>
          <p>Connect weather, soil, and irrigation data in a future phase.</p>
          <button>View roadmap <Icon name="arrow" size={14} /></button>
        </div>
        <div className="profile">
          <div className="avatar">NK</div>
          <div><strong>Narin K.</strong><span>Farm researcher</span></div>
          <Icon name="more" size={18} />
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      <div className="breadcrumbs"><span>Smart Farm</span><b>/</b><strong>Drone monitoring</strong></div>
      <div className="topbar__actions">
        <div className="sample-pill"><span></span> SAMPLE DATA</div>
        <button className="icon-button" aria-label="Search"><Icon name="search" /></button>
        <Button tone="primary" icon="plus">Plan new survey</Button>
      </div>
    </header>
  );
}

function HealthGauge() {
  return (
    <div className="health-gauge">
      <svg viewBox="0 0 120 70" aria-label="Crop health score 84 out of 100">
        <path d="M15 60a45 45 0 0 1 90 0" pathLength="100" className="gauge-bg" />
        <path d="M15 60a45 45 0 0 1 90 0" pathLength="100" className="gauge-value" />
      </svg>
      <div><strong>84</strong><span>/ 100</span></div>
    </div>
  );
}

function Overview({ onCompare, onHistory }: { onCompare: () => void; onHistory: () => void }) {
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow"><span>DRONE MONITORING</span><i></i><span>LAST UPDATED 2 HOURS AGO</span></div>
          <h1>Good morning, Narin</h1>
          <p>Here’s the latest view of crop health and survey activity across your fields.</p>
        </div>
        <div className="heading-filters">
          <SelectControl label="FIELD" value="North Research Field" />
          <SelectControl label="CROP" value="Rice · RD43" />
        </div>
      </section>

      <section className="status-grid">
        <article className="status-card status-card--wide">
          <div className="status-card__icon status-card__icon--green"><Icon name="leaf" /></div>
          <div><span>Average crop health</span><strong>84%</strong><small className="positive">↗ 4.2% <em>from last survey</em></small></div>
          <HealthGauge />
        </article>
        <article className="status-card">
          <div className="status-card__icon"><Icon name="image" /></div>
          <div><span>Area surveyed</span><strong>12.4 <small>rai</small></strong><small>100% field coverage</small></div>
        </article>
        <article className="status-card">
          <div className="status-card__icon status-card__icon--gold"><Icon name="spark" /></div>
          <div><span>Areas to inspect</span><strong>3 <small>zones</small></strong><small className="warning">1 high priority</small></div>
        </article>
        <article className="status-card">
          <div className="status-card__icon"><Icon name="history" /></div>
          <div><span>Surveys this season</span><strong>8</strong><small>Next survey · 28 Jun</small></div>
        </article>
      </section>

      <section className="overview-layout">
        <article className="card imagery-card">
          <div className="card-heading">
            <div><span className="card-kicker">LATEST SURVEY</span><h2>Field imagery</h2><p>22 June 2025 · 09:42 · Multispectral</p></div>
            <div className="segmented"><button className="active"><Icon name="image" size={15} />RGB</button><button><Icon name="activity" size={15} />NDVI</button></div>
          </div>
          <div className="field-map" style={{ backgroundImage: `url(${fieldImage})` }}>
            <div className="field-map__wash"></div>
            <div className="map-zone map-zone--one"><span>1</span></div>
            <div className="map-zone map-zone--two"><span>2</span></div>
            <div className="map-zone map-zone--three"><span>3</span></div>
            <div className="map-meta">
              <span><Icon name="location" size={14} /> North Research Field</span>
              <span>12.4 rai</span>
            </div>
            <div className="map-legend"><span>Vegetation index</span><div className="legend-gradient"></div><div><small>Low</small><small>High</small></div></div>
            <div className="map-tools"><button aria-label="Map layers"><Icon name="layers" size={17} /></button><button aria-label="Full screen"><Icon name="grid" size={17} /></button></div>
          </div>
          <div className="imagery-footer">
            <span><Icon name="check" size={15} /> Processing complete</span>
            <div><button onClick={onCompare}>Compare with previous</button><Button tone="primary" icon="arrow">Explore imagery</Button></div>
          </div>
        </article>

        <aside className="insights-column">
          <article className="card field-health-card">
            <div className="card-heading"><div><span className="card-kicker">FIELD HEALTH</span><h2>Zone summary</h2></div><button className="icon-button"><Icon name="more" /></button></div>
            <div className="donut-row">
              <div className="donut"><div><strong>84%</strong><span>Healthy</span></div></div>
              <div className="health-legend">
                <div><i className="dot dot--healthy"></i><span>Healthy</span><strong>10.4 rai</strong></div>
                <div><i className="dot dot--watch"></i><span>Monitor</span><strong>1.6 rai</strong></div>
                <div><i className="dot dot--risk"></i><span>At risk</span><strong>0.4 rai</strong></div>
              </div>
            </div>
            <div className="zone-alert">
              <span className="zone-alert__number">1</span>
              <div><strong>Low vegetation detected</strong><p>North-west corner · 0.4 rai</p></div>
              <Icon name="arrow" size={16} />
            </div>
          </article>
          <article className="card conditions-card">
            <div className="card-heading"><div><span className="card-kicker">FLIGHT CONDITIONS</span><h2>22 June, 09:42</h2></div><Icon name="sun" size={22} /></div>
            <div className="condition-grid">
              <div><Icon name="temperature" /><span>Temperature</span><strong>31°C</strong></div>
              <div><Icon name="wind" /><span>Wind speed</span><strong>8 km/h</strong></div>
              <div><Icon name="water" /><span>Humidity</span><strong>72%</strong></div>
              <div><Icon name="sun" /><span>Cloud cover</span><strong>18%</strong></div>
            </div>
          </article>
        </aside>
      </section>

      <section className="card recent-surveys">
        <div className="card-heading">
          <div><span className="card-kicker">ACTIVITY</span><h2>Recent surveys</h2></div>
          <button className="text-button" onClick={onHistory}>View all surveys <Icon name="arrow" size={15} /></button>
        </div>
        <SurveyRows compact />
      </section>
    </>
  );
}

const surveys = [
  { date: "22 Jun 2025", time: "09:42", field: "North Research Field", crop: "Rice · RD43", health: 84, area: "12.4 rai", status: "Complete" },
  { date: "08 Jun 2025", time: "08:18", field: "North Research Field", crop: "Rice · RD43", health: 80, area: "12.4 rai", status: "Complete" },
  { date: "25 May 2025", time: "09:06", field: "East Demo Plot", crop: "Rice · Pathum Thani 1", health: 76, area: "8.7 rai", status: "Complete" },
  { date: "11 May 2025", time: "07:54", field: "North Research Field", crop: "Rice · RD43", health: 78, area: "12.4 rai", status: "Complete" },
  { date: "27 Apr 2025", time: "10:21", field: "Orchard Block A", crop: "Mango · Nam Dok Mai", health: 91, area: "6.2 rai", status: "Complete" },
];

function SurveyRows({ compact = false }: { compact?: boolean }) {
  const rows = compact ? surveys.slice(0, 3) : surveys;
  return (
    <div className="survey-table">
      <div className="survey-table__head"><span>Survey date</span><span>Field & crop</span><span>Crop health</span><span>Area covered</span><span>Status</span><span></span></div>
      {rows.map((survey) => (
        <div className="survey-row" key={survey.date + survey.field}>
          <span className="survey-date"><b>{survey.date}</b><small>{survey.time}</small></span>
          <span className="survey-field"><i style={{ backgroundImage: `url(${fieldImage})` }}></i><span><b>{survey.field}</b><small>{survey.crop}</small></span></span>
          <span className="health-score"><i style={{ width: `${survey.health}%` }}></i><b>{survey.health}%</b></span>
          <span>{survey.area}</span>
          <span className="complete-badge"><Icon name="check" size={13} />{survey.status}</span>
          <button className="icon-button"><Icon name="more" size={17} /></button>
        </div>
      ))}
    </div>
  );
}

function HistoryView({ onCompare }: { onCompare: () => void }) {
  return (
    <>
      <section className="page-heading">
        <div><div className="eyebrow"><span>DRONE MONITORING</span><i></i><span>SAMPLE RECORDS</span></div><h1>Survey history</h1><p>Review completed flights, crop health results, and survey notes over time.</p></div>
        <Button tone="primary" icon="plus">Plan new survey</Button>
      </section>
      <section className="history-summary">
        <article><span>Completed surveys</span><strong>24</strong><small>Across 3 active fields</small></article>
        <article><span>Total area mapped</span><strong>247.8 <small>rai</small></strong><small>Since January 2025</small></article>
        <article><span>Average health trend</span><strong className="positive">+6.4%</strong><small>Over the current season</small></article>
      </section>
      <section className="card history-card">
        <div className="history-toolbar">
          <div className="search-field"><Icon name="search" size={17} /><input aria-label="Search surveys" placeholder="Search field, crop, or date" /></div>
          <div className="toolbar-filters"><SelectControl label="FIELD" value="All fields" /><SelectControl label="DATE RANGE" value="This season" /></div>
        </div>
        <SurveyRows />
        <div className="table-footer"><span>Showing 5 of 24 surveys</span><div><button disabled>Previous</button><button>Next</button></div></div>
      </section>
      <section className="history-cta">
        <div className="history-cta__icon"><Icon name="compare" /></div>
        <div><strong>See what changed between surveys</strong><p>Compare any two flights side-by-side to understand crop development.</p></div>
        <Button onClick={onCompare}>Open comparison</Button>
      </section>
    </>
  );
}

function CompareView() {
  const [split, setSplit] = useState(52);
  const [mode, setMode] = useState<"split" | "side">("split");
  return (
    <>
      <section className="page-heading compare-heading">
        <div><div className="eyebrow"><span>IMAGERY ANALYSIS</span><i></i><span>SAMPLE COMPARISON</span></div><h1>Compare field conditions</h1><p>Explore changes in vegetation health between two drone surveys.</p></div>
        <div className="segmented view-switch"><button className={mode === "split" ? "active" : ""} onClick={() => setMode("split")}><Icon name="compare" size={15} />Slider</button><button className={mode === "side" ? "active" : ""} onClick={() => setMode("side")}><Icon name="grid" size={15} />Side by side</button></div>
      </section>
      <section className="comparison-selectors">
        <SelectControl label="FIELD" value="North Research Field" />
        <div className="date-selector date-selector--before"><span>BEFORE</span><strong>08 June 2025</strong><small>Crop health 80%</small><Icon name="calendar" size={18} /></div>
        <Icon name="arrow" />
        <div className="date-selector date-selector--after"><span>AFTER</span><strong>22 June 2025</strong><small>Crop health 84%</small><Icon name="calendar" size={18} /></div>
      </section>
      <section className="card compare-card">
        <div className="compare-toolbar">
          <div><span className="card-kicker">IMAGE LAYER</span><div className="segmented"><button className="active">NDVI health</button><button>RGB</button><button>Moisture</button></div></div>
          <div className="comparison-change"><span>CHANGE DETECTED</span><strong>+4.2%</strong><small>overall crop health</small></div>
        </div>
        {mode === "split" ? (
          <div className="comparison-canvas">
            <div className="compare-image compare-image--before" style={{ backgroundImage: `url(${fieldImagePrevious})` }}></div>
            <div className="compare-image compare-image--after" style={{ backgroundImage: `url(${fieldImage})`, clipPath: `inset(0 0 0 ${split}%)` }}></div>
            <div className="ndvi-overlay"></div>
            <div className="compare-label compare-label--left"><span>BEFORE</span><strong>08 Jun 2025</strong></div>
            <div className="compare-label compare-label--right"><span>AFTER</span><strong>22 Jun 2025</strong></div>
            <div className="split-line" style={{ left: `${split}%` }}><span><Icon name="compare" size={16} /></span></div>
            <input className="split-range" aria-label="Adjust before and after image split" type="range" min="10" max="90" value={split} onChange={(event) => setSplit(Number(event.target.value))} />
            <div className="map-legend compare-legend"><span>Vegetation health</span><div className="legend-gradient"></div><div><small>Low</small><small>High</small></div></div>
          </div>
        ) : (
          <div className="side-by-side">
            <div style={{ backgroundImage: `url(${fieldImagePrevious})` }}><span>08 Jun · 80% health</span></div>
            <div style={{ backgroundImage: `url(${fieldImage})` }}><span>22 Jun · 84% health</span></div>
          </div>
        )}
      </section>
      <section className="change-grid">
        <article className="card change-summary">
          <div className="card-heading"><div><span className="card-kicker">CHANGE SUMMARY</span><h2>14-day field development</h2></div></div>
          <div className="change-bars">
            <div><span><i className="dot dot--healthy"></i>Improved</span><div><i style={{ width: "68%" }}></i></div><strong>8.4 rai</strong></div>
            <div><span><i className="dot dot--watch"></i>Unchanged</span><div><i style={{ width: "26%" }}></i></div><strong>3.2 rai</strong></div>
            <div><span><i className="dot dot--risk"></i>Declined</span><div><i style={{ width: "6%" }}></i></div><strong>0.8 rai</strong></div>
          </div>
        </article>
        <article className="card note-card">
          <span className="note-card__icon"><Icon name="note" /></span>
          <div><span className="card-kicker">SURVEY NOTE</span><h2>Growth remains consistent</h2><p>Most improvement appears in the central plots. Inspect the north-west zone for possible irrigation inconsistency.</p><button>View zone detail <Icon name="arrow" size={14} /></button></div>
        </article>
      </section>
    </>
  );
}

export default function App() {
  const [view, setView] = useState<View>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  return (
    <div className="app-shell">
      <div className={mobileMenu ? "mobile-overlay is-open" : "mobile-overlay"} onClick={() => setMobileMenu(false)}></div>
      <div className={mobileMenu ? "sidebar-wrap is-open" : "sidebar-wrap"}><Sidebar view={view} setView={(next) => { setView(next); setMobileMenu(false); }} /></div>
      <div className="main-shell">
        <Topbar onMenu={() => setMobileMenu(true)} />
        <main className="page-content">
          {view === "overview" && <Overview onCompare={() => setView("compare")} onHistory={() => setView("history")} />}
          {view === "history" && <HistoryView onCompare={() => setView("compare")} />}
          {view === "compare" && <CompareView />}
          <footer className="app-footer"><span>Mahidol Smart Farm · Drone Monitoring</span><span>Demonstration interface · Sample data only</span></footer>
        </main>
      </div>
    </div>
  );
}
