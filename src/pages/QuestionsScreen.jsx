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
    const { error } = await supabase
      .from("responses")
      .upsert(
        {
          session_id: sessionId,
          question_id: question.id,
          answer,
        },
        { onConflict: "session_id,question_id" }
      );

    if (error) {
      console.error("Upsert failed:", error);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await finalizeSession();
      navigate("/complete");
    }
  };

  const finalizeSession = async () => {
    // 1. Get total questions
    const { count: totalQuestions } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // 2. Sum YES answers
    const { data: responses } = await supabase
      .from("responses")
      .select("answer")
      .eq("session_id", sessionId);

    const score = responses.reduce(
      (sum, r) => sum + (r.answer ? 1 : 0),
      0
    );

    const percentage = totalQuestions > 0 ? score / totalQuestions : 0;

    // ✅ DEFAULT GRADE (THIS WAS MISSING)
    let grade = "Poor";

    if (percentage >= 0.75) grade = "Excellent";
    else if (percentage >= 0.5) grade = "Good";
    else if (percentage >= 0.25) grade = "Average";

    // 3. Save score + grade
    const { error: updateSessionError } = await supabase
      .from("response_sessions")
      .update({
        score,
        grade,
        completed_at: new Date().toISOString()
      })
      .eq("id", sessionId);

    if (updateSessionError) {
      console.error("Error updating session in finalizeSession:", updateSessionError);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col transition-colors duration-300">
      

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => navigate("/")}
          className="fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-gray-600 active:scale-95"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
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
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-10 question-card-shadow border border-gray-100 dark:border-gray-800 text-center">
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