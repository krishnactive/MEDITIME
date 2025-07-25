import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoIosArrowDown } from 'react-icons/io';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    // const [token, setToken] = useState(true);
    const [mobileNav, setMobileNav] = useState(false);
    const {token, setToken} = useContext(AppContext);

    const handleLogout = () => {
        setToken(false); 
        localStorage.removeItem('token');
        setShowMenu(false);
        // toast.success('Logged out successfully!');
        scrollTo(0, 0);
        // Redirect to login page
        navigate('/login');
    }


    return (
        <div className='flex items-center justify-between text-sm py-5 px-6 mb-5 border-b border-b-gray-200 shadow-sm bg-white/80 backdrop-blur-md sticky top-0 z-50'>
            <img
                onClick={() => {
                    navigate('/');
                    scrollTo(0, 0);
                }}
                className='w-44 h-12 cursor-pointer transition-transform duration-300 hover:scale-105'
                src={assets.logo}
                alt=""
            />

            {/* Desktop menu */}
            <ul className='hidden md:flex items-center gap-8 font-medium text-gray-700'>
                <NavLink to='/' className='group'>
                    <li className='py-1 cursor-pointer relative'>
                        HOME
                        <span className='absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/5'></span>
                    </li>
                </NavLink>
                <NavLink to='/doctors' className='group'>
                    <li className='py-1 cursor-pointer relative'>
                        ALL DOCTORS
                        <span className='absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/5'></span>
                    </li>
                </NavLink>
                <NavLink to='/about' className='group'>
                    <li className='py-1 cursor-pointer relative'>
                        ABOUT
                        <span className='absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/5'></span>
                    </li>
                </NavLink>
                <NavLink to='/contact' className='group'>
                    <li className='py-1 cursor-pointer relative'>
                        CONTACT
                        <span className='absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/5'></span>
                    </li>
                </NavLink>
            </ul>

            <div className='flex items-center gap-4'>
                {!token ? (
                    <button
                        onClick={() => navigate('/login')}
                        className='bg-primary text-white px-4 py-2 text-sm md:px-8 md:py-3 md:text-base rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300'
                    >
                        SignIn
                    </button>
                ) : (
                    <div
                        className='flex items-center gap-2 cursor-pointer group relative'
                        onClick={() => setShowMenu((prev) => !prev)}
                    >
                        <img
                            className='w-10 h-10 rounded-full border-2 border-primary shadow-md'
                            src={assets.profile_pic}
                            alt=""
                        />
                        <IoIosArrowDown className={`w-4 h-4 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />

                        <div
                            className={`absolute top-12 right-0 w-52 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-gray-700 font-medium transition-all duration-300 ${
                                showMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                            }`}
                        >
                            <p
                                onClick={() => {
                                    navigate('/my-profile');
                                    setShowMenu(false);
                                }}
                                className='hover:text-primary cursor-pointer py-2 transition-colors duration-200'
                            >
                                My Profile
                            </p>
                            <p
                                onClick={() => {
                                    navigate('/my-appointments');
                                    setShowMenu(false);
                                }}
                                className='hover:text-primary cursor-pointer py-2 transition-colors duration-200'
                            >
                                My Appointments
                            </p>
                            <p
                                onClick={handleLogout}
                                className='hover:text-primary cursor-pointer py-2 transition-colors duration-200'
                            >
                                Logout
                            </p>
                        </div>
                    </div>
                )}

                {/* Mobile Hamburger Icon */}
                <div
                    className='md:hidden cursor-pointer ml-2'
                    onClick={() => setMobileNav(!mobileNav)}
                >
                    {mobileNav ? (
                        <HiOutlineX className='text-2xl' />
                    ) : (
                        <HiOutlineMenuAlt3 className='text-2xl' />
                    )}
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileNav && (
                <div className='absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md py-4 px-6 flex flex-col gap-4 md:hidden z-40'>
                    <NavLink
                        to='/'
                        className={({ isActive }) => `py-1 ${isActive ? 'text-primary' : ''}`}
                        onClick={() => setMobileNav(false)}
                    >
                        HOME
                    </NavLink>
                    <NavLink
                        to='/doctors'
                        className={({ isActive }) => `py-1 ${isActive ? 'text-primary' : ''}`}
                        onClick={() => setMobileNav(false)}
                    >
                        ALL DOCTORS
                    </NavLink>
                    <NavLink
                        to='/about'
                        className={({ isActive }) => `py-1 ${isActive ? 'text-primary' : ''}`}
                        onClick={() => setMobileNav(false)}
                    >
                        ABOUT
                    </NavLink>
                    <NavLink
                        to='/contact'
                        className={({ isActive }) => `py-1 ${isActive ? 'text-primary' : ''}`}
                        onClick={() => setMobileNav(false)}
                    >
                        CONTACT
                    </NavLink>

                    
                </div>
            )}
        </div>
    );
};

export default Navbar;
