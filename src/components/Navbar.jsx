import React,{ useState } from 'react';
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai';

const Navbar = () => {
    const [nav, setNav] = useState(false)

    const handleNav = () => {
        setNav(!nav)    
    }
    return(
        <div className='flex text-white justify-between items-center h-20 max-w-[1420px] mx-auto px-4 font-customFont cursor-pointer'>
            <h1 className='w-full text-3xl font-bold text-[--orange]'>Tuklas Art Gallery</h1>
            
            <ul className='hidden md:flex'>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in '><a href='/' className={location.pathname === '/' ? 'active' : ''}>Home</a></li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/about' className={location.pathname === '/about' ? 'active' : ''}>About</a></li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>Contact</li>
            </ul>
            <div onClick={handleNav} className='block md:hidden'>
                {nav ? <AiOutlineClose size={25}/> :  <AiOutlineMenu size={25}/>}
               
            </div>

            <div className={nav ? 'fixed top-0 left-0 w-[60%] border-l border-l-gray-900 h-full bg-[#000300] ease-in-out duration-500': 'fixed left-[-100%]'}>
                <h1 className='w-full pt-4 text-3xl font-bold text-[--orange] m-4 font-customFont'>Tuklas</h1>
                <ul className='p-4 uppercase'>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/' className={location.pathname === '/' ? 'active' : ''} >Home</a></li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'><a href='/about' className={location.pathname === '/about' ? 'active' : ''}>About</a></li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>Contact</li> 
                </ul>
            </div>
        </div>

        
    )
}


export default Navbar