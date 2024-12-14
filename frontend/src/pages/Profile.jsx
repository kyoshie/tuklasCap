import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND } from '../constant';


const api = axios.create({
  baseURL: BACKEND,
  headers: {
      'Content-Type': 'application/json'
  }
});

// Add request interceptor to automatically add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const ProfileModal = ({ walletAddress, closeModal }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const [isEditOpen, setIsEditOpen] = useState(false); 
  const [username, setUsername] = useState(""); 
  const [bio, setBio] = useState(""); 
  const [profilePic, setProfilePic] = useState(null); 
  const [profilePicName, setProfilePicName] = useState(""); 
  const [profilePicUrl, setProfilePicUrl] = useState(""); 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching with token:', token); // Debug log

        const response = await axios.get(`${BACKEND}/api/getProfile/${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const { username, bio, profilePic } = response.data;
        setUsername(username);
        setBio(bio);
        if (profilePic) {
            setProfilePicUrl(`data:image/jpeg;base64,${profilePic}`);
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
  const toggleModal = () => {
    setIsOpen(!isOpen); // Toggle view profile modal
  };

  const toggleEditModal = () => {
    setIsEditOpen(!isEditOpen); // Toggle edit profile modal
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    setProfilePic(file); // Set selected profile picture file
    setProfilePicName(file ? file.name : ""); // Set selected profile picture name
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append("walletAddress", walletAddress);
    formData.append("username", username);
    formData.append("bio", bio);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const response = await axios.post(`${BACKEND}/api/updateProfile`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      alert("Profile changes saved!");
      toggleEditModal(); // Close the edit modal
      fetchUserData(); // Fetch updated user data
    } catch (error) {
      console.error("Error uploading profile data:", error);
      alert("Failed to save profile changes.");
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>

          <div className="text-center">
            <img
              className="w-24 h-24 mx-auto mb-4 rounded-full"
              src={profilePicUrl || "https://via.placeholder.com/150"}
              alt="Profile"
            />
            <h2 className="mb-2 text-xl font-bold text-black">{username}</h2>
            <p className="mb-2 text-black">
              Wallet Address: <span className="text-gray-700">{walletAddress}</span>
            </p>
            <p className="mb-2 text-black">
              Bio: <span className="text-gray-700">{bio}</span>
            </p>
            <button
              className="px-4 py-2 text-white bg-green-500 rounded"
              onClick={toggleEditModal} // Show edit modal when clicked
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-end">
              <button
                onClick={toggleEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-black text">Edit Profile</h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 mb-4 text-black bg-white border border-gray-300 rounded"
                placeholder="Enter new username"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 mb-4 text-black bg-white border border-gray-300 rounded"
                placeholder="Enter new bio"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="w-full px-3 py-2 mb-4"
              />
              {profilePicName && (
                <p className="mb-4 text-gray-600">Selected file: {profilePicName}</p>
              )}
              <button
                className="px-4 py-2 mr-2 text-white bg-green-500 rounded"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded"
                onClick={toggleEditModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;