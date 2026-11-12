// ============================================================
// CINEPICK — <Icon /> component (lucide-react)
//
// Only the icons the app actually uses are imported here, so the
// production bundle stays small (importing the whole `icons` map
// would ship every lucide icon to every phone).
//
// To use a new icon: import it below and add it to ICONS.
//
// Usage:  <Icon name="Play" className="h-4 w-4" />
//         <Icon name="Star" className="h-3 w-3 fill-amber-300" />
// ============================================================

import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Drama,
  Eye,
  Film,
  Flame,
  Heart,
  Home,
  Info,
  LayoutGrid,
  Menu,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Rocket,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  X,
} from "lucide-react";

const ICONS = {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Drama,
  Eye,
  Film,
  Flame,
  Heart,
  Home,
  Info,
  LayoutGrid,
  Menu,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Rocket,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  X,
};

function Icon({ name, className = "", size, fill, strokeWidth, style, ...rest }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;

  return (
    <Cmp
      className={className}
      size={size}
      fill={fill}
      strokeWidth={strokeWidth}
      style={style}
      {...rest}
    />
  );
}

export { Icon };
