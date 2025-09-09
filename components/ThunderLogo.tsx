"use client";

import * as React from "react";
import { useId } from "react";

export interface ThunderLogoProps {
  size?: number;
  primary?: string; // outer ring / gradient start
  secondary?: string; // outer ring / gradient end
  accent?: string; // bolt fill (default white)
  stroke?: string;
  className?: string;
  ariaLabel?: string;
}

export interface ThunderLoaderProps {
  size?: number;
  speed?: number;
  primary?: string;
  secondary?: string;
  className?: string;
  ariaHidden?: boolean;
}

export function ThunderLogo({
  size = 72,
  primary = "#00CFE8",
  secondary = "#00A3BF",
  accent = "#ffffff",
  stroke = "rgba(0,0,0,0.06)",
  className = "",
  ariaLabel = "ThunderTyping logo",
}: ThunderLogoProps): React.ReactElement {
  // NOTE: This component uses no useId because it's safe as a single static logo.
  // If you plan to mount many instances simultaneously and use defs, use a unique-id variant.
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <filter id="glow_static" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="46"
        fill="url(#g1)"
        filter="url(#glow_static)"
      />

      <path
        d="M58 20 L40 44 L52 44 L36 80 L64 46 L50 46 Z"
        fill={accent}
        transform="translate(0,2)"
      />

      <path
        d="M58 20 L40 44 L52 44 L36 80 L64 46 L50 46 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        opacity="0.18"
        transform="translate(0,2)"
      />
    </svg>
  );
}

export function ThunderLoader({
  size = 64,
  speed = 1.0,
  primary = "#00CFE8",
  secondary = "#00A3BF",
  className = "",
  ariaHidden = true,
}: ThunderLoaderProps): React.ReactElement {
  const id = useId().replace(/[:.]/g, "_");
  const gradId = `lg2_${id}`;
  const ringDuration = 1.4 / Math.max(0.1, speed);
  const boltDuration = 0.9 / Math.max(0.1, speed);

  return (
    <div
      className={`thunder-loader inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={ariaHidden}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-hidden={ariaHidden}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="1">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        </defs>

        {/* pulsing ring */}
        <g>
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="3"
            className="tt-ring"
            style={{ animationDuration: `${ringDuration}s` }}
          />
          <circle cx="50" cy="50" r="22" fill="#0b1220" opacity="0.06" />
        </g>

        {/* animated bolt */}
        <g className="tt-bolt" style={{ transformOrigin: "50% 35%" }}>
          <path
            d="M58 18 L40 42 L52 42 L36 78 L64 44 L50 44 Z"
            fill={`url(#${gradId})`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.8"
            style={{ animationDuration: `${boltDuration}s` }}
          />
        </g>
      </svg>

      <style>{`
        .thunder-loader { display: inline-block; }

        @keyframes tt-ring-pulse {
          0% { transform: scale(0.92); opacity: 0.98; }
          50% { transform: scale(1.11); opacity: 0.55; }
          100% { transform: scale(0.92); opacity: 0.98; }
        }

        .tt-ring {
          transform-origin: 50% 50%;
          animation-name: tt-ring-pulse;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(.2,.9,.3,.9);
        }

        @keyframes tt-bolt-drop {
          0% { transform: translateY(-14px) scale(0.92) rotate(-5deg); opacity: 0; }
          30% { transform: translateY(6px) scale(1.06) rotate(2deg); opacity: 1; }
          60% { transform: translateY(-2px) scale(1) rotate(-1.6deg); opacity: 1; }
          100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
        }

        .tt-bolt {
          animation-name: tt-bolt-drop;
          animation-fill-mode: both;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(.2,.8,.2,1);
        }

        @media (prefers-reduced-motion: reduce) {
          .tt-ring, .tt-bolt { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
