import "./css/artist-read.css";
import { useRefreshArtistReadMutation } from "../api/profileApi";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";

// The AI's take on the artist's identity, stored on the profile.
const ArtistRead = ({ read }) => {
  const [refreshRead, { isLoading }] = useRefreshArtistReadMutation();

  return (
    <div className="artist-read">
      <div className="artist-read-header">
        <h2>Artist read</h2>
        <button className="g-fg" onClick={() => refreshRead()} disabled={isLoading}>
          {read ? "Refresh" : "Get a read"}
        </button>
      </div>
      {isLoading && <PrimarySpinner style={{ fontSize: 24, color: "var(--accent)" }} />}
      {!isLoading && !read && (
        <p className="artist-read-empty">
          Fill in your profile and drop a few bars, then get an A&amp;R-style read on your lane.
        </p>
      )}
      {!isLoading && read && (
        <div className="artist-read-body g-fg">
          <p>{read.identity}</p>
          {read.strengths?.length > 0 && (
            <ul className="artist-read-strengths">
              {read.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          )}
          {read.workOn && (
            <p className="artist-read-work-on">
              <strong>Work on:</strong> {read.workOn}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtistRead;
