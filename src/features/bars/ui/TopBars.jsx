import "./css/top-bars.css";
import { useGetBarStatsQuery, useGetTopBarsQuery } from "../api/barsApi";
import { useSession } from "@/features/auth/useSession";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";
import ScoreBadge from "@/components/ui/score-badge/ScoreBadge";
import BarCard from "./BarCard";

export default function TopBars() {
  const { user } = useSession();
  const { data: topBars = [], isLoading, isFetching, isError } = useGetTopBarsQuery(undefined, {
    skip: !user,
  });
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetBarStatsQuery(undefined, { skip: !user });

  return (
    <div className="top-bars g-bg">
      <div className="top-bars-header">
        <h2>Hall of fame</h2>
        <ScoreBadge
          isLoading={isStatsLoading}
          isError={isStatsError}
          score={stats?.average}
          label="Avg score"
        />
      </div>
      {(isLoading || isFetching) && (
        <PrimarySpinner
          style={{ fontSize: 24, color: "var(--accent)", marginTop: "var(--spacing-md)" }}
        />
      )}
      {isError && <p>Couldn't load your top bars.</p>}
      {topBars.length > 0 && (
        <ul className="top-bar-list">
          {topBars.map((bar) => (
            <BarCard key={bar.id} bar={bar} />
          ))}
        </ul>
      )}
      {topBars.length === 0 && !isLoading && !isFetching && !isError && (
        <p>Your best bars will show up here.</p>
      )}
    </div>
  );
}
