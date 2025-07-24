import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../Modal";
import { BACKEND } from "../../constant";

const api = axios.create({
  baseURL: BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const Table = () => {
  const [artworks, setArtworks] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedImageCID, setSelectedImageCID] = useState("");
  const [selectedArtworkId, setSelectedArtworkId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingArtworks();
  }, []);

  const fetchPendingArtworks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND}/api/admin/artworks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched artworks:", response.data);

      if (response.data.success) {
        setArtworks(response.data.artworks);
      } else {
        setError("Failed to fetch artworks");
      }
    } catch (error) {
      console.error("Error fetching artworks:", error);
      setError("Failed to load artworks");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (dbId, isApproved) => {
    if (!isApproved) {
      setSelectedArtworkId(dbId);
      setIsRejectionModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const adminId = 4;

      const response = await axios.patch(
        `${BACKEND}/api/admin/approve/${dbId}`,
        {
          approved: isApproved,
          adminId: adminId,
          reason: "Artwork meets guidelines",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setArtworks((prevArtworks) =>
          prevArtworks.filter((art) => art.dbId !== dbId),
        );
        alert("Artwork approved successfully!");
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      alert(error.response?.data?.message || "Failed to update artwork status");
    } finally {
      setLoading(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const adminId = 4;

      const response = await axios.patch(`${BACKEND}/api/admin/approve/${selectedArtworkId}`,
        {
          approved: false,
          adminId: adminId,
          reason: rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setArtworks((prevArtworks) =>
          prevArtworks.filter((art) => art.dbId !== selectedArtworkId),
        );

        setIsRejectionModalOpen(false);
        setSelectedArtworkId(null);
        setRejectionReason("");

        alert("Artwork rejected successfully");
      }
    } catch (error) {
      console.error("Error rejecting artwork:", error);
      alert(error.response?.data?.message || "Failed to reject artwork");
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (cid) => {
    setSelectedImageCID(cid);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageCID("");
  };

  const closeRejectionModal = () => {
    setIsRejectionModalOpen(false);
    setSelectedArtworkId(null);
    setRejectionReason("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full p-8">
        <div className="text-lg text-gray-600">Loading artworks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full p-8">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 overflow-x-auto">
      {artworks.length === 0 ? (
        <div className="flex items-center justify-center w-full p-8">
          <div className="text-lg text-gray-500">
            No pending artworks to review
          </div>
        </div>
      ) : (
        <table className="w-full text-center border-collapse table-auto">
          <thead>
            <tr className="text-lg font-bold text-black bg-gray-100">
              <th className="p-3">Database ID</th>
              <th className="p-3">Contract ID</th>
              <th className="p-3">Preview</th>
              <th className="p-3">Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">Artist</th>
              <th className="p-3">Price (ETH)</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((art) => (
              <tr key={art.dbId} className="border-b hover:bg-gray-50">
                <td className="p-3">{art.dbId}</td>
                <td className="p-3">{art.contractId}</td>
                <td className="p-3">
                  <button
                    onClick={() => openImageModal(art.imageCID)}
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    View Image
                  </button>
                </td>
                <td className="p-3">{art.title}</td>
                <td className="p-3">{art.description}</td>
                <td className="p-3">
                  {art.artist || art.owner?.username || "Anonymous"}
                </td>
                <td className="p-3 text-[--orange]">
                  {Number(art.price).toFixed(3)}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="px-4 py-1 text-white transition-colors bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                      onClick={() => handleApproval(art.dbId, true)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-1 text-white transition-colors bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                      onClick={() => handleApproval(art.dbId, false)}
                      disabled={loading}
                    >
                      Decline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Image Preview Modal */}
      {isImageModalOpen && (
        <Modal onClose={closeImageModal}>
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <img
              src={`https://gateway.pinata.cloud/ipfs/${selectedImageCID}`}
              alt="Artwork Preview"
              className="max-h-[60vh] w-auto object-contain rounded-lg"
              onError={(e) => {
                console.error("Error loading image:", selectedImageCID);
                e.target.src = "/placeholder.png";
              }}
            />
          </div>
        </Modal>
      )}

      {/* Rejection Reason Modal */}
      {isRejectionModalOpen && (
        <Modal onClose={closeRejectionModal}>
          <div className="p-6 bg-white rounded-lg shadow-lg w-96">
            <h2 className="mb-4 text-xl font-bold">Reject Artwork</h2>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting this artwork:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this artwork is being rejected..."
              className="w-full h-32 p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeRejectionModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                disabled={loading}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Table;
