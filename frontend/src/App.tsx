import { Route, Routes } from "react-router-dom";
import QuestBoard from "./pages/QuestBoard";
import MissionDetail from "./pages/MissionDetail";
import { SoundProvider } from "./lib/sound";

export default function App() {
  return (
    <SoundProvider>
      <Routes>
        <Route path="/" element={<QuestBoard />} />
        <Route path="/quest/:num" element={<MissionDetail />} />
      </Routes>
    </SoundProvider>
  );
}
