import { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCamera,
  FiEdit2,
  FiSave,
  FiX,
  FiShield,
  FiLoader
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });

  const avatarUrl =
    user?.profilePicture?.url ||
    user?.avatar ||
    user?.profileImage ||
    user?.photoUrl ||
    user?.profilePic;

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: user.gender || ''
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const response = await profileService.updateProfile(formData);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const response = await profileService.uploadProfilePicture(file);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile picture updated');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Remove your profile picture?')) return;

    setUploading(true);
    try {
      const response = await profileService.deleteProfilePicture();
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile picture removed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove picture');
    } finally {
      setUploading(false);
    }
  };

  // While user is being refreshed, show centered, non-fullscreen loader
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 py-6 md:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <LoadingSpinner size="md" message="Loading profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            My profile
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage your personal information
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Top / avatar */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-10 text-center relative">
            <div className="relative inline-block">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-3xl md:text-4xl font-semibold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <FiLoader className="animate-spin text-purple-600" size={24} />
                  </div>
                )}
              </div>

              <label
                htmlFor="profile-upload"
                className={`absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md transition-all ${
                  uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-purple-50'
                }`}
              >
                {uploading ? (
                  <FiLoader className="animate-spin text-purple-600" size={16} />
                ) : (
                  <FiCamera className="text-purple-600" size={16} />
                )}
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-white mt-4">
              {user.name}
            </h2>
            <p className="text-purple-100 text-sm mt-1">{user.email}</p>

            <p className="text-white text-xs mt-3 opacity-90">
              JPG, PNG or GIF (max. 5MB)
            </p>

            {avatarUrl && !uploading && (
              <button
                onClick={handleDeletePicture}
                disabled={uploading}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Remove picture
              </button>
            )}
          </div>

          {/* Form */}
          <div className="p-5 md:p-6 relative">
            {saving && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <FiLoader className="animate-spin text-purple-600" size={26} />
                  <span className="text-sm text-slate-700 font-medium">
                    Saving profile...
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base md:text-lg font-semibold text-slate-900">
                Personal information
              </h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <FiEdit2 size={16} />
                  Edit profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      dateOfBirth: user.dateOfBirth
                        ? new Date(user.dateOfBirth)
                            .toISOString()
                            .split('T')[0]
                        : '',
                      gender: user.gender || ''
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                >
                  <FiX size={16} />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <FiUser
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm transition-all ${
                      editing
                        ? 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white'
                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <FiMail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm transition-all ${
                      editing
                        ? 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white'
                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone number
                </label>
                <div className="relative">
                  <FiPhone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm transition-all ${
                      editing
                        ? 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white'
                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Date of birth
                </label>
                <div className="relative">
                  <FiCalendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm transition-all ${
                      editing
                        ? 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white'
                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all ${
                    editing
                      ? 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white'
                      : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FiShield className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Account type
                    </p>
                    <p className="text-base font-semibold text-slate-900 capitalize">
                      {user.role || 'buyer'}
                    </p>
                  </div>
                </div>
              </div>

              {editing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-full text-sm md:text-base font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={18} />
                      Save changes
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
