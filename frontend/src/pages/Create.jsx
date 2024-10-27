import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this import

function CreateNFT() {
  const navigate = useNavigate(); // Add navigation hook
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
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts[0]?.toLowerCase() === storedWalletAddress.toLowerCase()) {
              setWalletAddress(storedWalletAddress);
            } else {
              navigate('/');
            }
          } catch (error) {
            console.error("Error verifying wallet connection:", error);
            navigate('/');
          }
        }
      } else {
        navigate('/');
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
        } else {
          navigate('/');
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size must be less than 10MB");
        return;
      }
      setImage(file);
      setImageName(file.name);
      setError(""); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      // Validate price
      if (isNaN(price) || parseFloat(price) <= 0) {
        throw new Error("Please enter a valid price");
      }

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
        // Show success message
        alert("Artwork created successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setPrice("");
        setImage(null);
        setImageName("");
        
        // Navigate to gallery
        navigate('/gallery');
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
        
        {walletAddress && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 md:text-xl" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-gray-900 bg-white border border-gray-300 rounded shadow appearance-none focus:outline-none focus:shadow-outline focus:border-indigo-500"
              placeholder="Enter NFT description"
              rows={4}
              maxLength={1000}
              required
            />
          </div>

          <div>
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
              min="0.001"
              required
            />
          </div>

          <div>
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
            className={`w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:shadow-outline ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
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