import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time messaging',
    desc: 'Sub-100ms delivery via STOMP WebSocket. Messages arrive before you blink.',
  },
  {
    icon: '🔒',
    title: 'Secure by default',
    desc: 'Spring Security session-based auth. Every request is credentialed and protected.',
  },
  {
    icon: '🌐',
    title: 'Group & private chats',
    desc: 'Broadcast to the global room or slip into a private thread with anyone.',
  },
  {
    icon: '📎',
    title: 'File attachments',
    desc: 'Drop images, PDFs, and documents right into the conversation.',
  },
  {
    icon: '👤',
    title: 'Rich profiles',
    desc: 'Custom nicknames and profile pictures. Find anyone by searching their handle.',
  },
  {
    icon: '📱',
    title: 'Responsive layout',
    desc: 'Collapsible sidebar, fluid chat pane. Works beautifully on any screen.',
  },
];

const DEMO_MESSAGES = [
  { id: 1, sender: 'ada', text: 'Hey, just pushed the new build 🚀', mine: false, delay: 0 },
  { id: 2, sender: 'you', text: 'Looks solid! The latency is insane', mine: true, delay: 600 },
  { id: 3, sender: 'ada', text: 'Under 80ms end-to-end 😎', mine: false, delay: 1300 },
  { id: 4, sender: 'you', text: 'Ship it', mine: true, delay: 2000 },
];

function DemoChat() {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    DEMO_MESSAGES.forEach((m) => {
      setTimeout(() => setVisible((v) => [...v, m.id]), m.delay + 400);
    });
  }, []);

  return (
    <div className="demo-chat">
      <div className="demo-header">
        <span className="demo-dot red" />
        <span className="demo-dot yellow" />
        <span className="demo-dot green" />
        <span className="demo-title">Global Chat · 3 online</span>
        <span className="demo-status-dot" />
      </div>
      <div className="demo-body">
        {DEMO_MESSAGES.map((m) => (
          <div
            key={m.id}
            className={`demo-bubble ${m.mine ? 'demo-mine' : 'demo-theirs'} ${visible.includes(m.id) ? 'demo-visible' : ''
              }`}
          >
            {!m.mine && <span className="demo-sender">{m.sender}</span>}
            <span className="demo-text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="demo-input-row">
        <span className="demo-input-fake">Write a message…</span>
        <span className="demo-send-fake">➤</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, index }: typeof FEATURES[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`feature-card ${inView ? 'in-view' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span className="feature-icon">{icon}</span>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax tilt on hero demo
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * -8;
      const ry = ((e.clientX - cx) / rect.width) * 8;
      el!.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    function onLeave() { el!.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; }
    window.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="home">
      {/* ── Nav ── */}
      <nav className="home-nav">
        <div className="nav-logo">
          <span className="nav-logo-icon">💬</span>
          <span className="nav-logo-text">Nexus<span className="nav-logo-accent">Chat</span></span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Sign in</Link>
          <Link to="/register" className="nav-cta">Get started →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Real-time · WebSocket · Spring Boot
          </div>
          <h1 className="hero-title">
            Conversations at
            <br />
            <span className="hero-gradient">the speed of thought</span>
          </h1>
          <p className="hero-sub">
            A Telegram-grade chat platform built on Spring WebSocket and React.
            Private DMs, group rooms, file sharing — all wired live.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="hero-btn-primary">
              Start chatting free
            </Link>
            <Link to="/login" className="hero-btn-ghost">
              I have an account
            </Link>
          </div>
        </div>

        <div className="hero-visual" ref={heroRef}>
          <DemoChat />
          <div className="hero-glow" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        <div className="section-label">What's inside</div>
        <h2 className="section-title">Everything you need, nothing you don't</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="cta-strip">
        <div className="cta-strip-glow" />
        <h2 className="cta-title">Ready to connect?</h2>
        <p className="cta-sub">Create your account in seconds. No credit card, no fluff.</p>
        <Link to="/register" className="hero-btn-primary cta-btn">
          Create free account →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <span className="nav-logo-icon">💬</span>
        <span className="footer-copy">NexusChat — built with Spring Boot &amp; React</span>
      </footer>
    </div>
  );
}
