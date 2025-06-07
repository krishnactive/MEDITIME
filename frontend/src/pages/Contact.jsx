import React from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-16 sm:px-10 md:px-20 text-gray-800">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-500">Contact <span className='text-gray-700 font-semibold'>Us</span></h1>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          Have a question or need help? Reach out and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <img className='mb-8 bg-blue-50 p-8 rounded-xl shadow' src={assets.contact_image} alt="" />
        {/* Contact Info */}
        <div className="space-y-8 text-lg">
          <div className="flex items-start gap-4">
            <FaMapMarkerAlt className="text-blue-600 text-2xl mt-1" />
            <div>
              <p className="font-semibold">Head Office</p>
              <p>XYZ, ABC, India</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaPhoneAlt className="text-blue-600 text-2xl mt-1" />
            <div>
              <p className="font-semibold">Call Us</p>
              <p>+91 1234567890</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaEnvelope className="text-blue-600 text-2xl mt-1" />
            <div>
              <p className="font-semibold">Email</p>
              <p>codedone404@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
