import React from 'react'; 
import { ReactTyped } from "react-typed";

const About = () => {
  return (
    <div className='text-white '>
        <div className='w-full my-[-120px] mx-auto text-center flex flex-col justify-center mt-[130px] lg:w-[1240px]'>
          <div className='flex items-center justify-center xl:mt-0 lg:mt-0'>
          <h1 className='text-3xl font-bold md:text-4xl sm:text-2xl md:py-6 xl:text-6xl'>What is</h1>
          <ReactTyped className='pl-2 text-3xl text-[--orange] md:text-4xl sm:text-4xl font-bold xl:text-6xl'
                     strings={['Tuklas?']} typeSpeed ={90} backSpeed={100} loop/>
          </div>
          <p className='text-base font-medium text-white md:text-2xl xl:text-4xl'>Tuklas is a Filipino word means <span className='text-[--orange]'>Discover</span> in english.
          This website is meant to bring opportunity for different artists from Batangas to showcase their artowrk and potentially get discovered. That 
          is the reason why the website is called <span className='text-[--orange]'>Tuklas Art Gallery</span> or simply <span className='text-[--orange]'>Tuklas.</span></p>
         
        </div>
    </div>


  )
}

export default About;