import { WalletIcon, BrushIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";

const Features = () => {
  return (
    <div className="no-scrollbar flex flex-col min-h-screen  bg-[--background]">
      <main className="flex-1">
        <section className="w-full py-2 text-center md:py-2 ">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-6xl">
              TUKLAS ART GALLERY FEATURES
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-gray-400 md:text-xl">
              Discover the powerful features that make our NFT marketplace stand out.
            </p>
          </div>
        </section>
        <section className="w-full py-12  md:px-40 bg-[--background] flex justify-center items-center">
          <div className="container mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <div className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <WalletIcon className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold">Easy Transactions</h3>
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
                <h3 className="text-lg font-semibold">Admin Approval</h3>
                <p className="text-gray-600">
                  Admins review every submitted artwork and have the authority to approve or decline pieces based on platform standards.
                </p>
              </div>
              <div className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg">
                <ZapIcon className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-semibold">Marketplace Art Discovery</h3>
                <p className="text-gray-600">
                  Benefit from our competitive, low-fee structure to maximize your potential.                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full text-center md:py-10">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Ready to dive in?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-gray-400 md:text-xl">
              Join our vibrant NFT community today and start exploring the world of digital collectibles.
            </p>
            <a href="/">
              <button className="p-2 w-[10rem] mt-2 text-lg font-semibold text-white transition-colors bg-blue-600 rounded hover:bg-blue-700">
                Get Started
              </button>
            </a>

          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
