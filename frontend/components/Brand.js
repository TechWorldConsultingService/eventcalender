import { CalendarHeart } from 'lucide-react';

export default function Brand({ small }) {
  return (
    <div className="brand" style={small ? { fontSize: '1.15rem' } : undefined}>
      <span className="brand-mark"><CalendarHeart size={small ? 18 : 20} /></span>
      Blush Planner
    </div>
  );
}
