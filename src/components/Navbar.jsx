import React,{ useState } from 'react';
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai';

const Navbar = () => {
    const [nav, setNav] = useState(false)

    const handleNav = () => {
        setNav(!nav)    
    }
    return(
        <div className='flex text-white justify-between items-center h-24 max-w-[1420px] mx-auto px-4 font-customFont'>
            <h1 className='w-full text-3xl font-bold text-[--orange]'>Tuklas Art Gallery</h1>
            
            <ul className='hidden md:flex'>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>Home</li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>About</li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>Contact</li>
            </ul>
            <div onClick={handleNav} className='z-10 block md:hidden'>
                {nav ? <AiOutlineClose size={25}/> :  <AiOutlineMenu size={25} />}
               
            </div>

            <div className={nav ? 'fixed top-0 right-0 w-full border-l border-l-gray-900 h-full bg-[#000300] ease-in-out duration-500 z-9 ': 'fixed right-[-100%]'}>
                <h1 className='w-full pt-20 text-3xl font-bold text-[--orange] mb-2  font-customFont text-center uppercase'>Tuklas</h1>
                <ul className='p-4 uppercase'>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in text-center'>Home</li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in text-center'>About</li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in text-center'>Contact</li> 
                </ul>
            </div>
        </div>

        
    )
}


export default Navbar