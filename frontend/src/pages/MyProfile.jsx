import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const { userData, setUserData } = useContext(AppContext)

  return userData ? (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl p-8 text-sm text-[#333]">
      <div className="flex flex-col items-center gap-4">
        {isEdit ? (
          <label htmlFor='image'>
            <div className='relative inline-block cursor-pointer group'>
              <img
                className='w-36 h-36 object-cover rounded-full border-4 border-white shadow-md transition-opacity duration-300 group-hover:opacity-75'
                src={image ? URL.createObjectURL(image) : userData.image}
                alt="Profile"
              />
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-100 transition-opacity duration-300'>
                <img
                  className='w-8 h-8'
                  src={assets.upload_icon}
                  alt="Upload Icon"
                />
              </div>
            </div>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
          </label>

        ) : (
          <img
            className="w-36 h-36 object-cover rounded-full border-4 border-primary/20 shadow-md"
            src={userData.image}
            alt="profile"
          />
        )}

        {isEdit ? (
          <input
            type="text"
            className="text-center bg-gray-100 text-2xl font-semibold rounded-md p-2 w-60 focus:outline-none"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
        )}
      </div>

      <hr className="my-6 border-t border-gray-200" />

      <section>
        <h3 className="text-lg text-primary font-semibold mb-4 underline underline-offset-4">
          Contact Information
        </h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex gap-4">
            <span className="font-medium w-24">Email:</span>
            <span className="text-blue-600">{userData.email}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-medium w-24">Phone:</span>
            {isEdit ? (
              <input
                className="bg-gray-100 rounded-md p-1 w-48"
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            ) : (
              <span className="text-blue-600">{userData.phone}</span>
            )}
          </div>
          <div className="flex gap-4">
            <span className="font-medium w-24">Address:</span>
            {isEdit ? (
              <div className="space-y-1">
                <input
                  className="bg-gray-100 rounded-md p-1 w-64"
                  type="text"
                  value={userData.address.line1}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                />
                <input
                  className="bg-gray-100 rounded-md p-1 w-64"
                  type="text"
                  value={userData.address.line2}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                />
              </div>
            ) : (
              <span className="text-gray-600">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </span>
            )}
          </div>
        </div>
      </section>

      <hr className="my-6 border-t border-gray-200" />

      <section>
        <h3 className="text-lg text-primary font-semibold mb-4 underline underline-offset-4">
          Basic Information
        </h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex gap-4">
            <span className="font-medium w-24">Gender:</span>
            {isEdit ? (
              <select
                className="bg-gray-100 rounded-md p-1"
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
              >
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <span>{userData.gender}</span>
            )}
          </div>

          <div className="flex gap-4">
            <span className="font-medium w-24">Birthday:</span>
            {isEdit ? (
              <input
                className="bg-gray-100 rounded-md p-1"
                type="date"
                value={userData.dob}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            ) : (
              <span>{userData.dob}</span>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        {isEdit ? (
          <button
            onClick={() => setIsEdit(false)}
            className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-600 py-10">Loading...</div>
  )
}

export default MyProfile
