import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const fetchHeatmapData = async () => {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      text,
      responses (
        answer
      )
    `);

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(q => {
    const total = q.responses.length;
    const yes = q.responses.filter(r => r.answer === true).length;
    const no = total - yes;
    const ratio = total > 0 ? yes / total : 0;

    return {
      question: q.text,
      yes,
      no,
      total,
      ratio
    };
  });
};

const getHeatColor = (ratio) => {
  if (ratio >= 0.75) return "bg-green-600";
  if (ratio >= 0.5) return "bg-green-400";
  if (ratio >= 0.25) return "bg-yellow-400";
  return "bg-red-400";
};

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [questionStats, setQuestionStats] = useState([]); // New state for question statistics
  const [heatmapData, setHeatmapData] = useState([]); // New state for heatmap data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataAndStats = async () => {
      setLoading(true);
      const [sessionResponse, statsResponse, heatmapResponse] = await Promise.all([
        supabase
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
            ),
            score,
            grade
          `)
          .order("started_at", { ascending: false }),
        supabase.rpc("question_answer_stats"),
        fetchHeatmapData()
      ]);

      if (sessionResponse.error) {
        console.error("Failed to load dashboard data:", sessionResponse.error);
        setLoading(false);
        return;
      }
      setSessions(sessionResponse.data);

      if (statsResponse.error) {
        console.error("Failed to load question stats:", statsResponse.error);
        setLoading(false);
        return;
      }
      setQuestionStats(statsResponse.data);

      if (heatmapResponse && heatmapResponse.error) { // fetchHeatmapData returns array, not object with error
        console.error("Failed to load heatmap data:", heatmapResponse.error);
        setLoading(false);
        return;
      }
      setHeatmapData(heatmapResponse); // heatmapResponse is already the data array

      setLoading(false);
    };

    fetchDataAndStats();
  }, []);

  if (loading) {
    return <div className="p-10">Loading dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-background-light px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <h2 className="text-2xl font-semibold mb-4">Question Statistics</h2>
      <div className="mb-8">
        <table className="w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Question</th>
              <th className="px-4 py-2 text-center">YES</th>
              <th className="px-4 py-2 text-center">NO</th>
              <th className="px-4 py-2 text-center">YES %</th>
            </tr>
          </thead>
          <tbody>
            {questionStats.map(q => (
              <tr key={q.question} className="border-t">
                <td className="px-4 py-2">{q.question}</td>
                <td className="px-4 py-2 text-green-600 text-center">{q.yes_count}</td>
                <td className="px-4 py-2 text-red-600 text-center">{q.no_count}</td>
                <td className="px-4 py-2 text-center">
                  {q.total > 0 ? Math.round((q.yes_count / q.total) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-4">YES-Intensity Heatmap</h2>
      <div className="space-y-6 mb-8">
        {heatmapData.map((q, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border bg-white shadow-sm"
          >
            <p className="font-semibold mb-2">{q.question}</p>

            <div className="flex justify-between text-sm mb-2">
              <span>YES: {q.yes}</span>
              <span>NO: {q.no}</span>
              <span>{Math.round(q.ratio * 100)}%</span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded">
              <div
                className={`h-3 rounded ${getHeatColor(q.ratio)}`}
                style={{ width: `${q.ratio * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Session Details</h2>
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
                <p className="text-sm font-medium">
                  Score: {session.score} · {session.grade}
                </p>
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