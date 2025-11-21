
const About = () => {
  return (
    <div className="flex justify-center py-16 ">
      <div className="w-full max-w-3xl p-8 text-center bg-gray-700 shadow-lg bg-opacity-80 backdrop-blur-md rounded-xl md:p-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white md:text-4xl xl:text-6xl">
            What is <span className="text-[--orange]">Tuklas?</span>
          </h1>
        </div>
        <p className="text-base font-medium leading-relaxed text-white md:text-2xl text-balance">
          Tuklas is a Filipino word that means <span className="text-[--orange]">Discover</span> in English.
          This website is meant to bring opportunity for different artists from Batangas to showcase their artwork and potentially get discovered.
          That is the reason why the website is called <span className="text-[--orange]">Tuklas Art Gallery</span> or simply <span className="text-[--orange]">Tuklas.</span>
        </p>
      </div>
    </div>
  );
};

export default About;
