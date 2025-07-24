import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BACKEND } from "../constant";
import { CircleAlert } from "lucide-react";

const municipalities = [
  "Agoncillio",
  "Alitagtag",
  "Balayan",
  "Balete",
  "Batangas City",
  "Bauan",
  "Calaca",
  "Calatagan",
  "Cuenca",
  "Ibaan",
  "Laurel",
  "Lian",
  "Lipa",
  "Lobo",
  "Mabini",
  "Malvar",
  "Mataas na Kahoy",
  "Nasugbu",
  "Padre Garcia",
  "Rosario",
  "San Jose",
  "San Juan",
  "San Luis",
  "San Nicolas",
  "San Pascual",
  "Santa Teresita",
  "Santo Tomas",
  "Taal",
  "Talisay",
  "Tanauan",
  "Taysan",
  "Tingloy",
  "Tuy",
];

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
  (error) => Promise.reject(error)
);

const Verify = () => {
  const walletAddress = localStorage.getItem("walletAddress");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    photo: null,
    validIdPhoto: null,
    gender: "",
    municipality: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(
          `${BACKEND}/api/verify/verifiedStatus?walletAddress=${walletAddress}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success && response.data.data) {
          setKycStatus(response.data.data.status);
          setRejectionReason(response.data.data.rejectionReason || "");
        }
      } catch (err) {
        console.error("Error fetching KYC status", err);
      }
    };

    if (walletAddress) {
      fetchKycStatus();
    }
  }, [walletAddress]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      birthDate: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("middleName", formData.middleName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("birthDate", formData.birthDate);
    formDataToSend.append("birthPlace", formData.birthPlace);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("validIdPhoto", formData.validIdPhoto);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("municipality", formData.municipality);
    formDataToSend.append("walletAddress", walletAddress);

    try {
      console.log("Sending request to backend");
      const response = await api.post("/api/verify/submit-kyc", formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response received", response);
      alert("KYC information submitted successfully for review!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error submitting KYC information.";
      alert(errorMessage);
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4 bg-[#222831]  ">
      <div className="flex flex-col mb-2 text-center ">
        <h2 className="text-3xl font-bold text-center text-white ">
          Information Verification
        </h2>
        <p>Please verify your account here!</p>
      </div>
      <div className="p-4 rounded-lg shadow-lg bg-gray-800/50 border border-gray-700 w-[50rem]">
        {kycStatus === "rejected" && (
          <div className="flex gap-2 p-3 mb-4 text-red-700 bg-red-200 border border-red-400 rounded w-ful">
            <CircleAlert />Your KYC submission was rejected:{" "}
            <strong>{rejectionReason || "No reason provided"}</strong>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="flex w-full gap-2">
            <div className="flex flex-col w-full">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-200">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-200">
                Middle Name
              </label>
              <input
                type="text"
                placeholder="Enter middle name"
                name="middleName"
                id="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-200">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Enter last name"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="birthPlace" className="text-sm font-medium text-gray-200">
              Birth Place
            </label>
            <input
              type="text"
              placeholder="Enter birth place"
              name="birthPlace"
              id="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex w-full gap-2">
            <div className="flex flex-col w-full">
              <label
                htmlFor="birthDate"
                className="text-sm font-medium text-gray-200"
              >
                Birth Date
              </label>
              <ReactDatePicker
                selected={
                  formData.birthDate ? new Date(formData.birthDate) : null
                }
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                showYearDropdown
                dropdownMode="select"
                className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded w-ful focus:ring-indigo-500 focus:border-indigo-500"
                placeholderText="Select birth date"
                required
              />
            </div>
            <div className="flex flex-col w-full">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-gray-200"
              >
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled className="text-muted-foreground">
                  <p className="text-muted-foreground">Select your gender</p>
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col w-full">
              <label htmlFor="address" className="text-sm font-medium text-gray-200">
                Address
              </label>
              <input
                type="text"
                placeholder="Enter address"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex flex-col w-full">
              <label
                htmlFor="municipality"
                className="text-sm font-medium text-gray-200 "
              >
                Municipality
              </label>
              <select
                name="municipality"
                id="municipality"
                value={formData.municipality}
                onChange={handleChange}
                className="w-full p-2 mt-1 text-black bg-white border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>
                  Select your municipality
                </option>
                {municipalities.map((muni) => (
                  <option key={muni} value={muni}>
                    {muni}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="validIdPhoto" className="block text-sm font-medium text-gray-200">
              Valid ID Photo
            </label>
            <input
              type="file"
              name="validIdPhoto"
              id="validIdPhoto"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end mt-4 space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verify;
