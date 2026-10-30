/**
 * The Zirka mark (copper Z, silver swoosh, star and sparkles) drawn as vector
 * shapes, so it stays sharp at header size where the 3D logo image blurred.
 * On load the Z rises, the swoosh sweeps up to the star and the star lands;
 * the sparkles then twinkle gently. Reduced-motion visitors see it still.
 * The full 3D logo (public/images/logo.png) is kept for the footer.
 */
export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 72 49" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="zk-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d2ab" />
          <stop offset="0.45" stopColor="#d08a52" />
          <stop offset="1" stopColor="#8f4c22" />
        </linearGradient>
        <linearGradient id="zk-silver" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#d9d3ca" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfc6ba" />
        </linearGradient>
      </defs>
      <g className="lm-swoosh">
        <path d="M3 30 C -2 53, 38 56, 57 17 C 38 49, 7 51, 3 30 Z" fill="url(#zk-copper)" />
        <path d="M5.5 35 C 5 50, 37 52, 54.5 22 C 37 46, 10 49, 5.5 35 Z" fill="url(#zk-silver)" />
      </g>
      <g className="lm-z">
        <path d="M12 8 H47 L25 36.5 H43 L39.5 43 H6 L28 14.5 H8.5 Z" fill="url(#zk-copper)" />
        <path d="M12 8 H47 L45.6 9.8 H11 Z" fill="#fbe3c8" opacity="0.7" />
      </g>
      <g className="lm-star">
        <path
          transform="rotate(14 60 11)"
          d="M60 2 L62.4 8.6 L69.4 8.8 L63.9 13.1 L65.9 19.8 L60 15.9 L54.1 19.8 L56.1 13.1 L50.6 8.8 L57.6 8.6 Z"
          fill="url(#zk-copper)"
        />
      </g>
      <path className="lm-spark" d="M46 1 L47 4 L50 5 L47 6 L46 9 L45 6 L42 5 L45 4 Z" fill="url(#zk-copper)" />
      <path
        className="lm-spark"
        d="M66 24 L66.8 26.4 L69.2 27.2 L66.8 28 L66 30.4 L65.2 28 L62.8 27.2 L65.2 26.4 Z"
        fill="url(#zk-copper)"
      />
      <path
        className="lm-spark"
        d="M60 31 L60.6 32.9 L62.5 33.5 L60.6 34.1 L60 36 L59.4 34.1 L57.5 33.5 L59.4 32.9 Z"
        fill="url(#zk-copper)"
      />
    </svg>
  );
}
