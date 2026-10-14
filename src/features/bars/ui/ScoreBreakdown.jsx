import "./css/score-breakdown.css";

const CRITERIA = [
  ["rhyme", "Rhyme"],
  ["flow", "Flow"],
  ["wordplay", "Wordplay"],
  ["punch", "Punch"],
  ["originality", "Originality"],
];

export default function ScoreBreakdown({ scores }) {
  if (!scores) return null;

  return (
    <ul className="score-breakdown">
      {CRITERIA.map(([key, label]) => (
        <li key={key}>
          <span>{label}</span>
          <span className="score-track" aria-hidden="true">
            <span className="score-fill" style={{ width: `${(scores[key] ?? 0) * 10}%` }} />
          </span>
          <strong>{scores[key] ?? "-"}</strong>
        </li>
      ))}
    </ul>
  );
}
