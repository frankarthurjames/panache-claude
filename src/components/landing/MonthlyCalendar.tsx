import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const MonthlyCalendar = () => {
  const [months, setMonths] = useState<{ key: string; label: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const { data } = await supabase
          .from("events")
          .select("starts_at")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true });

        const counts: Record<string, number> = {};
        for (const e of data || []) {
          const d = new Date(e.starts_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          counts[key] = (counts[key] || 0) + 1;
        }

        const result = Object.entries(counts)
          .slice(0, 12)
          .map(([key, count]) => {
            const [year, month] = key.split("-");
            const label = capitalize(
              new Date(`${key}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
            );
            return { key, label, count };
          });

        setMonths(result);
      } catch (err) {
        console.error("Error fetching months:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonths();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </section>
    );
  }

  if (months.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Calendrier des événements</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {months.map((m, i) => (
            <a
              key={m.key}
              href={`/events?month=${m.key}`}
              className={`flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition-colors group ${
                i < months.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                {m.label}
              </span>
              <span className="font-bold text-orange-500">
                {m.count} événement{m.count > 1 ? "s" : ""}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
