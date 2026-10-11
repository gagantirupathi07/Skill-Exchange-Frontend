import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../../api/userApi";
import "../../styles/profile.css";

const API_ORIGIN = "https://skill-exchange-backend-production-3d3c.up.railway.app";
const CROP_SIZE = 512;

function getProfileImageUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function getInitials(firstName, lastName, username) {
  const first = firstName?.trim()?.charAt(0);
  const last = lastName?.trim()?.charAt(0);

  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }

  return (first || username?.charAt(0) || "U").toUpperCase();
}

const cropEditorStyles = `
.profile-crop-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(45, 25, 39, .58);
  backdrop-filter: blur(7px);
  overflow: auto;
}
.profile-crop-dialog {
  width: min(760px, 100%);
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: clamp(16px, 3vw, 28px);
  border: 1px solid #e8b9d0;
  border-radius: 20px;
  background: #fffafd;
  color: #624653;
  box-shadow: 0 28px 90px rgba(54, 24, 43, .3);
}
.profile-crop-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}
.profile-crop-header h2 {
  margin: 5px 0;
  color: #71475e;
  font: 400 clamp(25px, 4vw, 34px)/1.2 Georgia, serif;
}
.profile-crop-header p {
  margin: 0;
  color: #987f8e;
  font-size: 12px;
}
.profile-crop-close {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border: 1px solid #efccdc;
  border-radius: 50%;
  background: white;
  color: #9b6380;
  font-size: 26px;
  cursor: pointer;
}
.profile-crop-workspace {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 16px;
  border: 1px solid #f0d6e2;
  border-radius: 15px;
  background: linear-gradient(135deg, #fff0f6, #fffafd);
}
.profile-crop-canvas-wrap {
  position: relative;
  width: min(100%, 340px);
  aspect-ratio: 1;
  flex: 0 1 340px;
  overflow: hidden;
  border-radius: 12px;
  background: #fceaf2;
  box-shadow: 0 10px 28px #c0759b26;
  cursor: grab;
  touch-action: none;
}
.profile-crop-canvas-wrap.dragging {
  cursor: grabbing;
}
.profile-crop-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
.profile-crop-guide {
  position: absolute;
  inset: 0;
  border: 1px solid #ffffffb8;
  box-shadow: inset 0 0 0 1px #6e3e561f;
  pointer-events: none;
}
.profile-crop-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #8d6078;
  pointer-events: none;
}
.profile-crop-preview-panel {
  flex: 0 0 145px;
  text-align: center;
}
.profile-crop-preview-label {
  color: #a36c89;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
}
.profile-crop-round-preview {
  width: 124px;
  height: 124px;
  margin: 12px auto;
  overflow: hidden;
  border: 4px solid white;
  border-radius: 50%;
  background: #fceaf2;
  box-shadow: 0 5px 20px #c0759b33;
}
.profile-crop-preview-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.profile-crop-preview-panel p {
  margin: 0;
  color: #987f8e;
  font-size: 11px;
  line-height: 1.6;
}
.profile-crop-controls {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}
.profile-crop-control-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #79576d;
  font-size: 12px;
  font-weight: 700;
}
.profile-crop-control-heading span {
  color: #bd7098;
}
.profile-crop-zoom-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-crop-zoom-row input {
  width: 100%;
  min-width: 0;
  accent-color: #d989b2;
}
.profile-crop-tool-button {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border: 1px solid #ebc8d9;
  border-radius: 10px;
  background: white;
  color: #9f6482;
  font-size: 22px;
  cursor: pointer;
}
.profile-crop-secondary-button,
.profile-crop-cancel-button {
  min-height: 40px;
  padding: 9px 13px;
  border: 1px solid #e7c4d6;
  border-radius: 9px;
  background: white;
  color: #79576d;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.profile-crop-rotation-controls > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.profile-crop-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.profile-crop-save-button {
  min-height: 42px;
  padding: 11px 18px;
  border: 0;
  border-radius: 9px;
  background: linear-gradient(120deg, #e99abd, #d992bb);
  color: white;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}
.profile-crop-dialog button:disabled,
.profile-crop-dialog input:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.profile-crop-error {
  margin: 12px 0 0;
  padding: 10px 12px;
  border: 1px solid #edc2d5;
  border-radius: 9px;
  background: #fff0f6;
  color: #a45f85;
  font-size: 12px;
}
@media (max-width: 560px) {
  .profile-crop-backdrop {
    align-items: flex-start;
    padding: 8px;
  }
  .profile-crop-dialog {
    max-height: calc(100vh - 16px);
    padding: 15px;
    border-radius: 15px;
  }
  .profile-crop-workspace {
    flex-direction: column;
    gap: 16px;
    padding: 10px;
  }
  .profile-crop-canvas-wrap {
    width: min(100%, 330px);
    flex-basis: auto;
  }
  .profile-crop-preview-panel {
    flex: auto;
  }
  .profile-crop-round-preview {
    width: 82px;
    height: 82px;
    margin: 7px auto;
  }
  .profile-crop-actions {
    flex-direction: column-reverse;
  }
  .profile-crop-actions button {
    width: 100%;
  }
  .profile-crop-secondary-button {
    flex: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .profile-crop-dialog * {
    transition: none !important;
    animation: none !important;
  }
}
`;

function CropEditor({ file, onCancel, onSave, saving }) {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const dragRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [cropError, setCropError] = useState("");

  useEffect(() => {
    let active = true;
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (!active) return;

      imageRef.current = image;
      setReady(true);
    };

    image.onerror = () => {
      if (active) {
        setCropError(
          "Could not open this image. Please choose another one."
        );
      }
    };

    image.src = url;

    return () => {
      active = false;
      URL.revokeObjectURL(url);
      imageRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!ready || !image || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const quarterTurn = Math.abs(rotation % 180) === 90;
    const rotatedWidth = quarterTurn ? image.height : image.width;
    const rotatedHeight = quarterTurn ? image.width : image.height;

    const scale =
      Math.max(
        CROP_SIZE / rotatedWidth,
        CROP_SIZE / rotatedHeight
      ) * zoom;

    const maxX = Math.max(
      0,
      (rotatedWidth * scale - CROP_SIZE) / 2
    );

    const maxY = Math.max(
      0,
      (rotatedHeight * scale - CROP_SIZE) / 2
    );

    const x = Math.max(-maxX, Math.min(maxX, offset.x));
    const y = Math.max(-maxY, Math.min(maxY, offset.y));

    if (x !== offset.x || y !== offset.y) {
      setOffset({ x, y });
    }

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.fillStyle = "#fceaf2";
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);

    ctx.save();
    ctx.translate(
      CROP_SIZE / 2 + x,
      CROP_SIZE / 2 + y
    );
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.drawImage(
      image,
      (-image.width * scale) / 2,
      (-image.height * scale) / 2,
      image.width * scale,
      image.height * scale
    );

    ctx.restore();

    const previewContext =
      previewRef.current?.getContext("2d");

    if (previewContext) {
      previewContext.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
      previewContext.drawImage(canvas, 0, 0);
    }
  }, [ready, zoom, rotation, offset]);

  const handlePointerDown = (event) => {
    if (!ready || saving) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);

    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };

    setDragging(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.id !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();

    setOffset({
      x:
        drag.offsetX +
        ((event.clientX - drag.x) * CROP_SIZE) /
          Math.max(rect.width, 1),
      y:
        drag.offsetY +
        ((event.clientY - drag.y) * CROP_SIZE) /
          Math.max(rect.height, 1),
    });
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.id !== event.pointerId) return;

    dragRef.current = null;
    setDragging(false);
  };

  const handleRotate = (degrees) => {
    setRotation((current) => current + degrees);
    setOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setCropError("");
  };

  const handleSave = () => {
    if (!canvasRef.current || !ready || saving) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          setCropError(
            "Could not create the cropped image. Please try again."
          );
          return;
        }

        const name =
          file.name.replace(/\.[^.]+$/, "") ||
          "profile-picture";

        const croppedFile = new File(
          [blob],
          `${name}-cropped.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          }
        );

        onSave(croppedFile);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <>
      <style>{cropEditorStyles}</style>

      <div
        className="profile-crop-backdrop"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !saving
          ) {
            onCancel();
          }
        }}
      >
        <section
          className="profile-crop-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-crop-title"
        >
          <header className="profile-crop-header">
            <div>
              <span className="profile-eyebrow">
                PROFILE PHOTO
              </span>

              <h2 id="profile-crop-title">
                Crop your picture
              </h2>

              <p>
                Drag to reposition, zoom to resize, or rotate
                your photo.
              </p>
            </div>

            <button
              type="button"
              className="profile-crop-close"
              onClick={onCancel}
              disabled={saving}
              aria-label="Close crop editor"
            >
              ×
            </button>
          </header>

          <div className="profile-crop-workspace">
            <div
              className={`profile-crop-canvas-wrap ${
                dragging ? "dragging" : ""
              }`}
            >
              {!ready && !cropError && (
                <div className="profile-crop-loading">
                  Loading image…
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={CROP_SIZE}
                height={CROP_SIZE}
                className="profile-crop-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onLostPointerCapture={() => {
                  dragRef.current = null;
                  setDragging(false);
                }}
                aria-label="Photo crop area; drag to reposition"
              />

              <div
                className="profile-crop-guide"
                aria-hidden="true"
              />
            </div>

            <aside className="profile-crop-preview-panel">
              <span className="profile-crop-preview-label">
                PROFILE PREVIEW
              </span>

              <div className="profile-crop-round-preview">
                <canvas
                  ref={previewRef}
                  width={CROP_SIZE}
                  height={CROP_SIZE}
                  className="profile-crop-preview-canvas"
                />
              </div>

              <p>
                This is how the photo will appear on your profile.
              </p>
            </aside>
          </div>

          <div className="profile-crop-controls">
            <div>
              <div className="profile-crop-control-heading">
                <label htmlFor="profile-crop-zoom">
                  Zoom
                </label>

                <span>{Math.round(zoom * 100)}%</span>
              </div>

              <div className="profile-crop-zoom-row">
                <button
                  type="button"
                  className="profile-crop-tool-button"
                  onClick={() =>
                    setZoom((value) =>
                      Math.max(1, value - 0.1)
                    )
                  }
                  disabled={!ready || zoom <= 1 || saving}
                  aria-label="Zoom out"
                >
                  −
                </button>

                <input
                  id="profile-crop-zoom"
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(event) =>
                    setZoom(Number(event.target.value))
                  }
                  disabled={!ready || saving}
                />

                <button
                  type="button"
                  className="profile-crop-tool-button"
                  onClick={() =>
                    setZoom((value) =>
                      Math.min(3, value + 0.1)
                    )
                  }
                  disabled={!ready || zoom >= 3 || saving}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
            </div>

            <div className="profile-crop-rotation-controls">
              <span className="profile-crop-control-label">
                ROTATE
              </span>

              <div>
                <button
                  type="button"
                  className="profile-crop-secondary-button"
                  onClick={() => handleRotate(-90)}
                  disabled={!ready || saving}
                >
                  ↶ Rotate left
                </button>

                <button
                  type="button"
                  className="profile-crop-secondary-button"
                  onClick={() => handleRotate(90)}
                  disabled={!ready || saving}
                >
                  ↷ Rotate right
                </button>

                <button
                  type="button"
                  className="profile-crop-secondary-button"
                  onClick={handleReset}
                  disabled={!ready || saving}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {cropError && (
            <p className="profile-crop-error" role="alert">
              {cropError}
            </p>
          )}

          <footer className="profile-crop-actions">
            <button
              type="button"
              className="profile-crop-cancel-button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="profile-crop-save-button"
              onClick={handleSave}
              disabled={!ready || saving}
            >
              {saving ? "Uploading…" : "Save & Upload"}
            </button>
          </footer>
        </section>
      </div>
    </>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(user || null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [cropFile, setCropFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const busy = saving || uploading || deleting;

  /*
   * IMPORTANT:
   * AuthContext's setUser accepts a user object or null.
   * Do not pass a functional updater to it.
   *
   * Also, do not call setUser inside setProfile's updater.
   * React state updater functions should remain free of side effects.
   */
  const applyProfile = (updatedProfile) => {
    if (!updatedProfile || typeof updatedProfile !== "object") {
      return;
    }

    const mergedProfile = {
      ...(profile || {}),
      ...updatedProfile,
      teachingSkills:
        updatedProfile.teachingSkills ??
        profile?.teachingSkills ??
        [],
      learningSkills:
        updatedProfile.learningSkills ??
        profile?.learningSkills ??
        [],
    };

    setProfile(mergedProfile);
    setUser(mergedProfile);

    setFormData({
      firstName: mergedProfile.firstName || "",
      lastName: mergedProfile.lastName || "",
      email: mergedProfile.email || "",
      phone: mergedProfile.phone || "",
      bio: mergedProfile.bio || "",
    });
  };

  const refreshProfile = async () => {
    const latestProfile = await getMyProfile();

    applyProfile(latestProfile);

    return latestProfile;
  };

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);

        const result = await getMyProfile();

        if (!mounted) return;

        const loadedProfile = {
          ...result,
          teachingSkills: result?.teachingSkills || [],
          learningSkills: result?.learningSkills || [],
        };

        setProfile(loadedProfile);
        setUser(loadedProfile);

        setFormData({
          firstName: loadedProfile.firstName || "",
          lastName: loadedProfile.lastName || "",
          email: loadedProfile.email || "",
          phone: loadedProfile.phone || "",
          bio: loadedProfile.bio || "",
        });
      } catch (err) {
        if (!mounted) return;

        console.error("Error loading profile:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
    // Load the profile once when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileImage = getProfileImageUrl(
    profile?.profilePicture
  );

  const initials = getInitials(
    profile?.firstName,
    profile?.lastName,
    profile?.username
  );

  const fullName =
    [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ") || "Your Name";

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const handleEdit = () => {
    clearMessages();

    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      bio: profile?.bio || "",
    });

    setEditing(true);
  };

  const handleCancel = () => {
    clearMessages();

    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      bio: profile?.bio || "",
    });

    setEditing(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!formData.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updateMyProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      });

      /*
       * Refresh the complete profile because the update endpoint
       * may not return teachingSkills and learningSkills.
       */
      const latestProfile = await getMyProfile();

      applyProfile({
        ...updatedProfile,
        ...latestProfile,
      });

      setEditing(false);
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChoosePicture = () => {
    clearMessages();

    if (!busy) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    // Allow the same image to be selected again later.
    event.target.value = "";

    if (!file) return;

    clearMessages();

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must not exceed 5 MB.");
      return;
    }

    setCropFile(file);
  };

  const handleCropSave = async (croppedFile) => {
    clearMessages();

    try {
      setUploading(true);

      await uploadProfilePicture(croppedFile);

      /*
       * Reload the complete profile after uploading.
       * This preserves skills if the upload endpoint returns
       * only the updated picture information.
       */
      await refreshProfile();

      setCropFile(null);
      setMessage(
        "Profile picture cropped and uploaded successfully."
      );
    } catch (err) {
      console.error("Error uploading profile picture:", err);

      setError(
        err.response?.data?.message ||
          "Unable to upload your profile picture."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    clearMessages();

    if (!profile?.profilePicture) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteProfilePicture();

      await refreshProfile();

      setMessage("Profile picture removed successfully.");
    } catch (err) {
      console.error("Error removing profile picture:", err);

      setError(
        err.response?.data?.message ||
          "Unable to remove your profile picture."
      );
    } finally {
      setDeleting(false);
    }
  };

  const teachingSkills = profile?.teachingSkills || [];
  const learningSkills = profile?.learningSkills || [];

  if (loadingProfile) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
          <p>Preparing your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <header className="profile-page-heading">
        <div>
          <span className="profile-eyebrow">
            YOUR PERSONAL SPACE
          </span>

          <h1>My Profile</h1>

          <p>
            Introduce yourself and share what you love to learn.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="profile-edit-button"
            onClick={handleEdit}
            disabled={busy}
          >
            Edit Profile
          </button>
        )}
      </header>

      {message && (
        <div
          className="profile-notice profile-notice-success"
          role="status"
        >
          <span className="profile-notice-icon">✓</span>
          {message}
        </div>
      )}

      {error && (
        <div
          className="profile-notice profile-notice-error"
          role="alert"
        >
          <span className="profile-notice-icon">!</span>
          {error}
        </div>
      )}

      <section className="profile-resume-card">
        <aside className="profile-sidebar">
          <div className="profile-photo-frame">
            {profileImage ? (
              <img
                key={profileImage}
                src={profileImage}
                alt={`${fullName}'s profile`}
                className="profile-photo"
                onError={(event) => {
                  event.currentTarget.style.display = "none";

                  event.currentTarget.nextElementSibling?.classList.remove(
                    "profile-fallback-hidden"
                  );
                }}
              />
            ) : null}

            <div
              className={`profile-photo-fallback ${
                profileImage ? "profile-fallback-hidden" : ""
              }`}
            >
              {initials}
            </div>
          </div>

          <div className="profile-photo-controls">
            <button
              type="button"
              className="profile-photo-change"
              onClick={handleChoosePicture}
              disabled={busy}
            >
              {uploading
                ? "Uploading..."
                : profileImage
                  ? "Change Picture"
                  : "Upload Picture"}
            </button>

            {profileImage && (
              <button
                type="button"
                className="profile-photo-remove"
                onClick={handleDeletePicture}
                disabled={busy}
              >
                {deleting ? "Removing..." : "Remove"}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="profile-file-input"
            aria-label="Choose profile picture"
          />

          <p className="profile-photo-help">
            JPG, PNG or WEBP · Maximum 5 MB
          </p>

          <section className="profile-sidebar-section">
            <h2>Contact</h2>

            <div className="profile-sidebar-divider" />

            <div className="profile-contact-list">
              <div className="profile-contact-item">
                <span
                  className="profile-contact-icon"
                  aria-hidden="true"
                >
                  @
                </span>

                <div className="profile-contact-copy">
                  <span>Email</span>
                  <p>{profile?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="profile-contact-item">
                <span
                  className="profile-contact-icon"
                  aria-hidden="true"
                >
                  ☎
                </span>

                <div className="profile-contact-copy">
                  <span>Phone</span>
                  <p>{profile?.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="profile-contact-item">
                <span
                  className="profile-contact-icon"
                  aria-hidden="true"
                >
                  ◉
                </span>

                <div className="profile-contact-copy">
                  <span>Username</span>
                  <p>@{profile?.username || "user"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-sidebar-section profile-account-section">
            <h2>Account</h2>

            <div className="profile-sidebar-divider" />

            <div className="profile-account-detail">
              <span>Account type</span>
              <strong>{profile?.role || "USER"}</strong>
            </div>

            <div className="profile-account-detail">
              <span>Teaching skills</span>
              <strong>{teachingSkills.length}</strong>
            </div>

            <div className="profile-account-detail">
              <span>Learning skills</span>
              <strong>{learningSkills.length}</strong>
            </div>
          </section>
        </aside>

        <div className="profile-main-panel">
          {editing ? (
            <form
              className="profile-edit-form"
              onSubmit={handleSave}
            >
              <div className="profile-main-heading">
                <span className="profile-eyebrow">
                  PERSONAL INFORMATION
                </span>

                <h2>Edit your profile</h2>

                <p>Keep your details up to date.</p>
              </div>

              <div className="profile-form-grid">
                <div className="profile-form-field">
                  <label htmlFor="profile-firstName">
                    First name
                  </label>

                  <input
                    id="profile-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    maxLength={50}
                    autoComplete="given-name"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="profile-lastName">
                    Last name
                  </label>

                  <input
                    id="profile-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    maxLength={50}
                    autoComplete="family-name"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="profile-email">
                    Email address
                  </label>

                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={100}
                    autoComplete="email"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="profile-phone">
                    Phone number
                  </label>

                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={15}
                    autoComplete="tel"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field profile-form-field-full">
                  <label htmlFor="profile-bio">
                    About me
                  </label>

                  <textarea
                    id="profile-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={6}
                    placeholder="Tell others about yourself, your interests, and what you enjoy learning..."
                    disabled={saving}
                  />

                  <span className="profile-bio-counter">
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <header className="profile-intro">
                <span className="profile-eyebrow">
                  SKILL EXCHANGE MEMBER
                </span>

                <h2 className="profile-display-name">
                  {fullName}
                </h2>

                <p className="profile-display-username">
                  @{profile?.username || "user"}
                </p>

                <p className="profile-bio-text">
                  {profile?.bio?.trim() ||
                    "Your story starts here. Add a short bio to introduce yourself to the Skill Exchange community."}
                </p>
              </header>

              <section className="profile-content-section">
                <div className="profile-section-heading">
                  <h3>Teaching Skills</h3>
                  <span>{teachingSkills.length}</span>
                </div>

                <p className="profile-section-description">
                  Skills you can share with other learners.
                </p>

                {teachingSkills.length > 0 ? (
                  <div className="profile-skill-list">
                    {teachingSkills.map((skill, index) => (
                      <div
                        className="profile-skill-item"
                        key={
                          skill.id ??
                          skill.skillId ??
                          `${skill.skillName}-${index}`
                        }
                      >
                        <span className="profile-skill-marker">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="profile-skill-copy">
                          <strong>{skill.skillName}</strong>

                          {skill.category && (
                            <span>{skill.category}</span>
                          )}
                        </div>

                        <span className="profile-skill-tag">
                          Teaching
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <span className="profile-empty-symbol">＋</span>

                    <div>
                      <strong>No teaching skills yet</strong>
                      <p>
                        Add skills you can teach to connect with learners.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <section className="profile-content-section profile-learning-section">
                <div className="profile-section-heading">
                  <h3>Learning Skills</h3>
                  <span>{learningSkills.length}</span>
                </div>

                <p className="profile-section-description">
                  Skills you would like to learn from others.
                </p>

                {learningSkills.length > 0 ? (
                  <div className="profile-skill-list">
                    {learningSkills.map((skill, index) => (
                      <div
                        className="profile-skill-item"
                        key={
                          skill.id ??
                          skill.skillId ??
                          `${skill.skillName}-${index}`
                        }
                      >
                        <span className="profile-skill-marker">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="profile-skill-copy">
                          <strong>{skill.skillName}</strong>

                          {skill.category && (
                            <span>{skill.category}</span>
                          )}
                        </div>

                        <span className="profile-skill-tag profile-learning-tag">
                          Learning
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <span className="profile-empty-symbol">＋</span>

                    <div>
                      <strong>No learning skills yet</strong>
                      <p>
                        Choose skills you would like to learn from the community.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <footer className="profile-footer">
                <span className="profile-footer-symbol">✳</span>

                <p>
                  Learn something new. Share what you know.
                </p>

                <span className="profile-footer-brand">
                  SKILL EXCHANGE
                </span>
              </footer>
            </>
          )}
        </div>
      </section>

      {cropFile && (
        <CropEditor
          file={cropFile}
          onCancel={() => {
            if (!uploading) {
              setCropFile(null);
            }
          }}
          onSave={handleCropSave}
          saving={uploading}
        />
      )}
    </main>
  );
}

export default Profile;
