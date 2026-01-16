import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  const handleStart = async () => {
    let sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("session_id", sessionId);

      const { error } = await supabase
        .from("response_sessions")
        .insert({ id: sessionId });

      if (error) {
        console.error("Failed to create session", error);
        return;
      }
    }

    navigate("/questions");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-dark dark:text-slate-200 min-h-screen flex items-center justify-center overflow-hidden">
      <main className="relative z-10 w-full flex items-center justify-center px-6">
        <div className="w-full max-w-xs sm:max-w-sm">
          <button
            onClick={handleStart}
            className="group relative w-full flex items-center justify-center bg-primary text-white h-20 px-8 rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="relative z-10">Start</span>
            <span className="material-symbols-outlined ml-3 text-3xl group-hover:translate-x-1 transition-transform duration-300">
              arrow_forward
            </span>
          </button>
        </div>
      </main>

      {/* background blobs */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent-peach/10 blur-[100px]" />
      </div>
    </div>
  );
}