import Link from "next/link";
import "./landing.css";

export const metadata = {
  title: { absolute: "Barbook — AI notebook for rap bars" },
  description:
    "Write bars, get them scored on rhyme, flow, wordplay, punch and originality, map your rhyme scheme and get ghostwriter lines when you're stuck.",
};

const RUBRIC = [
  { label: "Rhyme", score: 9.1 },
  { label: "Flow", score: 8.0 },
  { label: "Wordplay", score: 8.7 },
  { label: "Punch", score: 8.2 },
  { label: "Originality", score: 7.9 },
];

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">
            Write bars. Get scored. Break the block.
          </h1>
          <p className="hero-subhead">
            Barbook is an AI notebook for rap lyrics. Draft your bars, see your
            rhyme scheme light up, and get honest scores to sharpen the next
            line.
          </p>
          <div className="hero-actions">
            <Link href="/notebook" className="cta-sticker">
              Open your notebook
            </Link>
            <Link href="/login" className="cta-secondary">
              Sign in
            </Link>
          </div>
        </div>

        <figure className="notebook-card" aria-label="Sample bar with rhyme groups highlighted">
          <div className="notebook-margin" aria-hidden="true" />
          <div className="notebook-lines">
            <p className="bar-text">
              Pen in my{" "}
              <mark className="rhyme rhyme-a">hand</mark>, every bar I&apos;ve{" "}
              <mark className="rhyme rhyme-a">planned</mark>
            </p>
            <p className="bar-text">
              <mark className="rhyme rhyme-b">Ink</mark> on the margin, I{" "}
              <mark className="rhyme rhyme-b">think</mark> while I{" "}
              <mark className="rhyme rhyme-a">stand</mark>
            </p>
          </div>

          <div className="sticker-score" aria-label="Overall score 8.4 out of 10">
            <span className="sticker-score-label">Score</span>
            <span className="sticker-score-value">8.4</span>
          </div>

          <ul className="rubric" aria-label="Rubric breakdown">
            {RUBRIC.map((item) => (
              <li key={item.label} className="rubric-row">
                <span className="rubric-label">{item.label}</span>
                <span className="rubric-track" aria-hidden="true">
                  <span
                    className="rubric-fill"
                    style={{ width: `${item.score * 10}%` }}
                  />
                </span>
                <span className="rubric-value">{item.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </figure>
      </section>

      <section className="features" aria-labelledby="features-title">
        <h2 id="features-title" className="section-title">
          What&apos;s inside
        </h2>
        <div className="feature-grid">
          <article className="feature-card g-bg">
            <h3 className="feature-title">Rhyme maps</h3>
            <p>
              Every rhyme group gets its own highlighter colour, so you can see
              your scheme at a glance and spot where it drifts.
            </p>
          </article>
          <article className="feature-card g-bg">
            <h3 className="feature-title">Rubric scores</h3>
            <p>
              Each bar is scored on rhyme, flow, wordplay, punch and
              originality, with one line of coaching on what to fix next.
            </p>
          </article>
          <article className="feature-card g-bg">
            <h3 className="feature-title">Ghostwriter</h3>
            <p>
              Stuck? Get three possible next lines written in your own style,
              then keep the one that fits and make it yours.
            </p>
          </article>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built with Next.js, Redux Toolkit, Supabase and Gemini.</p>
      </footer>
    </main>
  );
}
