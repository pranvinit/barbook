import "./css/profile-judgement.css";
import { useJudgeProfileQuery } from "../api/profileApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfileQueryArg } from "@/lib/hooks/useProfileQueryArg";
import ScoreBadge from "@/components/ui/score-badge/ScoreBadge";
import PrimarySpinner from "@/components/ui/spinners/PrimarySpinner";

const ProfileJudgement = () => {
  const { uuid, profileData } = useAuth();

  const queryArg = useProfileQueryArg(profileData);

  const {
    data: judgement,
    isLoading,
    isError,
  } = useJudgeProfileQuery(queryArg, {
    skip: !uuid,
    refetchOnMountOrArgChange: true,
  });

  return (
    <div className="profile-judgement">
      {isLoading && (
        <PrimarySpinner
          style={{
            fontSize: 24,
            color: "var(--accent)",
          }}
        />
      )}
      {isError && <p>Error loading profile judgement.</p>}
      {judgement && (
        <>
          <ScoreBadge
            isLoading={isLoading}
            score={judgement.profileScore}
            label="Profile Score"
          />
          <p className="profile-feedback g-fg">{judgement.feedback}</p>
        </>
      )}
    </div>
  );
};

export default ProfileJudgement;
