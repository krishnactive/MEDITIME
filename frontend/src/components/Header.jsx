import React from 'react'
import { assets } from '../assets/assets'
import { FiArrowRight } from 'react-icons/fi'

const Header = () => {
  return (
    <header className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white py-16 px-6 md:px-20 rounded-3xl shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Find and Book <br className="hidden md:block" />
            Trusted Doctors Instantly
          </h1>
          <p className="text-white text-sm md:text-base font-light leading-relaxed">
            Access a network of qualified professionals, check their profiles and reviews,
            and book your appointment with ease.
          </p>

          <div className="flex items-center gap-4">
            <img className="w-24 md:w-32" src={assets.group_profiles} alt="Doctors" />
            <span className="text-sm md:text-base font-light">
              10k+ verified doctors across 20+ specialities
            </span>
          </div>

          <a
            href="#speciality"
            className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2 w-max"
          >
            Book Appointment <FiArrowRight />
          </a>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex justify-center">
          <div className="shadow-xl overflow-hidden p-4 md:p-6 w-full max-w-md">
            <img
              src={assets.header_img}
              alt="Doctor Illustration"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
