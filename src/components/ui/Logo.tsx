import { useId } from 'react';

export interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'badge' | 'mark' | 'full';
  showText?: boolean;
}

/**
 * LLDSIM Core Brand Logo
 *
 * Represents an Isometric Low-Level Design & Architectural Node:
 * - Top Face: Interface / Abstraction contract (Luminous Cyan-Sky Gradient)
 * - Left Face: State & Attributes schema slots with laser blueprint etchings
 * - Right Face: Methods & Behavior execution slots with connection ports
 * - Vertex & Spine: Relationship Nexus with UML composition diamond terminal
 */
export function Logo({
  size = 36,
  className = '',
  variant = 'badge',
  showText = false,
}: LogoProps) {
  const id = useId().replace(/:/g, '');

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 ease-out group-hover:scale-105"
      aria-label="LLDSIM Logo"
    >
      <defs>
        {/* Deep obsidian-teal tile background */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D2226" />
          <stop offset="50%" stopColor="#081518" />
          <stop offset="100%" stopColor="#040A0C" />
        </linearGradient>

        {/* Luminous rim gradient */}
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="45%" stopColor="#22C7C7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0.2" />
        </linearGradient>

        {/* Top interface plane gradient */}
        <linearGradient id={`${id}-top`} x1="11" y1="9" x2="29" y2="19.4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#22C7C7" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>

        {/* Left facet gradient */}
        <linearGradient id={`${id}-left`} x1="11" y1="14.2" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F2B30" />
          <stop offset="100%" stopColor="#061417" />
        </linearGradient>

        {/* Right facet gradient */}
        <linearGradient id={`${id}-right`} x1="29" y1="14.2" x2="20" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#13353C" />
          <stop offset="100%" stopColor="#081A1D" />
        </linearGradient>

        {/* Ambient neon drop-shadow */}
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#22C7C7" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Squircle Tile Base (in badge variant) */}
      {variant === 'badge' && (
        <>
          {/* Subtle outer glow on dark */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="9"
            fill="url(#lld-glow-blur)"
            opacity="0.3"
          />
          <rect
            x="1.5"
            y="1.5"
            width="37"
            height="37"
            rx="9.5"
            fill={`url(#${id}-bg)`}
            stroke={`url(#${id}-rim)`}
            strokeWidth="1.2"
          />
        </>
      )}

      {/* Architectural Node Group */}
      <g filter={`url(#${id}-glow)`}>
        {/* Left Facet (State & Attributes) */}
        <path
          d="M 11 14.2 L 20 19.4 L 20 30 L 11 24.8 Z"
          fill={`url(#${id}-left)`}
          stroke="#22C7C7"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Left facet blueprint slots */}
        <path
          d="M 13.5 18 L 17.5 20.3"
          stroke="#22C7C7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M 13.5 21.2 L 16.5 23"
          stroke="#22C7C7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />

        {/* Right Facet (Methods & Behavior) */}
        <path
          d="M 20 19.4 L 29 14.2 L 29 24.8 L 20 30 Z"
          fill={`url(#${id}-right)`}
          stroke="#38BDF8"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Right facet execution slots */}
        <path
          d="M 22.5 20.3 L 26.5 18"
          stroke="#38BDF8"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M 22.5 23 L 25.5 21.2"
          stroke="#38BDF8"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />

        {/* Center Vertical Spine */}
        <line
          x1="20"
          y1="19.4"
          x2="20"
          y2="29.5"
          stroke="#22C7C7"
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />

        {/* Top Interface Plane (Glossy Neon Cyan) */}
        <path
          d="M 20 9 L 29 14.2 L 20 19.4 L 11 14.2 Z"
          fill={`url(#${id}-top)`}
          stroke="#E0F2FE"
          strokeWidth="0.6"
          strokeOpacity="0.8"
        />

        {/* Interface chevron / contract symbol on top facet */}
        <path
          d="M 17 14.2 L 20 12.4 L 23 14.2 L 20 16 Z"
          fill="#04292B"
          fillOpacity="0.3"
          stroke="#04292B"
          strokeWidth="0.7"
        />

        {/* Connection Ports on Facet Vertices */}
        <circle cx="11" cy="14.2" r="1.3" fill="#38BDF8" />
        <circle cx="29" cy="14.2" r="1.3" fill="#22C7C7" />

        {/* Center Nexus Node (White Hot Core + Cyan Aura) */}
        <circle cx="20" cy="19.4" r="2.6" fill="#22C7C7" fillOpacity="0.35" />
        <circle cx="20" cy="19.4" r="1.3" fill="#FFFFFF" />

        {/* UML Relationship Terminal (Diamond Socket at base) */}
        <path
          d="M 20 28 L 21.6 29.8 L 20 31.6 L 18.4 29.8 Z"
          fill="#38BDF8"
          stroke="#081518"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );

  if (variant === 'full' || showText) {
    return (
      <div className={`group flex items-center gap-3 select-none ${className}`}>
        {icon}
        <div className="flex flex-col leading-tight items-start">
          <span className="text-[17px] font-semibold text-text tracking-tight group-hover:text-white transition-colors">
            LLDSIM
          </span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-text-muted uppercase">
            LLD Studio
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group inline-flex items-center justify-center select-none ${className}`}>
      {icon}
    </div>
  );
}

export default Logo;
