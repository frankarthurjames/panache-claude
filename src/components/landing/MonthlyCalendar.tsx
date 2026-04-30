import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const MonthlyCalendar = () => {
  const [months, setMonths] = useState<{ month: string; count: number; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          .slice(0, 8)
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
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        </div>
      </section>
    );
  }

  if (months.length === 0) return null;

  const maxCount = Math.max(...months.map(m => m.count));

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-poppins font-extrabold text-[#1A1A1A] tracking-[-0.02em] mb-8"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
          Calendrier des événements
        </h2>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
          {months.map(({ month, count, slug }, idx) => (
            <button
              key={slug}
              onClick={() => navigate(`/events?month=${slug}`)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#FFF7ED] transition-colors group ${idx < months.length - 1 ? 'border-b border-[#E8E8E8]' : ''}`}
            >
              <span className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#F97316] transition-colors w-36 shrink-0 capitalize">
                {month}
              </span>
              <div className="flex-1 h-1 bg-[#F5F4F2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F97316] rounded-full opacity-50"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="font-poppins font-bold text-sm text-[#F97316] w-8 text-right shrink-0">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
