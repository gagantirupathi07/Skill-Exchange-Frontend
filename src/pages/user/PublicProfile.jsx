
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPublicUserProfile } from "../../api/userApi";
import SendExchangeRequestModal from "../../components/SendExchangeRequestModal";
import "../../styles/PublicProfile.css";

const API_ORIGIN = "http://localhost:8080";

function getProfileImageUrl(path) {
    if (!path || typeof path !== "string") {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function getErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load user profile."
    );
}

function getSkillName(skill) {
    return (
        skill?.skillName ||
        skill?.name ||
        skill?.skill?.name ||
        "Unnamed skill"
    );
}

function PublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchProfile() {
            setLoading(true);
            setError("");
            setProfile(null);
            setImageFailed(false);
            setSuccessMessage("");

            try {
                if (!id || !Number.isFinite(Number(id))) {
                    throw new Error("Invalid user profile ID.");
                }

                const data = await getPublicUserProfile(id);

                if (cancelled) {
                    return;
                }

                if (!data || typeof data !== "object") {
                    throw new Error("User profile not found.");
                }

                setProfile(data);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error("Error fetching public profile:", err);
                setError(getErrorMessage(err));
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [successMessage]);

    const handleRequestSuccess = () => {
        setShowRequestModal(false);
        setSuccessMessage("Exchange request sent successfully.");
    };

    if (loading) {
        return (
            <div className="public-profile-wrapper">
                <div className="public-profile-loading" role="status">
                    <div className="public-profile-spinner" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="public-profile-wrapper">
                <div
                    className={`public-profile-notice ${
                        error
                            ? "public-profile-error"
                            : "public-profile-empty"
                    }`}
                    role={error ? "alert" : "status"}
                >
                    {error || "User profile not found."}
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/matches")}
                    className="public-secondary-button"
                >
                    Back to Matches
                </button>
            </div>
        );
    }

    const teachingSkills = Array.isArray(profile.teachingSkills)
        ? profile.teachingSkills
        : [];

    const learningSkills = Array.isArray(profile.learningSkills)
        ? profile.learningSkills
        : [];

    const displayName =
        [profile.firstName, profile.lastName]
            .filter((name) => typeof name === "string" && name.trim())
            .map((name) => name.trim())
            .join(" ") || "User";

    const initials = (
        `${profile.firstName?.trim()?.charAt(0) || ""}` +
        `${profile.lastName?.trim()?.charAt(0) || ""}`
    ).toUpperCase() || "U";

    const profileImage = getProfileImageUrl(profile.profilePicture);

    return (
        <div className="public-profile-wrapper">
            {successMessage && (
                <div
                    className="public-profile-notice public-profile-success"
                    role="status"
                >
                    {successMessage}
                </div>
            )}

            <div className="public-profile-card">
                <div className="public-profile-banner" />

                <div className="public-profile-content">
                    <header className="public-profile-header">
                        <div className="public-profile-avatar">
                            {profileImage && !imageFailed ? (
                                <img
                                    src={profileImage}
                                    alt={`${displayName}'s profile`}
                                    className="public-profile-avatar-image"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>

                        <div className="public-profile-heading">
                            <span className="public-profile-eyebrow">
                                COMMUNITY MEMBER
                            </span>

                            <h1 className="public-profile-name">
                                {displayName}
                            </h1>

                            <p className="public-profile-subtitle">
                                Skill Exchange Community
                            </p>
                        </div>

                        <div className="public-profile-readonly">
                            <span
                                className="public-profile-status-dot"
                                aria-hidden="true"
                            />
                            Public Profile
                        </div>
                    </header>

                    <section
                        className="public-profile-about"
                        aria-labelledby="public-about-title"
                    >
                        <h2
                            id="public-about-title"
                            className="public-section-heading"
                        >
                            About
                        </h2>

                        <p className="public-profile-bio">
                            {profile.bio?.trim() ||
                                "This member hasn't added a bio yet."}
                        </p>
                    </section>

                    <div className="public-profile-divider" />

                    <section
                        className="public-skill-section"
                        aria-labelledby="public-teaching-title"
                    >
                        <div className="public-skill-heading-row">
                            <div className="public-skill-heading-icon public-teach-icon">
                                <span aria-hidden="true">↗</span>
                            </div>

                            <div>
                                <h2
                                    id="public-teaching-title"
                                    className="public-skill-title"
                                >
                                    Skills They Can Teach
                                </h2>

                                <p className="public-skill-description">
                                    Skills this member can share with you
                                </p>
                            </div>
                        </div>

                        {teachingSkills.length > 0 ? (
                            <div className="public-skill-list">
                                {teachingSkills.map((skill, index) => (
                                    <span
                                        key={
                                            skill.id ??
                                            skill.skillId ??
                                            skill.skill?.id ??
                                            `${getSkillName(skill)}-${index}`
                                        }
                                        className="public-skill public-skill-teach"
                                    >
                                        {getSkillName(skill)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="public-skill-empty">
                                No teaching skills listed yet.
                            </p>
                        )}
                    </section>

                    <div className="public-profile-divider" />

                    <section
                        className="public-skill-section"
                        aria-labelledby="public-learning-title"
                    >
                        <div className="public-skill-heading-row">
                            <div className="public-skill-heading-icon public-learn-icon">
                                <span aria-hidden="true">↙</span>
                            </div>

                            <div>
                                <h2
                                    id="public-learning-title"
                                    className="public-skill-title"
                                >
                                    Skills They Want to Learn
                                </h2>

                                <p className="public-skill-description">
                                    Skills this member wants to develop
                                </p>
                            </div>
                        </div>

                        {learningSkills.length > 0 ? (
                            <div className="public-skill-list">
                                {learningSkills.map((skill, index) => (
                                    <span
                                        key={
                                            skill.id ??
                                            skill.skillId ??
                                            skill.skill?.id ??
                                            `${getSkillName(skill)}-${index}`
                                        }
                                        className="public-skill public-skill-learn"
                                    >
                                        {getSkillName(skill)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="public-skill-empty">
                                No learning skills listed yet.
                            </p>
                        )}
                    </section>

                    <div className="public-profile-action-panel">
                        <div className="public-profile-action-copy">
                            <h2>Ready to exchange skills?</h2>
                            <p>
                                Send a request to connect and start learning
                                together.
                            </p>
                        </div>

                        <div className="public-profile-actions">
                            <button
                                type="button"
                                onClick={() => setShowRequestModal(true)}
                                className="public-primary-button"
                            >
                                Send Exchange Request
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/matches")}
                                className="public-secondary-button"
                            >
                                Back to Matches
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showRequestModal && (
                <SendExchangeRequestModal
                    receiver={{
                        userId:
                            profile.id ??
                            profile.userId ??
                            Number(id),
                        username: profile.username,
                        teachingSkills,
                    }}
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={handleRequestSuccess}
                />
            )}
        </div>
    );
}

export default PublicProfile;
