import { ReactTyped } from "react-typed";

const Welcome = () => {
  return (
    <div className='text-white'>
            <div className='max-w-[800px] my-[-120px] w-full  mx-auto text-center flex flex-col justify-center mt-[100px]'>
                <p className='text-[--orange] font-bold p-2' >DISCOVERING THE BEAUTY OF ARTS</p>
                <h1 className='text-4xl font-bold md:text-7xl sm:text-6xl md:py-6 '>Welcome to Tuklas Art Gallery</h1>

                <div className='flex items-center justify-center'>
                    <p className='py-4 text-xl font-bold md:text-3xl sm:text-4xl'>Explore the World of Art and</p>
                    <ReactTyped className='pl-2 text-lg text-[--orange] md:text-3xl sm:text-4xl font-bold'
                     strings={['Discover', 'Create', 'Own']} typeSpeed ={90} backSpeed={100} loop/>
                </div>
                <p className='text-lg font-bold text-gray-300 md:text-xl'>Grab the Opportunity to Discover, Create, and Own Arts through NFT.</p>
            </div>
           
        </div>
  )
}

export default Welcome