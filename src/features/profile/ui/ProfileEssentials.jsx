import "./css/profile-essentials.css";
import { useMemo, useRef, useState } from "react";
import { useUploadAvatarMutation, useUpdateProfileMutation } from "../api/profileApi";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";
import { debounce } from "@/lib/utils/debounce";

const HANDLE_PATTERN = /^[a-z0-9_]{3,24}$/;

function ProfileEssentials({ profile }) {
  const fileInputRef = useRef(null);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [handle, setHandle] = useState(profile.handle || "");

  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const saveLater = useMemo(
    () => debounce((fields) => updateProfile(fields), 600),
    [updateProfile]
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file?.type.startsWith("image/")) uploadAvatar(file);
    e.target.value = "";
  };

  const handleNameChange = (e) => {
    setDisplayName(e.target.value);
    if (e.target.value.trim()) saveLater({ display_name: e.target.value });
  };

  const handleHandleChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/^@/, "");
    setHandle(value);
    if (HANDLE_PATTERN.test(value)) saveLater({ handle: value });
  };

  const handleIsInvalid = handle.length > 0 && !HANDLE_PATTERN.test(handle);

  return (
    <div className="profile-essentials">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={handleAvatarChange}
      />
      <button
        type="button"
        className="avatar-preview"
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
        aria-label="Change avatar"
      >
        {isUploading ? (
          <span className="avatar-spinner">
            <PrimarySpinner style={{ fontSize: 48, color: "var(--accent)" }} />
          </span>
        ) : profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" />
        ) : (
          <span className="avatar-placeholder">{(displayName || "?").charAt(0)}</span>
        )}
      </button>
      <div className="name-input g-fg">
        <input
          type="text"
          aria-label="Artist name"
          placeholder="Artist name"
          maxLength={60}
          value={displayName}
          onChange={handleNameChange}
        />
        <input
          type="text"
          aria-label="Handle"
          aria-invalid={handleIsInvalid}
          placeholder="@handle"
          maxLength={24}
          value={handle ? `@${handle}` : ""}
          onChange={handleHandleChange}
        />
        {handleIsInvalid && (
          <small className="field-hint">3-24 letters, numbers or underscores</small>
        )}
      </div>
    </div>
  );
}

export default ProfileEssentials;
