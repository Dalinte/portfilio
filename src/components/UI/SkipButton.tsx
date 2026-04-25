import type { IntroPhase } from '../../types';

interface SkipButtonProps {
  skip: () => void;
  phase: IntroPhase;
}

export function SkipButton({ skip, phase }: SkipButtonProps) {
  if (phase === 'interactive') return null;

  return (
    <button
      className="absolute top-4 left-6 text-white/40 text-xs tracking-widest uppercase hover:text-white transition-colors pointer-events-auto"
      onClick={skip}
    >
      Skip intro →
    </button>
  );
}
