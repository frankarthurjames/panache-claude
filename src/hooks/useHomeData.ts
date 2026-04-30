import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// --- Types ---

export interface EventFilters {
  sport?: string;
  city?: string;
  date?: string;
}

// --- Fetchers ---

const fetchFeaturedEvents = async (filters?: EventFilters) => {
  let query = supabase
    .from("events")
    .select(`
      id, title, starts_at, city, region, images, capacity,
      ticket_types(price_cents),
      sports(name, slug),
      organizations(id, name, logo_url)
    `)
    .eq("status", "published")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(12);

  if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters?.date) {
    const d = new Date(filters.date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    query = query.gte("starts_at", d.toISOString()).lt("starts_at", next.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;

  // Sport filter client-side (joined relation filter unsupported server-side)
  if (filters?.sport) {
    return (data || []).filter(
      (e: any) =>
        e.sports?.slug === filters.sport ||
        e.sports?.name?.toLowerCase() === filters.sport!.toLowerCase()
    );
  }

  return data || [];
};

const fetchStats = async () => {
  const [{ count: eventsCount }, { count: orgsCount }] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("organizations")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    events: eventsCount ?? 0,
    clubs: orgsCount ?? 0,
  };
};

const fetchBetaClubs = async () => {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, logo_url, slug")
    .not("logo_url", "is", null)
    .limit(20);

  if (error) throw error;
  return data || [];
};

// --- Query Key Factory ---

export const homeKeys = {
  all: ["home"] as const,
  events: (filters?: EventFilters) => [...homeKeys.all, "events", filters] as const,
  stats: () => [...homeKeys.all, "stats"] as const,
  betaClubs: () => [...homeKeys.all, "beta-clubs"] as const,
};

// --- Individual Hooks ---

export const useHomeEvents = (filters?: EventFilters) => {
  return useQuery({
    queryKey: homeKeys.events(filters),
    queryFn: () => fetchFeaturedEvents(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useHomeStats = () => {
  return useQuery({
    queryKey: homeKeys.stats(),
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 30,
  });
};

export const useBetaClubs = () => {
  return useQuery({
    queryKey: homeKeys.betaClubs(),
    queryFn: fetchBetaClubs,
    staleTime: 1000 * 60 * 60,
  });
};

// --- Aggregated Hook ---

export const useHomeData = (filters?: EventFilters) => {
  const events = useHomeEvents(filters);
  const stats = useHomeStats();
  const betaClubs = useBetaClubs();

  return {
    events,
    stats,
    betaClubs,
    isLoading: events.isLoading || stats.isLoading,
    isError: events.isError || stats.isError,
  };
};
