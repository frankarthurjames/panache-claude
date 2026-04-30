import { useEffect } from "react";

export const useReveal = (delay = 100) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
      );
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
};
