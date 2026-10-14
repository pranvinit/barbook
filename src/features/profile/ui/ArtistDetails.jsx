import "./css/artist-details.css";
import { useMemo, useState } from "react";
import { useUpdateProfileMutation } from "../api/profileApi";
import TagInput from "@/components/ui/tag-input/TagInput";
import { debounce } from "@/lib/utils/debounce";

function ArtistDetails({ profile }) {
  const [statement, setStatement] = useState(profile.statement || "");
  const [updateProfile] = useUpdateProfileMutation();

  const saveStatement = useMemo(
    () => debounce((value) => updateProfile({ statement: value }), 600),
    [updateProfile]
  );

  return (
    <div className="artist-details g-bg">
      <TagInput
        id="influences"
        label="Influences"
        tags={profile.influences}
        onChange={(influences) => updateProfile({ influences })}
        placeholder="Add an artist you study"
      />
      <TagInput
        id="styles"
        label="Styles"
        tags={profile.styles}
        onChange={(styles) => updateProfile({ styles })}
        placeholder="Boom bap, drill, storytelling..."
      />
      <div className="statement-section">
        <label htmlFor="statement">Artist statement</label>
        <textarea
          id="statement"
          className="g-fg statement-textarea"
          maxLength={1000}
          value={statement}
          onChange={(e) => {
            setStatement(e.target.value);
            saveStatement(e.target.value);
          }}
          placeholder="What do you rap about, and why?"
        />
      </div>
    </div>
  );
}

export default ArtistDetails;
