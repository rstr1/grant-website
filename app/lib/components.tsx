import React from 'react';

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Block({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="look-at-me opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider() {
  return <div className="border-t border-eggshell/10 my-10" />;
}
