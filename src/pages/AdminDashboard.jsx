import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("response_sessions")
        .select(`
          id,
          started_at,
          completed_at,
          responses (
            answer,
            answered_at,
            questions (
              text
            )
          )
        `)
        .order("started_at", { ascending: false });

      if (error) {
        console.error("Failed to load dashboard data:", error);
        return;
      }

      setSessions(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10">Loading dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-background-light px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="space-y-8">
        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-white border rounded-xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-500">Session ID</p>
                <p className="font-mono text-sm">{session.id}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.completed_at
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {session.completed_at ? "Completed" : "In Progress"}
              </span>
            </div>

            <div className="space-y-3">
              {session.responses.map((res, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b pb-2 text-sm"
                >
                  <span className="text-gray-700">
                    {res.questions.text}
                  </span>
                  <span
                    className={`font-semibold ${
                      res.answer ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {res.answer ? "YES" : "NO"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}