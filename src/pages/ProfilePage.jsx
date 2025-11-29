import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import logger from '../utils/logger';

const ProfilePage = () => {
  const { currentUser, updateUserProfile, changePassword, logout } = useAuth();
  const { showNotification, isEmailVerified } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Password change form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhotoURL(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        displayName: displayName || null,
        photoURL: photoURL || null
      });
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to update profile: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }

    setUploading(true);

    try {
      // Delete old photo if exists
      if (currentUser.photoURL && currentUser.photoURL.includes('firebasestorage')) {
        try {
          // Extract storage path from URL
          // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token=...
          const url = new URL(currentUser.photoURL);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const storagePath = decodeURIComponent(pathMatch[1]);
            const oldPhotoRef = ref(storage, storagePath);
            await deleteObject(oldPhotoRef);
          }
        } catch (err) {
          logger.debug('Old photo not found or already deleted');
        }
      }

      // Upload new photo
      const photoRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(photoRef, file);
      const downloadURL = await getDownloadURL(photoRef);

      // Update profile with new photo URL
      await updateUserProfile({ photoURL: downloadURL });
      setPhotoURL(downloadURL);
      showNotification('Profile photo updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to upload photo: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await changePassword(newPassword, currentPassword);
      showNotification('Password changed successfully!', 'success');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentUser.photoURL) return;

    setUploading(true);

    try {
      if (currentUser.photoURL.includes('firebasestorage')) {
        // Extract storage path from URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token=...
        try {
          const url = new URL(currentUser.photoURL);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const storagePath = decodeURIComponent(pathMatch[1]);
            const photoRef = ref(storage, storagePath);
            await deleteObject(photoRef);
          }
        } catch (deleteError) {
          // If deletion fails, continue to remove from profile
          logger.debug('Could not delete photo from storage, removing from profile only');
        }
      }

      await updateUserProfile({ photoURL: null });
      setPhotoURL('');
      showNotification('Profile photo removed successfully!', 'success');
    } catch (error) {
      showNotification('Failed to remove photo: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2><i className="fas fa-user-circle"></i> Profile Settings</h2>
        <p>Manage your account information and preferences.</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3><i className="fas fa-user"></i> Profile Information</h3>
          
          <div className="profile-photo-section">
            <div className="profile-photo-container">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <div className="profile-photo-actions">
              <label htmlFor="photo-upload" className="btn btn-outline btn-sm">
                <i className="fas fa-upload"></i>
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {photoURL && (
                <button
                  onClick={handleDeletePhoto}
                  className="btn btn-danger btn-sm"
                  disabled={uploading}
                >
                  <i className="fas fa-trash"></i>
                  Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h3><i className="fas fa-lock"></i> Password</h3>
          
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn btn-outline"
            >
              <i className="fas fa-key"></i>
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="profile-form">
              {passwordError && (
                <div className="auth-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Changing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h3><i className="fas fa-info-circle"></i> Account Information</h3>
          <div className="account-info">
            <div className="info-item">
              <strong>Email Verified:</strong>
              <span className={isEmailVerified ? 'verified' : 'not-verified'}>
                {isEmailVerified ? (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Verified (via OTP)
                  </>
                ) : (
                  <>
                    <i className="fas fa-times-circle"></i>
                    Not Verified
                  </>
                )}
              </span>
            </div>
            <div className="info-item">
              <strong>Account Created:</strong>
              <span>
                {currentUser?.metadata?.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <strong>Last Sign In:</strong>
              <span>
                {currentUser?.metadata?.lastSignInTime
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

