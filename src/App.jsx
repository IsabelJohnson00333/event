import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartScreen from "./pages/StartScreen";
import QuestionsScreen from "./pages/QuestionsScreen";
import CompletionScreen from "./pages/CompletionScreen";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/questions" element={<QuestionsScreen />} />
        <Route path="/complete" element={<CompletionScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
