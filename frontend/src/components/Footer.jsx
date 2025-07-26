import React from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();

  const handleScrollToTop = () => {
    if (location.pathname !== '/') {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            {/* -------left section-------- */}
            <div>
                <div>
                    <img className='mb-5 w-40' src={assets.logo} alt="" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>
                        At MediTime, we’re dedicated to making healthcare more accessible and efficient. With a network of 100+ trusted doctors across various specialties, we help you book appointments quickly and securely—all from the comfort of your home. Your health is our priority, and we’re here to ensure a seamless medical experience with transparency, trust, and care.
                    </p>
                </div>
            </div>
            {/* -------center section-------- */}
            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li><Link to="/" onClick={handleScrollToTop}>Home</Link></li>
                    <li><Link to="/about" onClick={handleScrollToTop}>About us</Link></li>
                    <li><Link to="/contact" onClick={handleScrollToTop}>Contact us</Link></li>
                    {/* <li><Link to="/privacy" onClick={handleScrollToTop}>Privacy policy</Link></li> */}
                </ul>

            </div>
            {/* -------right section-------- */}
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>1234567890</li>
                    <li>codedone404@gmail.com</li>
                </ul>

            </div>
        </div>
        {/* -------copy right-------- */}
        <div>
            <hr />
            <p  className='py-4 text-sm text-center'>© {new Date().getFullYear()} MediTime. All rights reserved.</p>
        </div>
    </div>
  )
}

export default Footer
