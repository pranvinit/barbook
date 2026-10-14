"use client";
import "./css/bar-history.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useSession } from "@/features/auth/useSession";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";
import { useGetBarsQuery } from "../api/barsApi";
import { selectActiveBar } from "../model/barsSlice";
import BarCard from "./BarCard";

const BarHistory = () => {
  const { user } = useSession();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetBarsQuery(page, {
    skip: !user,
  });
  const bars = data?.bars ?? [];
  const hasMore = data?.hasMore ?? false;

  const activeBar = useSelector(selectActiveBar);

  const lastElementRef = useInfiniteScroll({
    isFetching,
    hasMore,
    onLoadMore: () => setPage((prevPage) => prevPage + 1),
  });

  return (
    <div className="bar-history g-bg">
      <h2>Your bars</h2>
      {isError && <p>Couldn't load your bars. Try again later.</p>}
      <ul className="bar-history-list">
        {bars.map((bar, index) => (
          <BarCard
            key={bar.id}
            ref={index === bars.length - 1 ? lastElementRef : null}
            bar={bar}
            isSelected={activeBar?.id === bar.id}
            hasActions
          />
        ))}
      </ul>
      {isFetching && (
        <PrimarySpinner
          style={{ fontSize: 24, color: "var(--accent)", marginTop: "var(--spacing-md)" }}
        />
      )}
      {!isLoading && !isError && bars.length === 0 && (
        <p>No bars yet. Write your first one below.</p>
      )}
    </div>
  );
};

export default BarHistory;
