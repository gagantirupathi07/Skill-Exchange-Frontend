function MatchCard({ match, onViewProfile }) {
  const initials =
    match?.firstName?.charAt(0) ||
    match?.username?.charAt(0) ||
    "U";

  const profileImage = match?.profilePicture
    ? `https://skill-exchange-backend-production-3d3c.up.railway.app${match.profilePicture}`
    : null;

  return (
    <div className="match-card">

      <div className="match-user-row">

        <div className="match-user-main">

          <div className="match-avatar">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${match.firstName || "User"} profile`}
                className="match-avatar-image"
              />
            ) : (
              <span>
                {initials.toUpperCase()}
              </span>
            )}
          </div>

          <div className="match-user-info">
            <h2 className="match-name">
              {match.firstName} {match.lastName}
            </h2>

            <p className="match-username">
              @{match.username}
            </p>
          </div>

        </div>

        <div className="match-score">
          <span className="match-score-label">
            Match
          </span>

          <span className="match-score-value">
            {match.matchScore}%
          </span>
        </div>

      </div>

      {match.twoWayMatch && (
        <div>
          <span className="two-way-badge">
            Two-Way Match
          </span>
        </div>
      )}

      {match.bio && (
        <p className="match-bio">
          {match.bio}
        </p>
      )}

      <div className="match-section">

        <p className="match-section-title">
          Skills They Can Teach
        </p>

        {match.skillsTheyCanTeach?.length > 0 ? (
          <div className="match-skills">

            {match.skillsTheyCanTeach.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="match-skill match-skill-teach"
                >
                  {skill}
                </span>
              )
            )}

          </div>
        ) : (
          <p className="empty-text">
            No teaching skills listed.
          </p>
        )}

      </div>

      <div className="match-section">

        <p className="match-section-title">
          Skills They Want To Learn
        </p>

        {match.skillsTheyWantToLearn?.length > 0 ? (
          <div className="match-skills">

            {match.skillsTheyWantToLearn.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="match-skill match-skill-learn"
                >
                  {skill}
                </span>
              )
            )}

          </div>
        ) : (
          <p className="empty-text">
            No learning skills listed.
          </p>
        )}

      </div>

      <button
        type="button"
        onClick={() => onViewProfile(match.userId)}
        className="match-button"
      >
        View Profile
      </button>

    </div>
  );
}

export default MatchCard;
