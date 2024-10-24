import React, { useState, useEffect } from "react";
import axios from "axios";

function CreateNFT() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      const storedWalletAddress = localStorage.getItem('walletAddress');
      if (storedWalletAddress) {
        // Verify the connection is still active
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts[0]?.toLowerCase() === storedWalletAddress.toLowerCase()) {
              setWalletAddress(storedWalletAddress);
            } else {
              // If the connected account doesn't match stored address, redirect
              window.location.href = '/';
            }
          } catch (error) {
            console.error("Error verifying wallet connection:", error);
            window.location.href = '/';
          }
        }
      } else {
        window.location.href = '/';
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
        } else {
          window.location.href = '/';
        }
      });
    }

    return () => {
      // Cleanup listener
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!image) {
      setError("Please select an image.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("walletAddress", walletAddress);

      const response = await axios.post("http://localhost:5000/api/arts/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setTitle("");
        setDescription("");
        setPrice("");
        setImage(null);
        setImageName("");
        alert("NFT created successfully!");
      } else {
        throw new Error(response.data.message || "Failed to create NFT");
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      setError(error.response?.data?.message || "Failed to create NFT. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] w-full md:fixed bg-[--background] md:overflow-auto md:justify-center md:items-start md:flex">
      <div className="max-w-md p-6 mx-4 align-middle bg-white rounded-lg shadow-md md:w-[900px] md:my-6">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-900 md:text-center md:mb-3">
          Create New NFT
        </h2>
        
        {/* Display wallet address */}
        {walletAddress && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700 md:text-xl" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-gray-900 bg-white border border-gray-300 rounded shadow appearance-none focus:outline-none focus:shadow-outline focus:border-indigo-500 md:w-[100%]"
              placeholder="Enter NFT title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700 md:text-xl" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-gray-900 bg-white border border-gray-300 rounded shadow appearance-none focus:outline-none focus:shadow-outline focus:border-indigo-500"
              placeholder="Enter NFT description"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700 md:text-xl" htmlFor="price">
              Price (ETH)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-gray-900 bg-white border border-gray-300 rounded shadow appearance-none focus:outline-none focus:shadow-outline focus:border-indigo-500"
              placeholder="Enter NFT price"
              step="0.001"
              min="0.000"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="image">
              Upload Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              required
            />
            {imageName && (
              <div className="p-2 mt-2 border border-gray-200 rounded bg-gray-50">
                <p className="text-sm text-gray-700">
                  Selected file: <span className="font-semibold">{imageName}</span>
                </p>
              </div>
            )}
          </div>
          <button
            type="submit"
            className={`w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:shadow-outline ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create NFT"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNFT;