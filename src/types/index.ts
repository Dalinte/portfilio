export type IntroPhase =
  | 'idle'
  | 'ufo_arriving'
  | 'beam_on'
  | 'spawning'
  | 'ufo_leaving'
  | 'interactive';

export interface LinkData {
  id: string;
  name: string;
  url: string;
  emoji: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  orbitY: number;
}
