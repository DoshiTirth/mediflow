import { useEffect, useRef } from 'react';

export default function ECGLine({ color = '#1D9E75', height = 48, speed = 8 }) {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray  = length;
    path.style.strokeDashoffset = length;
    path.style.animation = `draw-line ${speed}s linear infinite`;
  }, [speed]);

  return (
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        d="M0,30 L60,30 L80,30 L90,10 L100,50 L110,20 L120,30
           L180,30 L200,30 L210,10 L220,50 L230,20 L240,30
           L300,30 L320,30 L330,10 L340,50 L350,20 L360,30
           L420,30 L440,30 L450,10 L460,50 L470,20 L480,30
           L540,30 L560,30 L570,10 L580,50 L590,20 L600,30
           L660,30 L680,30 L690,10 L700,50 L710,20 L720,30
           L780,30 L800,30 L810,10 L820,50 L830,20 L840,30
           L900,30 L920,30 L930,10 L940,50 L950,20 L960,30
           L1020,30 L1040,30 L1050,10 L1060,50 L1070,20 L1080,30
           L1140,30 L1160,30 L1170,10 L1180,50 L1190,20 L1200,30"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}