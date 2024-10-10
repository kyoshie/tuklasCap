import React, { useState } from "react";

const ProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
   
      <button
        onClick={toggleModal}
        className="px-4 py-2 text-white bg-blue-500 rounded"
      >
        View Profile
      </button>

   
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
         
            <div className="flex justify-end">
              <button
                onClick={toggleModal}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

       
            <div className="text-center">
            
              <img
                className="w-24 h-24 mx-auto mb-4 rounded-full"
                src="https://via.placeholder.com/150" 
                alt="Profile"
              />
           
              <h2 className="mb-2 text-xl font-bold">Username</h2>
        
              <p className="mb-2 text-gray-600">Wallet Address: 0x123...456</p>
           
              <p className="mb-4 text-gray-600">This is the user's bio...</p>
         
              <button
                className="px-4 py-2 text-white bg-green-500 rounded"
                onClick={() => alert("Edit Profile Clicked")}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
