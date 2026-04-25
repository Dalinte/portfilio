import { useReducer, useEffect, useRef } from 'react';
import type { IntroPhase } from '../types';

type Action = { type: 'SET_PHASE'; phase: IntroPhase };

function reducer(_: IntroPhase, action: Action): IntroPhase {
  return action.phase;
}

// Тайминги перехода между фазами в миллисекундах от старта
const TIMINGS: Array<[number, IntroPhase]> = [
  [1000, 'ufo_arriving'],
  [3000, 'beam_on'],
  [4000, 'spawning'],
  [5500, 'ufo_leaving'],
  [7000, 'interactive'],
];

export function useIntroSequence(): { phase: IntroPhase; skip: () => void } {
  const [phase, dispatch] = useReducer(reducer, 'idle' as IntroPhase);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current = TIMINGS.map(([ms, p]) =>
      setTimeout(() => dispatch({ type: 'SET_PHASE', phase: p }), ms)
    );
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const skip = () => {
    timersRef.current.forEach(clearTimeout);
    dispatch({ type: 'SET_PHASE', phase: 'interactive' });
  };

  return { phase, skip };
}
