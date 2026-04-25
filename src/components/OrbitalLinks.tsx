import { links } from '../data/links';
import { LinkIcon } from './LinkIcon';
import type { IntroPhase } from '../types';

interface OrbitalLinksProps {
  phase: IntroPhase;
}

export function OrbitalLinks({ phase }: OrbitalLinksProps) {
  const visible = phase === 'interactive';

  return (
    <group>
      {links.map((link) => (
        <LinkIcon key={link.id} link={link} visible={visible} />
      ))}
    </group>
  );
}
