import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND } from "../../constant";
import { useNavigate } from "react-router-dom";

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

const GalleryCards = () => {
  const navigate = useNavigate();
  const [galleryData, setGalleryData] = useState({
    created: [],
    purchased: [],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState("created");
  const [relistingId, setRelistingId] = useState(null);

  const fetchGalleryData = useCallback(async () => {
    try {
      setLoading(true);
      const walletAddress = localStorage.getItem("walletAddress");
      const token = localStorage.getItem("token");

      if (!walletAddress || !token) {
        setError("Please connect your wallet");
        return;
      }

      const response = await axios.get(
        `${BACKEND}/api/arts/fetch/${walletAddress}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        const transformedArtworks = {
          ...response.data.artworks,
          created: response.data.artworks.created.map((artwork) => {
            return {
              ...artwork,
              isListed: Boolean(artwork),
              rejectionReason:
                artwork.approval?.status === "rejected"
                  ? artwork.approval?.reason || "No reason provided"
                  : null,
            };
          }),
        };
        setGalleryData(transformedArtworks);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch artworks");
      }
    } catch (error) {
      console.error("Error details:", error);
      if (error.response?.status === 403) {
        navigate("/");
      }
      setError(error.response?.data?.message || "Failed to load gallery data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchGalleryData();
  }, [fetchGalleryData]);

  useEffect(() => {
    const handleFocus = () => {
      fetchGalleryData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchGalleryData]);

  const isOwner = (artwork) => {
    const currentWallet = localStorage.getItem("walletAddress");
    return currentWallet?.toLowerCase() === artwork.ownerWallet?.toLowerCase();
  };

  const handleSell = async (dbId) => {
    try {
      setProcessingId(dbId);
      const walletAddress = localStorage.getItem("walletAddress");
      const token = localStorage.getItem("token");

      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      const response = await axios.put(
        `${BACKEND}/api/arts/approval/${dbId}`,
        { walletAddress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        alert("Artwork submitted for approval successfully!");
        setGalleryData((prevData) => ({
          ...prevData,
          created: prevData.created.map((card) =>
            card.dbId === dbId
              ? {
                ...card,
                pendingApproval: true,
                approvalStatus: "pending",
              }
              : card,
          ),
        }));
      }
    } catch (error) {
      console.error("Error submitting for approval:", error);
      alert(
        error.response?.data?.message ||
        "Failed to submit artwork for approval",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleBuy = async (artwork) => {
    if (isOwner(artwork)) {
      alert("You cannot purchase your own artwork");
      return;
    }
  };

  const getStatusBadge = (artwork) => {
    if (artwork.isSold)
      return (
        <div className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-200 rounded-full md:px-3 md:py-1.5 md:text-sm">
          Sold
        </div>
      );

    if (artwork.isMinted && !isOwner(artwork))
      return (
        <div className="px-2 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full md:px-3 md:py-1.5 md:text-sm">
          Available
        </div>
      );

    if (artwork.isMinted && isOwner(artwork))
      return (
        <div className="px-2 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full md:px-3 md:py-1.5 md:text-sm">
          Minted
        </div>
      );

    if (artwork.approvalStatus === "rejected") {
      return (
        <div className="flex flex-col items-center gap-1 md:gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full shadow-sm md:gap-1.5 md:px-3 md:py-1.5 md:text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 md:w-4 md:h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Rejected
          </span>
          {artwork.rejectionReason && (
            <div className="w-full p-2 text-xs border border-red-200 rounded bg-red-50">
              <p className="font-medium text-red-800">Reason:</p>
              <p className="text-red-700">{artwork.rejectionReason}</p>
            </div>
          )}
        </div>
      );
    }

    if (artwork.pendingApproval)
      return (
        <div className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-full md:px-3 md:py-1.5 md:text-sm">
          Pending
        </div>
      );

    return null;
  };

  const handleRelist = async (artwork) => {
    try {
      const token = localStorage.getItem("token");
      setRelistingId(artwork.dbId);
      const walletAddress = localStorage.getItem("walletAddress");

      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      const response = await axios.post(
        `${BACKEND}/api/arts/marketplace/relist/${artwork.dbId}`,
        {
          walletAddress,
          price: artwork.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        setGalleryData((prevData) => ({
          ...prevData,
          created: prevData.created.map((card) =>
            card.dbId === artwork.dbId
              ? {
                ...card,
                isListed: true,
                marketplace: {
                  id: response.data.listing.id,
                  status: "LISTED",
                },
              }
              : card,
          ),
        }));
        alert("Artwork relisted successfully!");
        await fetchGalleryData();
        navigate("/marketplace");
      }
    } catch (error) {
      console.error("Error relisting artwork:", error);
      alert(error.response?.data?.message || "Failed to relist artwork");
    } finally {
      setRelistingId(null);
    }
  };

  const getSellButton = (item) => {
    if (item.isSold)
      return (
        <button
          className="w-full px-3 py-2 text-sm text-white bg-gray-500 rounded-md opacity-50 cursor-not-allowed font-customFont"
          disabled
        >
          Sold
        </button>
      );

    if (item.approvalStatus === "rejected") return null;

    if (item.isMinted && item.isApproved) {
      if (item.isListed && item.marketplace) {
        return (
          <button
            className="w-full px-3 py-2 text-sm text-white bg-gray-500 rounded-md opacity-50 cursor-not-allowed font-customFont"
            disabled
          >
            Minted
          </button>
        );
      } else {
        return (
          <button
            className={`bg-[--orange] w-full text-white rounded-md shadow-md text-sm hover:bg-[--orange-hover] transition-all px-3 py-2 font-customFont 
            ${relistingId === item.dbId ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleRelist(item)}
            disabled={relistingId === item.dbId}
          >
            {relistingId === item.dbId ? "Relisting..." : "Relist"}
          </button>
        );
      }
    }

    if (item.marketplace) {
      return (
        <button
          className="w-full px-3 py-2 text-sm text-white bg-gray-500 rounded-md opacity-50 cursor-not-allowed font-customFont"
          disabled
        >
          Listed
        </button>
      );
    }

    if (item.isMinted) {
      return (
        <button
          className="w-full px-3 py-2 text-sm text-white bg-gray-500 rounded-md opacity-50 cursor-not-allowed font-customFont"
          disabled
        >
          Minted
        </button>
      );
    }

    if (item.pendingApproval) {
      return (
        <button
          className="w-full px-3 py-2 text-sm text-white bg-gray-500 rounded-md opacity-50 cursor-not-allowed font-customFont"
          disabled
        >
          Pending
        </button>
      );
    }

    return (
      <button
        className={`bg-[--blue] w-full text-white rounded-md shadow-md text-sm hover:bg-[--blue-hover] transition-all px-3 py-2 font-customFont
        ${processingId === item.dbId ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => handleSell(item.dbId)}
        disabled={processingId === item.dbId}
      >
        {processingId === item.dbId ? "Processing..." : "Sell"}
      </button>
    );
  };

  const getBuyButton = (item) => {
    if (item.isSold) return null;

    if (isOwner(item)) {
      return (
        <button
          className="w-full px-3 py-2 text-sm text-white bg-gray-500 rounded-md opacity-50 cursor-not-allowed font-customFont"
          disabled
          title="You cannot buy your own artwork"
        >
          Your Artwork
        </button>
      );
    }

    return (
      <button
        className="bg-[--blue] w-full text-white rounded-md shadow-md text-sm hover:bg-[--blue-hover] transition-all px-3 py-2 font-customFont"
        onClick={() => handleBuy(item)}
      >
        Buy Now
      </button>
    );
  };

  const displayArtworks =
    activeTab === "created" ? galleryData.created : galleryData.purchased;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <p className="text-lg text-white">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          className={`px-4 py-2 rounded-lg transition-all text-sm md:text-base ${activeTab === "created"
            ? "bg-[--blue] text-white shadow-lg"
            : "bg-transparent text-white border border-[--blue] hover:bg-[--blue]/10"
            }`}
          onClick={() => setActiveTab("created")}
        >
          Created Artworks
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-all text-sm md:text-base ${activeTab === "purchased"
            ? "bg-[--blue] text-white shadow-lg"
            : "bg-transparent text-white border border-[--blue] hover:bg-[--blue]/10"
            }`}
          onClick={() => setActiveTab("purchased")}
        >
          Purchased Artworks
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-md p-4 mx-auto mb-6 text-center text-red-600 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayArtworks && displayArtworks.length > 0 ? (
          displayArtworks.map((item) => (
            <div
              key={item.dbId}
              className="overflow-hidden transition-all duration-300 border border-gray-600 shadow-lg bg-gray-800/50 backdrop-blur-sm rounded-xl hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10"
            >
              {/* Image Container */}
              <div className="relative">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${item.imageCID}`}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                  className="object-cover w-full h-48 md:h-56"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(item)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title and Description */}
                <div>
                  <h3 className="text-lg font-bold text-white font-oxygen group-hover:text-amber-500 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Price and Button */}
                <div className="flex items-end justify-between gap-3">
                  <div className="flex-1">
                    <label className="block mb-1 text-xs text-gray-400">Price</label>
                    <p className="text-white">
                      <span className="text-[--orange] font-bold text-lg">
                        {Number(item.price).toFixed(3)} ETH
                      </span>
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-24 min-w-0">
                    {activeTab === "created"
                      ? getSellButton(item)
                      : getBuyButton(item)}
                  </div>
                </div>

                {/* Artist Info for Purchased Tab */}
                {activeTab === "purchased" && (
                  <div className="pt-2 border-t border-gray-600">
                    <p className="text-xs text-gray-400">
                      Created by: <span className="text-white">{item.artist}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-20 col-span-full">
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                No Artworks Found
              </h3>
              <p className="text-gray-400">
                {activeTab === "created"
                  ? "You haven't created any artworks yet. Start creating to see them here!"
                  : "You haven't purchased any artworks yet. Browse the marketplace to find amazing pieces!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryCards;