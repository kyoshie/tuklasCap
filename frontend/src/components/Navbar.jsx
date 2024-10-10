import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';



const Navbar = () => {

    const [nav, setNav] = useState(false)

    const handleNav = () => {
        setNav(!nav)
    }
    return (
        <div className='sticky top-0 left-0 z-40 bg-[#222831] flex text-white justify-between items-center h-20 w-full mx-auto px-4 font-customFont cursor-pointer lg:px-[10%]'>
            <img src='logo.png' className='hidden lg:w-[120px] lg:h-[110px] lg:flex lg:mt-3'></img>
            <h1 className='w-full text-3xl font-bold text-[--orange]'>Tuklas Art Gallery</h1>

            <ul className='hidden md:flex'>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in '><a href='/' className={location.pathname === '/' ? 'text-[--orange]' : ''}>Home</a></li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/about' className={location.pathname === '/about' ? 'text-[--orange]' : ''}>About</a></li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/features' className={location.pathname === '/features' ? 'text-[--orange]' : ''}>Features</a></li>
            </ul>
            <div onClick={handleNav} className='z-10 block md:hidden md:px-1'>
                {nav ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30} />}

            </div>

            <div className={nav ? 'fixed top-0 right-0 w-full border-l border-l-gray-900 h-full bg-[#000300] ease-in-out duration-500 z-9 ' : 'fixed right-[-100%]'}>
                <h1 className='w-full pt-20 text-3xl font-bold text-[--orange] mb-2  font-customFont text-center uppercase'>Tuklas</h1>
                <ul className='p-4 text-center uppercase'>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/' className={location.pathname === '/' ? 'text-[--orange]' : ''} >Home</a></li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/about' className={location.pathname === '/about' ? 'text-[--orange]' : ''}>About</a></li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/features' className={location.pathname === '/features' ? 'text-[--orange]' : ''}>Features</a></li>
                </ul>
            </div>
        </div>
    )
}


export default Navbar