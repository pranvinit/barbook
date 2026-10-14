import "./tag-input.css";
import { useState } from "react";

const MAX_TAGS = 20;

/**
 * Chip list with a text input. Enter or comma adds a tag, × removes one.
 */
export default function TagInput({ id, label, tags = [], onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().replace(/,$/, "");
    setInput("");
    if (!tag || tags.length >= MAX_TAGS) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...tags, tag]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="tag-input">
      <label htmlFor={id}>{label}</label>
      {tags.length > 0 && (
        <ul className="chip-container">
          {tags.map((tag) => (
            <li key={tag} className="chip g-fg">
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="text"
        className="g-fg tag-input-field"
        value={input}
        maxLength={40}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length >= MAX_TAGS ? "That's plenty" : placeholder}
        disabled={tags.length >= MAX_TAGS}
      />
    </div>
  );
}
