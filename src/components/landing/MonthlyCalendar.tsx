import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const MonthlyCalendar = () => {
  const [months, setMonths] = useState<{ month: string; count: number; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const { data } = await supabase
          .from("events")
          .select("starts_at")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')
          .order("starts_at", { ascending: true });

        const countsByKey: Record<string, number> = {};
        const labelsByKey: Record<string, string> = {};

        for (const e of data || []) {
          const d = new Date(e.starts_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          countsByKey[key] = (countsByKey[key] || 0) + 1;
          if (!labelsByKey[key]) {
            labelsByKey[key] = capitalize(
              new Date(`${key}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            );
          }
        }

        const result = Object.entries(countsByKey)
          .slice(0, 12)
          .map(([slug, count]) => ({ month: labelsByKey[slug], count, slug }));

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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </section>
    );
  }

  if (months.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Calendrier des événements</h2>
        <div className="space-y-0">
          {months.map(({ month, count, slug }) => (
            <a
              key={slug}
              href={`/events?month=${slug}`}
              className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors group"
            >
              <span className="text-base font-semibold text-gray-900 capitalize group-hover:text-orange-500 transition-colors">
                {month}
              </span>
              <span className="text-base font-bold text-orange-500">
                {count} événement{count > 1 ? 's' : ''}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
