import  { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND } from '../constant';
import { FaCheckCircle } from "react-icons/fa";

const api = axios.create({
  baseURL: BACKEND,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ProfileModal = ({ walletAddress, closeModal }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicName, setProfilePicName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching with token:', token);

      const response = await axios.get(`${BACKEND}/api/getProfile/${walletAddress}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { username, bio, profilePic, isApproved } = response.data;
      setUsername(username || "");
      setBio(bio || "");
      setIsApproved(isApproved);
      if (profilePic) {
        setProfilePicUrl(`data:image/jpeg;base64,${profilePic}`);
      } else {
        setProfilePicUrl("https://via.placeholder.com/150");
      }
    } catch (error) {
      console.error("Error Details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers
      });
    }
  };

  const toggleEditModal = () => {
    setIsEditOpen(!isEditOpen);
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    setProfilePic(file);
    setProfilePicName(file ? file.name : "");
    if (file) {
      setProfilePicUrl(URL.createObjectURL(file)); // Show preview immediately
    }
  };

  const handleSaveChanges = async () => {
    // Validate username length
    if ((username || "").length > 15) {
      alert("Username must be 15 characters or less. Current length: " + (username || "").length);
      return;
    }

    // Validate required fields
    if (!(username || "").trim()) {
      alert("Username is required.");
      return;
    }

    const formData = new FormData();
    formData.append("walletAddress", walletAddress);
    formData.append("username", username || "");
    formData.append("bio", bio || "");
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const response = await axios.post(`${BACKEND}/api/updateProfile`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Remove Content-Type header - let browser set it automatically for FormData
        },
      });
      alert("Profile changes saved!");
      toggleEditModal();
      fetchUserData();
    } catch (error) {
      console.error("Error uploading profile data:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });

      // Show more specific error message
      const errorMessage = error.response?.data?.message ||
        error.response?.statusText ||
        "Failed to save profile changes.";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div>
      {/* Main Profile Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-11/12 max-w-md overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl">
          {/* Header with gradient background */}
          <div className="relative p-6 pb-12 bg-gradient-to-br from-gray-500 via-black-500 to-blue-300">
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="p-2 text-white transition-all duration-200 rounded-full bg-white/20 hover:bg-white/30 hover:rotate-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex justify-center -mb-8">
              <div className="relative">
                <img
                  className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-xl"
                  src={profilePicUrl || '/default-profile.jpg'}
                  alt="Profile"
                />
                {isApproved && (
                  <div className="absolute p-1 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1">
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Username */}
            <div className="mb-6 text-center">
              <h2 className="flex items-center justify-center gap-2 mb-2 text-2xl font-bold text-gray-900">
                {username || "Loading..."}
                {isApproved && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </h2>
            </div>

            {/* Info Cards */}
            <div className="mb-6 space-y-4">
              <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Wallet Address</p>
                    <p className="mt-1 font-mono text-sm text-gray-900">{walletAddress}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Bio</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">{bio || "No bio available"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              onClick={toggleEditModal}
            >
              <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal - Changed z-index from z-60 to z-[9999] */}
      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 backdrop-blur-sm">
          <div className="w-11/12 max-w-md overflow-hidden transition-all duration-300 transform bg-white shadow-2xl rounded-2xl">
            {/* Edit Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={toggleEditModal}
                  className="p-2 text-white transition-all duration-200 rounded-full bg-white/20 hover:bg-white/30 hover:rotate-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Edit Form */}
            <div className="p-6">
              {/* Username Field */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-900">
                  Username
                  <span className={`ml-2 text-xs ${(username || "").length > 15 ? 'text-red-500' : 'text-gray-500'}`}>
                    ({(username || "").length}/15)
                  </span>
                </label>
                <input
                  type="text"
                  value={username || ""}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={15}
                  className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-xl focus:ring-2 focus:border-transparent focus:bg-white ${(username || "").length > 15
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-gray-200 bg-gray-50 focus:ring-emerald-500'
                    }`}
                  placeholder="Enter new username"
                />
                {(username || "").length > 15 && (
                  <p className="mt-1 text-xs text-red-500">
                    Username is too long. Please keep it under 15 characters.
                  </p>
                )}
              </div>

              {/* Bio Field */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-900">Bio
                  <span className={`ml-2 text-xs ${(bio || "").length > 128 ? 'text-red-500' : 'text-gray-500'}`}>
                    ({(bio || "").length}/128)
                  </span>
                </label>
                <textarea
                  value={bio || ""}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 transition-all duration-200 border border-gray-200 resize-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white"
                  placeholder="Enter new bio"
                  rows={3}
                />
                {(bio || "").length > 128 && (
                  <p className="mt-1 text-xs text-red-500">
                    Bio is too long. Please keep it under 128 characters.
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-900">Profile Picture</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                {profilePicName && (
                  <p className="px-3 py-2 mt-2 text-sm text-gray-600 rounded-lg bg-blue-50">
                    <svg className="inline w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Selected: {profilePicName}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  onClick={handleSaveChanges}
                >
                  <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                <button
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={toggleEditModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;