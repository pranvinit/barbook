"use client";
import "./page.css";

import { useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";

// component imports
import BarEditor from "../features/bars/ui/BarEditor";
import ProfileEssentials from "../features/profile/ui/ProfileEssentials";
import ProfileInterests from "../features/profile/ui/ProfileInterests";
import GhostwriterPanel from "../features/ghostwriter/ui/GhostwriterPanel";
import TopBars from "../features/bars/ui/TopBars";
import ProfileJudgement from "../features/profile/ui/ProfileJudgement";
import BarHistory from "../features/bars/ui/BarHistory";
import AuthLoading from "../components/ui/auth-loading/AuthLoading";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ThemeManager from "@/components/ThemeManager";
import { useSelector } from "react-redux";
import { selectTheme } from "@/features/ui/model/uiSlice";

function Home() {
  const { authLoading, profileData } = useAuth();

  const [activeTab, setActiveTab] = useState("top");

  if (authLoading) {
    return <AuthLoading />;
  }

  return (
    <div className="home">
      <div className="top">
        <div className="left">
          <BarHistory />
        </div>
        <div className="center">
          <div className="center-top g-bg">
            <ProfileEssentials
              name={profileData.name}
              avatar_url={profileData.avatar_url}
            />
            <ProfileJudgement />
          </div>
          <ProfileInterests
            hobbies={profileData.hobbies}
            traits={profileData.traits}
            bio={profileData.bio}
          />
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

export default function () {
  const theme = useSelector(selectTheme);
  return (
    <ThemeManager theme={theme}>
      <Home />
    </ThemeManager>
  );
}
