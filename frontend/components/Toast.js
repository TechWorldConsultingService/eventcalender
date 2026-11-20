'use client';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function useToast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  const show = useCallback((m) => setMsg(m), []);
  const node = msg ? createPortal(<div className="toast">{msg}</div>, document.body) : null;
  return [node, show];
}
