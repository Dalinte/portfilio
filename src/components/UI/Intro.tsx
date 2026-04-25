import type { IntroPhase } from '../../types';

interface IntroProps {
  phase: IntroPhase;
}

export function Intro({ phase }: IntroProps) {
  const visible = phase === 'interactive';

  return (
    <>
      <div
        className={`absolute bottom-12 right-8 text-right transition-opacity duration-1000 select-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white/40 text-xs tracking-widest uppercase mb-2">
          Hi, I&apos;m
        </p>
        <p className="text-white text-4xl font-bold tracking-tight">
          Your Name
        </p>
        <p className="text-white/50 text-sm mt-1">
          Frontend Developer &amp; 3D Enthusiast
        </p>
      </div>

      {visible && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-widest uppercase select-none">
          Drag to rotate
        </div>
      )}
    </>
  );
}
