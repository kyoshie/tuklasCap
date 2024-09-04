import React, { useState } from "react";

function CreateNFT() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
   
  };

  return (
    <div className="h-[100vh] w-full md:fixed bg-[--background] overflow-hidden md:overflow-hidden md:justify-center md:items-start md:flex">
      <div className= "max-w-md p-6 mx-4 align-middle bg-white rounded-lg shadow-md md:w-[900px] md:my-6">
      <h2 className="mb-6 text-3xl font-bold text-center text-black md:text-center md:mb-3">Create New NFT</h2>
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
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline md:w-[100%]"
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
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
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
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              placeholder="Enter NFT price"
              step="0.001" // Set the step value to 0.01
              min="0.000" // Set the minimum value to 0.00
              required
            />
          </div>
          <div className="mb-4 ">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="image">
              Upload Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              required
            />
          </div>
          {image && (
            <div className="mb-4">
              <img src={image} alt="Preview" className="w-full h-auto rounded-lg" />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:shadow-outline"
          >
            Create NFT
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNFT;