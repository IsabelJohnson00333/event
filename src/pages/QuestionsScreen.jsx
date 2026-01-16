import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function QuestionsScreen() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("session_id");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, text")
        .eq("is_active", true)
        .order("created_at");

      if (error) {
        console.error(error);
        return;
      }

      setQuestions(data);
      setLoading(false);
    };

    fetchQuestions();
  }, [sessionId, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  const question = questions[currentIndex];
  const totalSteps = questions.length;
  const stepNumber = currentIndex + 1;
  const progressPercent = Math.round((stepNumber / totalSteps) * 100);

  const submitAnswer = async (answer) => {
    // 1. Try UPDATE first
    const { error: updateError, count } = await supabase
      .from("responses")
      .update({ answer })
      .eq("session_id", sessionId)
      .eq("question_id", question.id);

    if (updateError) {
      console.error("Update failed:", updateError);
      return;
    }

    // 2. If UPDATE affected 0 rows → INSERT
    if (count === 0) {
      const { error: insertError } = await supabase
        .from("responses")
        .insert({
          session_id: sessionId,
          question_id: question.id,
          answer
        });

      if (insertError) {
        console.error("Insert failed:", insertError);
        return;
      }
    }

    // 3. Advance ONLY after persistence succeeds
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await supabase
        .from("response_sessions")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", sessionId);

      navigate("/complete");
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">corporate_fare</span>
            </div>
            <h2 className="text-[#0e191b] dark:text-white text-lg font-bold">
              BusinessInsights
            </h2>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center size-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[640px] flex flex-col gap-10">
          {/* Progress */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-primary font-bold text-sm uppercase tracking-widest">
                  Questionnaire
                </span>
                <p className="text-[#0e191b] dark:text-white text-2xl font-bold">
                  Step {stepNumber} of {totalSteps}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-500">
                {progressPercent}% Complete
              </p>
            </div>

            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-10 md:p-14 question-card-shadow border border-gray-100 dark:border-gray-800 text-center">
            <h1 className="text-[#0e191b] dark:text-white text-3xl md:text-4xl font-bold">
              {question.text}
            </h1>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => submitAnswer(true)}
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 active:scale-95"
            >
              <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <span className="text-xl font-bold">YES</span>
            </button>

            <button
              onClick={() => submitAnswer(false)}
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 active:scale-95"
            >
              <div className="size-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">close</span>
              </div>
              <span className="text-xl font-bold">NO</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}