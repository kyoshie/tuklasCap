import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faShoppingCart, faDollarSign, faPalette } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Link } from 'react-router-dom';

const Feature = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 mb-2 space-y-2 text-center bg-[--light-g] hover:bg-[--hover-g] transition-all ease-in rounded-lg drop-shadow-2xl">
      <div className="p-3 rounded-full bg-muted-foreground/10">
        <FontAwesomeIcon icon={icon} className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

const Component = () => {
  return (
    <section className="w-full py-6 text-white md:py-24  bg-[--background] h-screen overflow-y-hidden lg:fixed sm:overflow-hidden md:bg-[--background] md:h-[100vh] md:overflow-hidden  ">
      <div className="container grid items-center gap-6 px-4 md:ml-6 md:px-4 lg:grid-cols-1 lg:gap-10 2xl:ml-60 2xl:grid-cols-2 md:items-start ">
        <div className="space-y-4">
          <div className="space-y-2 ">
            <h5 className='text-[--orange] font-medium '>Features</h5>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Discovering, Creating, Owning arts in your hands.
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Experience a revolutionary art platform at Tuklas Art Gallery where you can discover, buy, and sell
              unique artworks using cutting-edge NFT technology and cryptocurrency transactions. Explore a seamless fusion
              of art and technology, empowering artists and art enthusiasts in the digital art world.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 px-8 text-sm font-medium rounded-md shadow bg-[--blue] text-customFont hover:bg-[--blue-hover] transition ease-in"
          >
            Get Started
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 ">
          <Feature
            icon={faLock}
            title="Secure"
            description="Your data and transaction is safe due to the website blockchain technology."
          />
          <Feature
            icon={faShoppingCart}
            title="Buy"
            description="Easily purchase artworks from our platform with just a few clicks."
          />
          <Feature
            icon={faDollarSign}
            title="Sell"
            description="Effortlessly sell your artworks to a wide audience."
          />
          <Feature
            icon={faPalette}
            title="Art"
            description="Showcase your art and get recognized by a global community."
          />
        </div>
      </div>
    </section>
  );
};

export default Component;
