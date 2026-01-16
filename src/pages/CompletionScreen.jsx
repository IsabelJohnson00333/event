import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CompletionScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // prevent direct access without a session
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center flex flex-col items-center gap-6">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl">
            check_circle
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-white">
          Thank you!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          We appreciate you taking the time to answer these questions.
          Your responses have been recorded successfully.
        </p>

        <p className="text-sm text-gray-400">
          You may now close this page.
        </p>
      </div>
    </div>
  );
}