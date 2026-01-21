import { useState } from 'react';
import CountrySelection from './components/CountrySelection';
import GameInterface from './components/GameInterface';
import { Difficulty } from './types/game';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('STABLE');
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const handleGameStart = (countryCode: string, difficulty: Difficulty, year: number) => {
    setSelectedCountry(countryCode);
    setSelectedDifficulty(difficulty);
    setSelectedYear(year);
    setGameStarted(true);
  };

  const handleExit = () => {
    setGameStarted(false);
    setSelectedCountry('');
  };

  if (!gameStarted) {
    return <CountrySelection onGameStart={handleGameStart} />;
  }

  return (
    <GameInterface
      initialCountry={selectedCountry}
      difficulty={selectedDifficulty}
      year={selectedYear}
      onExit={handleExit}
    />
  );
}

export default App;
