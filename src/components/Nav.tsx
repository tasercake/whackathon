import { BoltMark } from './art';

export type Tab = 'goals' | 'crew' | 'stats';

export function Nav({ active, onNavigate }: { active: Tab; onNavigate: (t: Tab) => void }) {
  const tabs: Tab[] = ['goals', 'crew', 'stats'];
  return (
    <header className="nav">
      <div className="nav__brand">
        <div className="nav__mark">
          <BoltMark />
        </div>
        <div className="nav__word">Buzz</div>
      </div>
      <nav className="nav__links">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`nav__link${active === tab ? ' nav__link--active' : ''}`}
            aria-current={active === tab ? 'page' : undefined}
            onClick={() => onNavigate(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button className="nav__cta">Get the band</button>
      </nav>
    </header>
  );
}
