"use client";

import { useEffect, useState } from "react";
import "./scribble-loader.css";

const CAPTIONS = [
  "Sharpening the pencil…",
  "Counting syllables…",
  "Finding the pocket…",
  "Checking the rhyme scheme…",
];

const ROTATE_MS = 1800;

function ScribbleLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return undefined;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CAPTIONS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="scribble-loader" role="status" aria-live="polite">
      <svg
        className="scribble-loader-svg"
        viewBox="0 0 240 120"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          className="scribble-highlight"
          x="28"
          y="70"
          width="184"
          height="18"
          rx="4"
        />
        <path
          className="scribble-stroke"
          pathLength="1"
          d="M24 92 C 60 82, 92 100, 128 90 S 196 80, 218 94 M 50 40 C 70 22, 96 58, 118 36 S 160 24, 186 44 C 196 52, 170 60, 150 50"
        />
      </svg>
      <p className="scribble-caption">{CAPTIONS[index]}</p>
    </div>
  );
}

export default ScribbleLoader;
