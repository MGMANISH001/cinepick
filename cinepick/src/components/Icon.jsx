// ============================================================
// CINEPICK — <Icon /> component (lucide-react)
//
// Renders the same lucide icons the original project used, now via
// the lucide-react npm package (tree-shaken in the build). The
// `icons` export maps PascalCase names ("Play", "Star", "Film", ...)
// to ready-made React components, so the existing
// <Icon name="..." /> usage keeps working unchanged.
//
// Usage:  <Icon name="Play" className="h-4 w-4" />
//         <Icon name="Star" className="h-3 w-3 fill-amber-300" />
// ============================================================

import { icons } from "lucide-react";

function Icon({ name, className = "", size, fill, strokeWidth, style, ...rest }) {
  const Cmp = icons[name];
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
