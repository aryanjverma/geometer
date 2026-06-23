interface GeometerAvatarProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * The Geometer tutor mascot, assembled from geometric primitives:
 * a rounded-rectangle face, two circle eyes, and a right-triangle smile.
 */
export function GeometerAvatar({ size = 64, className, title = 'Geometer' }: GeometerAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      {/* Face */}
      <rect
        x="6"
        y="8"
        width="52"
        height="48"
        rx="10"
        fill="rgba(99, 102, 241, 0.12)"
        stroke="#6366f1"
        strokeWidth="2.5"
      />

      {/* Eyes */}
      <circle cx="24" cy="27" r="4" fill="#6366f1" />
      <circle cx="40" cy="27" r="4" fill="#6366f1" />

      {/* Isosceles right-triangle smile: horizontal hypotenuse on top,
          right angle at the bottom apex pointing down */}
      <polygon
        points="22,38 42,38 32,48"
        fill="rgba(99, 102, 241, 0.18)"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
