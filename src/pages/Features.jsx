import React from "react";
import { WalletIcon, BrushIcon, ShieldCheckIcon, ZapIcon } from "lucide-react"; // Assuming you're using lucide-react for icons

const Features = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[--background]">
      <main className="flex-1">
        <section className="w-full py-12 text-center md:py-24 lg:py-32">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl">
              NFT Marketplace Features
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-gray-400 md:text-xl">
              Discover the powerful features that make our NFT marketplace stand out.
            </p>
          </div>
        </section>
        <section className="w-full py-12 bg-gray-100 md:py-24 lg:py-32 bg-[--background]">
          <div className="container mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <WalletIcon className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold">Easy Trading</h3>
                <p className="text-gray-600">
                  Buy and sell NFTs with ease using our intuitive interface and secure wallet integration.
                </p>
              </div>
              <div className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <BrushIcon className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold">Create & Mint</h3>
                <p className="text-gray-600">
                  Turn your digital creations into NFTs effortlessly with our simple minting process.
                </p>
              </div>
              <div className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold">Secure Transactions</h3>
                <p className="text-gray-600">
                  Enjoy peace of mind with our advanced security measures ensuring safe transactions.
                </p>
              </div>
              <div className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <ZapIcon className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold">Low Fees</h3>
                <p className="text-gray-600">
                  Benefit from our competitive, low-fee structure to maximize your trading potential.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 text-center md:py-24 lg:py-32">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Ready to dive in?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-gray-400 md:text-xl">
              Join our vibrant NFT community today and start exploring the world of digital collectibles.
            </p>
            <button className="px-6 py-3 mt-6 text-lg font-semibold text-white transition-colors bg-blue-600 rounded hover:bg-blue-700">
              Get Started
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
