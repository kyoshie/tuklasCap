import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { BACKEND } from "../../constant";
import { FaCheckCircle } from "react-icons/fa";

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

const CONTRACT_ADDRESS = "0x9EA0B72072E030C7c607e045D2aC383B5118fd20";
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_adminWallet",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721InvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC721InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "artId",
        type: "uint256",
      },
    ],
    name: "ArtApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "artId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "ArtListedForSale",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "artId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "artist",
        type: "address",
      },
    ],
    name: "ArtMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "artId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "pricePaid",
        type: "uint256",
      },
    ],
    name: "ArtSold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "artId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "artist",
        type: "address",
      },
    ],
    name: "ArtSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_fromTokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_toTokenId",
        type: "uint256",
      },
    ],
    name: "BatchMetadataUpdate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "EtherReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "MetadataUpdate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "adminWallet",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_artId",
        type: "uint256",
      },
    ],
    name: "approveAndMintArt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "artCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "artPieces",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "address payable",
        name: "artist",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "resalePrice",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isApproved",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isSold",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isMinted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_artId",
        type: "uint256",
      },
    ],
    name: "buyArt",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_artId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
    ],
    name: "listArtForSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_title",
        type: "string",
      },
      {
        internalType: "string",
        name: "_uri",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    name: "submitArt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
const Marketplace = () => {
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND}/api/arts/marketplace`);

      if (response.data.success) {
        setMarketplaceItems(response.data.listings);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch marketplace items");
      }
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      setError(
        error.response?.data?.message || "Failed to load marketplace data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAccounts = async () => {
      if (window.ethereum) {
        try {
          const accs = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccounts(accs);
        } catch (error) {
          console.error("Error getting accounts:", error);
        }
      }
    };

    getAccounts();
    fetchMarketplaceData();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (newAccounts) => {
        setAccounts(newAccounts);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", setAccounts);
      }
    };
  }, []);

  const handleCancelListing = async (marketplaceId) => {
    try {
      const token = localStorage.getItem("token");
      setCancellingId(marketplaceId);

      const currentAccount = accounts[0];
      if (!currentAccount) {
        alert("Please connect your wallet first");
        return;
      }

      if (!window.confirm("Are you sure you want to cancel this listing?")) {
        return;
      }

      const response = await axios.delete(
        `${BACKEND}/api/arts/marketplace/cancel/${marketplaceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { walletAddress: currentAccount.toLowerCase() },
        },
      );

      if (response.data.success) {
        alert("Listing cancelled successfully!");
        setMarketplaceItems((prev) =>
          prev.filter((item) => item.id !== marketplaceId),
        );
        navigate("/gallery");
      } else {
        throw new Error(response.data.message || "Failed to cancel listing");
      }
    } catch (error) {
      console.error("Error cancelling listing:", error);
      alert(
        "Failed to cancel listing: " +
        (error.response?.data?.message || error.message),
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleBuy = async (itemId, price, marketplaceId) => {
    try {
      setProcessingId(itemId);
      if (!window.ethereum) {
        alert(
          "MetaMask is not installed. Please install it to use this feature.",
        );
        return;
      }
      const currentAccount = accounts[0];
      if (!currentAccount) {
        alert("Please connect your wallet first");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const value = ethers.parseEther(price.toString());
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      console.log("Transaction details:", {
        itemId,
        value: value.toString(),
        gasPrice: gasPrice.toString(),
        contract: CONTRACT_ADDRESS,
        signer: await signer.getAddress(),
      });
      const tx = await contract.buyArt(itemId, {
        value: value,
        gasLimit: ethers.getBigInt(300000),
        gasPrice: gasPrice,
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      if (!receipt.hash) {
        throw new Error(
          "Transaction hash is missing, purchase might have failed.",
        );
      }

      console.log("Purchase successful:", receipt.hash);
      try {
        const token = localStorage.getItem("token");
        const backendResponse = await axios.post(
          `${BACKEND}/api/arts/marketplace/buy/${marketplaceId}`,
          {
            walletAddress: currentAccount.toLowerCase(),
            transactionHash: receipt.hash,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Backend update response:", backendResponse.data);

        if (backendResponse.data.success) {
          alert("NFT purchased successfully!");
          fetchMarketplaceData();
        } else {
          throw new Error(
            backendResponse.data.message || "Failed to update backend",
          );
        }
      } catch (backendError) {
        console.error("Backend update failed:", backendError);
        alert(
          "Transaction successful but failed to update database. Please contact support.",
        );
      }
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      let errorMessage = "Failed to purchase NFT: ";
      if (error.code === "ACTION_REJECTED") {
        errorMessage += "Transaction was rejected by user";
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage += "Insufficient funds for purchase";
      } else {
        errorMessage += error.message || "Unknown error occurred";
      }
      alert(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (price) => (
    <span className="text-sm font-medium text-gray-200">
      {Number(price).toFixed(3)} ETH
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-xl text-white">Loading marketplace items...</p>
      </div>
    );
  }

  return (
    <div className="h-[90dvh] w-screen lg:items-center md:items-center md:flex  border-gray-700  md:flex-wrap md:justify-center grid grid-cols-2 overflow-y-auto md:overflow-y-scroll gap-2">
      {error && (
        <div className="w-full p-4 text-center text-red-600 bg-red-100 rounded">
          {error}
        </div>
      )}

      {marketplaceItems && marketplaceItems.length > 0 ? (
        marketplaceItems.map((item) => {
          const isOwner =
            accounts[0]?.toLowerCase() ===
            item.artwork.artistWallet?.toLowerCase();

          return (
            <div
              key={item.id}
              className="md:w-[19rem] h-min m-1 transition-transform duration-300 bg-transparent border group border-gray-500 hover:border-amber-500/50  hover:shadow-xl hover:shadow-amber-500/10  rounded-lg"
            >
              <img
                src={`https://gateway.pinata.cloud/ipfs/${item.artwork.imageCID}`}
                alt={item.artwork.title}
                className="w-[30rem] h-[20rem] object-cover rounded-t-lg md:h-[15rem] aspect-square"
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
              <div className="p-4">
                <h3 className="flex items-start text-lg font-bold text-center text-white transition-colors font-oxygen group-hover:text-amber-500">
                  {item.artwork.title}
                </h3>
                <p className="flex items-start mb-2 text-center text-white lg:text-center">
                  {item.artwork.description}
                </p>
                <div className="flex items-start mb-2 text-center text-white ">
                  <p className="flex items-center justify-center text-sm text-gray-300">
                    @{item.artwork.artist}{" "}
                    {item.artwork.artistApproved && (
                      <FaCheckCircle
                        className="ml-1 text-amber-400 "
                        title="Verified Artist"
                      />
                    )}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col items-start ">
                    <label>Price</label>
                    {getStatusBadge(item.price)}
                  </div>
                  {isOwner ? (
                    <button
                      className={`bg-red-500 w-[7rem] text-white justify-center rounded-md shadow-md text-center hover:bg-red-600 transition-all h-[3rem] first-line:p-2 font-customFont
                        ${cancellingId === item.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleCancelListing(item.id)}
                      disabled={cancellingId === item.id}
                    >
                      {cancellingId === item.id
                        ? "Cancelling..."
                        : "Cancel List"}
                    </button>
                  ) : (
                    <button
                      className={`bg-amber-500 hover:bg-amber-600 w-[7rem] text-white justify-center rounded-md shadow-md text-center  transition-all h-[3rem] font-customFont
                        ${processingId === item.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        handleBuy(item.tokenId, item.price, item.id)
                      }
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Buying..." : "Buy Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-xl text-white">
            No NFTs available in the marketplace.
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
