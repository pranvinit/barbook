import "./css/ghostwriter.css";
import { useDispatch } from "react-redux";
import { useGhostwriteMutation } from "../api/ghostwriterApi";
import { setActiveBar } from "@/features/bars/model/barsSlice";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";

// Shared cache key so suggestions survive switching tabs.
const CACHE_KEY = "ghostwriter";

export default function GhostwriterPanel() {
  const dispatch = useDispatch();
  const [ghostwrite, { data, isLoading, isError }] = useGhostwriteMutation({
    fixedCacheKey: CACHE_KEY,
  });
  const continuations = data?.continuations ?? [];

  const handlePick = (text) => {
    dispatch(setActiveBar({ id: null, text }));
    window.scrollTo({ top: document.body.scrollHeight });
  };

  return (
    <div className="ghostwriter g-bg">
      <div className="ghostwriter-header">
        <h2>Ghostwriter</h2>
        <button className="g-fg" onClick={() => ghostwrite()} disabled={isLoading}>
          {continuations.length ? "Try again" : "Get unstuck"}
        </button>
      </div>
      <p className="ghostwriter-hint">
        Picks up from your latest bars and writes three next lines in your style.
        Tap one to edit it.
      </p>
      {isLoading && (
        <PrimarySpinner
          style={{ fontSize: 24, color: "var(--accent)", marginTop: "var(--spacing-md)" }}
        />
      )}
      {isError && <p>The ghostwriter is stuck too. Try again.</p>}
      {!isLoading && continuations.length > 0 && (
        <ul className="ghostwriter-list">
          {continuations.map((item, i) => (
            <li key={i} className="g-fg">
              <button onClick={() => handlePick(item.text)}>
                <p className="bar-text">{item.text}</p>
                <span className="technique" data-technique={item.technique}>
                  {item.technique}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
