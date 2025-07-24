import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND } from "../../constant";
import Modal from "../Modal";

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

const KycTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectValidId, setSelectValidId] = useState("");
  const [isInformationModalOpen, setIsInformationModalOpen] = useState(false);
  const [selectUser, setSelectUser] = useState("");
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");



  useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`${BACKEND}/api/verify/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setSubmissions(response.data.data);
      } else {
        setError("Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions", error);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId, isApproved) => {
    if (!isApproved) {
      setSelectValidId(kycId);
      setIsRejectionModalOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await api.patch(`/api/verify/approve/${kycId}`,
        {
          approved: isApproved,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.kycId === kycId ? { ...sub, status: "approved" } : sub
          )
        );
        setTimeout(() => {
          setSubmissions((prev) => prev.filter((sub) => sub.kycId !== kycId));
        }, 2000);

        alert("Submission approved successfully!");
      } else {
        alert(response.data.message || "Error approving submission.");
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await api.patch(`/api/verify/approve/${selectValidId}`,
        {
          approved: false,
          reason: rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setSubmissions((prev) => prev.filter((sub) => sub.kycId !== selectValidId))
        setIsRejectionModalOpen(false);
        setSelectValidId(null);
        setRejectionReason("");
        alert("Submission rejected successfully");
      }
    }
    catch (error) {
      console.error("Error rejecting submission:", error);
      alert(error.response?.data?.message || "Failed to reject submission");

    }
  }

  if (loading) return <div>Loading submissions...</div>;
  if (error) return <div>Error: {error}</div>;

  const openImageModal = (validId) => {
    setSelectValidId(validId);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectValidId("");
  };

  const openInformationModal = (information) => {
    setSelectUser(information);
    setIsInformationModalOpen(true);
  };

  const closeInformationModal = () => {
    setIsInformationModalOpen(false);
    setSelectUser("");
  };

  const closeRejectionModal = () => {
    setIsRejectionModalOpen(false);
    setSelectValidId(null);
    setRejectionReason("")
  }
  return (
    <div className="w-full p-4 overflow-x-auto">
      {submissions.length == 0 ? (
        <div className="flex items-center justify-center w-full p-8">
          <div className="text-lg text-gray-500">
            No pending submissions to review
          </div>
        </div>
      ) : (
        <table className="min-w-full text-center border-collapse">
          <thead>
            <tr className="text-lg font-bold text-black bg-gray-100">
              <th>Name</th>
              <th>Valid ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.kycId}>
                <td className="px-4 py-2 text-gray-500">
                  <button
                    onClick={() =>
                      openInformationModal(
                        submission.firstName,
                        submission.middleName,
                        submission.lastName,
                      )
                    }
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    {submission.firstName} {submission.lastName}
                  </button>
                </td>
                <td className="px-4 py-2 ">
                  <button
                    onClick={() => openImageModal(submission.validIdPhoto)}
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    View Image
                  </button>
                </td>
                <td className="px-4 py-2 ">
                  <button
                    onClick={() => handleApprove(submission.kycId, true)}
                    className="px-4 py-1 mr-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(submission.kycId), false
                    }}
                    className="px-4 py-1 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
      }

      {
        isImageModalOpen && (
          <Modal onClose={closeImageModal}>
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <img
                src={`data:image/jpeg;base64,${selectValidId}`}
                alt="Artwork Preview"
                className="max-h-[60vh] w-auto object-contain rounded-lg"
                onError={(e) => {
                  console.error("Error loading image:", selectValidId);
                  e.target.src = "/placeholder.png";
                }}
              />
            </div>
          </Modal>
        )
      }

      {
        isInformationModalOpen && (
          <Modal onClose={closeInformationModal}>
            <div className="w-[30rem] h-[20rem]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-bold text-black">
                    Personal Information
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Personal Details and Information
                  </p>
                </div>

                {submissions.map((submission) => (
                  <div
                    className="flex flex-col w-full gap-2 p-2 border border-gray-300 rounded"
                    key={submission.kycId}
                  >
                    <div className="flex flex-col gap-1 ">
                      <label className="text-sm text-gray-500">Full Name</label>
                      <p className="text-black">
                        {submission.firstName} {submission.middleName}{" "}
                        {submission.lastName}
                      </p>
                    </div>
                    <div className="flex">
                      <div className="flex flex-col gap-1 w-[50%]">
                        <label className="text-sm text-gray-500">Birthdate</label>
                        <p className="text-black">
                          {new Date(submission.birthDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}{" "}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 w-[50%]">
                        <label className="text-sm text-gray-500">
                          Birthplace
                        </label>
                        <p className="text-black">{submission.birthPlace}</p>
                      </div>
                      <div className="flex flex-col gap-2"></div>
                    </div>

                    <div className="flex">
                      <div className="flex flex-col gap-1 w-[50%]">
                        <label className="text-sm text-gray-500">Gender</label>
                        <p className="text-black">{submission.gender}</p>
                      </div>

                      <div className="flex flex-col gap-1 w-[50%]">
                        <label className="text-sm text-gray-500">
                          Municipality
                        </label>
                        <p className="text-black">{submission.municipality}</p>
                      </div>
                      <div className="flex flex-col gap-2"></div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-500">Address</label>
                      <p className="text-black">{submission.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )
      }

      {
        isRejectionModalOpen && (
          <Modal onClose={closeRejectionModal}>
            <div className="p-6 bg-white rounded-lg shadow-lg w-96">
              <h2 className="mb-4 text-xl font-bold text-black">Reject Submission</h2>
              <p className="mb-4 text-black">
                Please provide a reason for rejecting this Submission:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this artwork is being rejected..."
                className="w-full h-32 p-2 mb-4 text-black bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        )
      }

    </div >
  );
};

export default KycTable;
