import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const gradeMeta = {
  Poor: {
    emoji: "😞",
    color: "text-red-500"
  },
  Average: {
    emoji: "😐",
    color: "text-yellow-500"
  },
  Good: {
    emoji: "🙂",
    color: "text-blue-500"
  },
  Excellent: {
    emoji: "🔥",
    color: "text-green-600"
  }
};

export default function CompletionScreen() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      const sessionId = localStorage.getItem("session_id");
      console.log("CompletionScreen sessionId:", sessionId);

      // Moved the check to inside the fetch logic
      if (!sessionId) {
        console.log("No sessionId found");
        setResult(null); // Explicitly set result to null if no session ID
        return;
      }

      const { data, error } = await supabase
        .from("response_sessions")
        .select("score, grade")
        .eq("id", sessionId)
        .maybeSingle();

      console.log("Fetched data:", data);

      if (error) {
        console.error(error);
        setResult(null); // Explicitly set result to null on error
        return;
      }

      setResult(data); // ← THIS LINE IS REQUIRED
    };

    fetchResult();
  }, []);

  if (result === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Calculating your result…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Thank you</h1>

        <p className="mt-4 text-xl">
          Score: <strong>{result.score}</strong>
        </p>

        {result.grade && (
          <div className="mt-4 text-center">
            <div className={`text-5xl ${gradeMeta[result.grade]?.color}`}>
              {gradeMeta[result.grade]?.emoji}
            </div>
            <p className="mt-2 text-lg font-semibold">
              Grade: {result.grade}
            </p>
          </div>
        )}


      </div>
    </div>
  );
}