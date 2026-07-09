"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const PAGE_SIZE = 10;

// Progressively reveals `items` 10 at a time as the user scrolls a
// container near its bottom, instead of rendering the whole array at once.
// The full array is still fetched/filtered server- or client-side as
// before (search, status filters, and Excel export all keep working
// against the complete data) — this only limits how many rows get painted
// into the DOM up front.
export function useInfiniteReveal<T>(
  items: T[],
  containerRef: RefObject<HTMLElement | null>,
) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevItems, setPrevItems] = useState(items);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset back to the first page whenever the underlying item set changes
  // (new search term, filter, or freshly loaded data) — adjusted during
  // render rather than via an effect, so it never flashes a stale, overlong
  // list before snapping back to 10.
  if (items !== prevItems) {
    setPrevItems(items);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = containerRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, items.length));
        }
      },
      { root, rootMargin: "150px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length, containerRef]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    sentinelRef,
  };
}
