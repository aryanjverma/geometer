import { Link, NavLink, Outlet } from 'react-router-dom';
import { GeometerAvatar } from '@/components/GeometerAvatar';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/account', label: 'Account' },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link';
}

function BrandLink({ size }: { size: number }) {
  return (
    <Link to="/dashboard" className="brand-link" aria-label="Geometer home">
      <GeometerAvatar size={size} />
      <span className="brand-link-name">Geometer</span>
    </Link>
  );
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="top-header">
        <BrandLink size={28} />
      </header>

      <nav className="side-nav" aria-label="Primary navigation">
        <BrandLink size={32} />
        <div className="side-nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
