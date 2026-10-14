"use client";
import "./page.css";

import { useState } from "react";
import { useSession } from "@/features/auth/useSession";
import { useProfile } from "@/features/profile/useProfile";

// component imports
import BarEditor from "@/features/bars/ui/BarEditor";
import ProfileEssentials from "@/features/profile/ui/ProfileEssentials";
import ArtistDetails from "@/features/profile/ui/ArtistDetails";
import GhostwriterPanel from "@/features/ghostwriter/ui/GhostwriterPanel";
import TopBars from "@/features/bars/ui/TopBars";
import ArtistRead from "@/features/profile/ui/ArtistRead";
import BarHistory from "@/features/bars/ui/BarHistory";
import ScribbleLoader from "@/components/ui/scribble-loader/ScribbleLoader";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function NotebookPage() {
  const { isLoading: isSessionLoading } = useSession();
  const { data: profile, isError } = useProfile();

  const [activeTab, setActiveTab] = useState("top");

  if (isError) {
    return <p className="notebook-error">Couldn't load your notebook. Refresh to try again.</p>;
  }

  if (isSessionLoading || !profile) {
    return <ScribbleLoader />;
  }

  return (
    <div className="home">
      <div className="top">
        <div className="left">
          <BarHistory />
        </div>
        <div className="center">
          <div className="center-top g-bg">
            <ProfileEssentials key={profile.id} profile={profile} />
            <ArtistRead read={profile.artist_read} />
          </div>
          <ArtistDetails key={profile.id} profile={profile} />
        </div>
        <div className="right">
          <div className="tab-bar g-bg">
            <button
              className={`tab-button ${activeTab === "top" ? "g-fg" : ""}`}
              onClick={() => setActiveTab("top")}
            >
              Hall of fame
              <em>
                <DiamondRoundedIcon fontSize="small" />
              </em>
            </button>
            <button
              className={`tab-button ${
                activeTab === "ghostwriter" ? "g-fg" : ""
              }`}
              onClick={() => setActiveTab("ghostwriter")}
            >
              Ghostwriter
              <em>
                <AutoAwesomeRoundedIcon fontSize="small" />
              </em>
            </button>
          </div>
          {activeTab === "top" && <TopBars />}
          {activeTab === "ghostwriter" && <GhostwriterPanel />}
        </div>
      </div>
      <div className="bottom">
        <BarEditor />
      </div>
    </div>
  );
}
