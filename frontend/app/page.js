'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, CircleCheck, Heart, LayoutDashboard, NotebookPen, Smartphone, Sparkles } from 'lucide-react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { DAY_SHORT } from '@/lib/dates';

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Brand />
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
        </div>
      </nav>
      <section className="landing-hero">
        <div className="fade-in">
          <span className="badge" style={{ marginBottom: '1rem' }}><Sparkles size={12} /> Your week, beautifully planned</span>
          <h1>Plan your days in <em>pretty pink</em> <span style={{ color: 'var(--accent)' }}>✿</span></h1>
          <p>Write your weekly to-dos right under each day, track events on a lovely calendar, and see everything that matters on your personal dashboard.</p>
          <div className="ctas">
            <Link href="/register" className="btn btn-primary">Get started — it&apos;s free</Link>
            <Link href="/login" className="btn btn-outline">I have an account</Link>
          </div>
          <div className="feature-row">
            <div><NotebookPen size={16} color="var(--primary)" /> Weekly planner</div>
            <div><CalendarDays size={16} color="var(--primary)" /> Event calendar</div>
            <div><LayoutDashboard size={16} color="var(--primary)" /> Dashboard</div>
            <div><Smartphone size={16} color="var(--primary)" /> Mobile friendly</div>
          </div>
        </div>
        <div className="preview fade-in" style={{ animationDelay: '.15s' }}>
          <div className="card">
            <div className="p-day">
              {DAY_SHORT.slice(0, 4).map((d, i) => (
                <div className="p-col" key={d}>
                  <h5>{d}</h5>
                  {Array.from({ length: 4 + (i % 3) }).map((_, j) => (
                    <div className="p-line" key={j} style={{ width: `${60 + ((i * 17 + j * 23) % 40)}%`, opacity: j % 2 ? .6 : 1 }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="card floating" style={{ left: '-14px', bottom: '-22px' }}>
            <CircleCheck size={18} color="var(--success)" /> 5 tasks done today
          </div>
          <div className="card floating" style={{ right: '-6px', top: '-26px', animationDelay: '1.5s' }}>
            <Heart size={18} color="var(--primary)" fill="var(--primary)" /> Mom&apos;s birthday · Sat
          </div>
        </div>
      </section>
    </div>
  );
}
