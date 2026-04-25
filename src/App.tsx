import { useIntroSequence } from './hooks/useIntroSequence';
import { Scene } from './components/Scene';
import { Header } from './components/UI/Header';
import { Intro } from './components/UI/Intro';
import { SkipButton } from './components/UI/SkipButton';

export default function App() {
  const { phase, skip } = useIntroSequence();

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden">
      {/* Fullscreen 3D canvas */}
      <Scene phase={phase} />

      {/* UI overlay — pointer-events-none so OrbitControls работает через неё */}
      <div className="absolute inset-0 pointer-events-none">
        <Header />
        <SkipButton skip={skip} phase={phase} />
        <Intro phase={phase} />
      </div>
    </div>
  );
}
