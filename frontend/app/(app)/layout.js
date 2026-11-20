'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CalendarDays, LayoutDashboard, ListTodo, LogOut, NotebookPen } from 'lucide-react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { greeting } from '@/lib/dates';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { href: '/week', label: 'Weekly Planner', short: 'Week', icon: NotebookPen },
  { href: '/calendar', label: 'Calendar', short: 'Calendar', icon: CalendarDays },
  { href: '/events', label: 'Events', short: 'Events', icon: ListTodo },
];

export default function AppLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);

  if (loading || !user) return <div className="spinner" style={{ marginTop: '40vh' }} />;

    const name = user.first_name || user.username;

  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand />
        <nav className="nav">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? 'active' : ''}>
              <Icon size={19} /> {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{name[0]}</div>
            <div className="meta"><b>{name}</b><span>{user.email}</span></div>
            <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="page-title">
            <div className="greet">{greeting()}, {name} 🌸</div>
            <h2>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          </div>
          <div className="mobile-brand"><Brand small /></div>
          <div className="topbar-right">
            <ThemeToggle />
            <div className="avatar" title={name} style={{ width: 34, height: 34, fontSize: '.85rem' }}>{name[0]}</div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ href, short, icon: Icon }) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? 'active' : ''}>
            <Icon size={21} /> {short}
          </Link>
        ))}
        <button onClick={logout} aria-label="Log out"><LogOut size={21} /> Logout</button>
      </nav>
    </div>
  );
}
