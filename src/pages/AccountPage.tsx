import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { parseInterests, serializeInterests } from '@/services/reviewSession';

const AVATAR_OPTIONS = ['🟣', '🔵', '🟢', '🟡', '🔴', '⭐', '📐', '🎯'];

export function AccountPage() {
  const { user, logOut, deleteAccount } = useAuth();
  const { profile, updateProfile: saveProfile, resetProgress, wipeUserData } = useProgress();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('📐');
  const [interestsText, setInterestsText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.displayName ?? user?.displayName ?? '');
    setAvatar(profile?.photoURL?.startsWith('emoji:') ? profile.photoURL.slice(6) : '📐');
    setInterestsText(serializeInterests(profile?.interests ?? []));
  }, [profile, user]);

  const interests = parseInterests(interestsText);

  const handleSave = async () => {
    if (!user) return;
    await updateProfile(user, { displayName: name });
    await saveProfile({
      ...profile,
      displayName: name,
      photoURL: `emoji:${avatar}`,
      interests,
    });
    setMessage('Profile saved.');
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  const handleReset = async () => {
    await resetProgress();
    setShowResetConfirm(false);
    setMessage('Progress reset.');
  };

  const handleDelete = async () => {
    await wipeUserData();
    await deleteAccount();
    navigate('/login');
  };

  return (
    <div className="page account-page">
      <h1>Account</h1>

      <div className="avatar-preview" aria-hidden="true">
        {avatar}
      </div>

      <label className="field">
        <span>Display name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-input"
        />
      </label>

      <fieldset className="avatar-picker">
        <legend>Profile picture</legend>
        <div className="avatar-grid">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
              onClick={() => setAvatar(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Interests</span>
        <input
          type="text"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          className="text-input"
          placeholder="basketball, video games, cooking"
          aria-describedby="interests-help"
        />
      </label>
      <p id="interests-help" className="muted interests-help">
        Comma-separated. We use these to theme your review word problems. Leave blank for a mix.
      </p>
      {interests.length > 0 && (
        <div className="interest-chips" aria-hidden="true">
          {interests.map((tag) => (
            <span key={tag.toLowerCase()} className="interest-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={handleSave}>
        Save profile
      </button>
      {message && <p className="feedback feedback-correct">{message}</p>}

      <hr className="divider" />

      <button type="button" className="btn btn-secondary" onClick={handleLogout} style={{ marginRight: '0.75rem' }}>
        Log out
      </button>

      {!showResetConfirm ? (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowResetConfirm(true)}
          style={{ marginRight: '0.75rem' }}
        >
          Reset progress
        </button>
      ) : (
        <div className="delete-confirm">
          <p className="feedback feedback-wrong">
            This resets all of your lesson and question progress. This cannot be undone.
          </p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-danger" onClick={handleReset}>
              Yes, reset my progress
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showDeleteConfirm ? (
        <button type="button" className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
          Delete account
        </button>
      ) : (
        <div className="delete-confirm">
          <p className="feedback feedback-wrong">
            This permanently deletes your account and all progress. This cannot be undone.
          </p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Yes, delete my account
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
