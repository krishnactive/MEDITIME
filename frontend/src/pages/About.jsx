import React from 'react'
import { assets } from '../assets/assets'
import { FaClock, FaMobileAlt, FaUserCheck } from 'react-icons/fa'

const About = () => {
  return (
    <div className="bg-white min-h-screen px-6 py-12 sm:px-10 md:px-20 text-gray-800">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600">About Us</h1>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          Your health is our top priority. Here's who we are and what we do.
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className=''>
        <img
          src={assets.about_image}
          alt="About MediTime"
          className="w-full max-w-md rounded-full shadow-lg object-cover"
        />
        </div>

        <div className="flex-1 space-y-6">
          <p className="text-lg leading-relaxed">
            Welcome to <strong className="text-blue-600">MediTime</strong>, your trusted platform for finding and booking appointments with the best doctors across multiple specialties. We believe that accessing quality healthcare should be fast, reliable, and stress-free.
          </p>

          {/* Mission */}
          <div>
            <h3 className="text-2xl font-semibold text-blue-600 mb-2">Our Mission</h3>
            <p className="text-base leading-relaxed">
              To make quality healthcare easily accessible and convenient for everyone by connecting patients with trusted medical professionals through a seamless digital experience.
              We aim to simplify appointment bookings, empower informed decisions, and improve overall patient care with the help of modern technology.
            </p>
          </div>

          {/* Vision */}
          <div>
            <h3 className="text-2xl font-semibold text-blue-600 mb-2">Our Vision</h3>
            <p className="text-base leading-relaxed">
              To become a leading digital healthcare platform in India and beyond, where technology, compassion, and accessibility come together to create a healthier and more connected world.
              We envision a future where every individual, regardless of location or background, can access timely and trusted healthcare services with just a few clicks.
            </p>
          </div>
        </div>
      </div>

    {/* Why Choose Us Section */}
<div className="mt-20">
  <h2 className="text-3xl font-semibold text-center text-blue-600 mb-10">Why Choose Us</h2>

  <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 text-center">
    {/* Efficiency */}
    <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition">
      <FaClock className="text-blue-600 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-700 mb-2">Efficiency</h3>
      <p className="text-gray-600">
        Book appointments in seconds, avoid waiting rooms, and access care faster than ever before.
      </p>
    </div>

    {/* Convenience */}
    <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition">
      <FaMobileAlt className="text-blue-600 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-700 mb-2">Convenience</h3>
      <p className="text-gray-600">
        Search, compare, and schedule — all from your phone or laptop, anytime, anywhere.
      </p>
    </div>

    {/* Personalization */}
    <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition">
       <FaUserCheck className="text-blue-600 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-700 mb-2">Personalization</h3>
      <p className="text-gray-600">
        Get matched with doctors based on your needs, preferences, and medical history.
      </p>
    </div>
    
  </div>
    <p className="text-lg text-center text-gray-800 mt-16 max-w-3xl mx-auto">
        Thank you for choosing <strong className="text-blue-600">MediTime</strong>. Together, let's make healthcare more accessible and efficient.
    </p>
  </div>

    </div>

    

  )
}

export default About
