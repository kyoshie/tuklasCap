import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfileModal = ({ walletAddress, closeModal }) => {
  const [isOpen, setIsOpen] = useState(false); // State for viewing profile modal
  const [isEditOpen, setIsEditOpen] = useState(false); // State for editing profile modal
  const [username, setUsername] = useState(""); // Username state
  const [bio, setBio] = useState(""); // Bio state
  const [profilePic, setProfilePic] = useState(null); // Profile picture state
  const [profilePicUrl, setProfilePicUrl] = useState(""); // Profile picture URL state

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/getProfile/${walletAddress}`);
      const { username, bio, profilePic } = response.data;
      setUsername(username);
      setBio(bio);
      if (profilePic) {
        setProfilePicUrl(`data:image/jpeg;base64,${profilePic}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen); // Toggle view profile modal
  };

  const toggleEditModal = () => {
    setIsEditOpen(!isEditOpen); // Toggle edit profile modal
  };

  const handleProfilePicChange = (event) => {
    setProfilePic(event.target.files[0]); // Set selected profile picture file
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
      const response = await axios.post("http://localhost:5000/api/updateProfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
              Wallet Address: {walletAddress}
            </p>
            <p className="mb-4 text-gray-600">{bio}</p>
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
              <h2 className="mb-4 text-xl font-bold">Edit Profile</h2>
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