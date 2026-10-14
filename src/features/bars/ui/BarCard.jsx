import { useState, useRef, useEffect, forwardRef } from "react";
import "./css/bar-card.css";
import { useDispatch } from "react-redux";
import { useDeleteBarMutation } from "../api/barsApi";
import { setActiveBar } from "../model/barsSlice";
import ScoreBreakdown from "./ScoreBreakdown";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

const BarCard = forwardRef(({ bar, isSelected = false, hasActions = false }, ref) => {
  const dispatch = useDispatch();
  const [deleteBar, { isLoading: isDeleting }] = useDeleteBarMutation();

  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isExpanded
        ? contentRef.current.scrollHeight + "px"
        : "0px";
    }
  }, [isExpanded]);

  const handleEdit = () => {
    window.scrollTo({ top: document.body.scrollHeight });
    dispatch(setActiveBar({ id: bar.id, text: bar.text }));
  };

  return (
    <li ref={ref} data-selected={isSelected} className="bar-card g-fg">
      <div className="bar-header">
        <p className="bar-text">
          <span className="bar-text-line">{bar.text}</span>
        </p>
        <div className="bar-icons g-fg-color">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Hide score" : "Show score"}
          >
            {isExpanded ? <ExpandLessRoundedIcon /> : <AutoAwesomeRoundedIcon />}
          </button>
        </div>
      </div>
      <small>
        {new Date(bar.created_at).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        {bar.overall != null && (
          <span className="score-sticker" title="Overall score, out of 10">
            {bar.overall}/10
          </span>
        )}
      </small>
      <div ref={contentRef} className="judgement-content">
        <div className="judgement-inner">
          <ScoreBreakdown scores={bar.scores} />
          {bar.feedback && <p className="bar-feedback">{bar.feedback}</p>}
        </div>
      </div>
      {hasActions && (
        <div className="bar-actions">
          <button
            className={`action-button ${!isSelected ? "g-fg" : "g-fg-color"}`}
            onClick={handleEdit}
            disabled={isDeleting}
            aria-label="Edit bar"
          >
            <EditRoundedIcon fontSize="small" />
          </button>
          <button
            className="action-button g-fg"
            onClick={() => deleteBar(bar.id)}
            disabled={isDeleting}
            aria-label="Delete bar"
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </button>
        </div>
      )}
    </li>
  );
});

BarCard.displayName = "BarCard";

export default BarCard;
