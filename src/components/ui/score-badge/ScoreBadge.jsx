import "./score-badge.css";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";

function ScoreBadge({ isLoading = false, isError = false, label = "Score", score }) {
  return (
    <div className="score-badge-section g-bg">
      <p>{label}</p>
      {isLoading && <PrimarySpinner style={{ fontSize: 24, color: "var(--accent)" }} />}
      {isError && <p>Error loading.</p>}
      {!isLoading && !isError && score != null && (
        <div className="score-badge g-fg">
          <strong>{score}</strong>
        </div>
      )}
    </div>
  );
}

export default ScoreBadge;
