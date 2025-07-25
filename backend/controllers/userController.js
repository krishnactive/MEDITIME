import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// import uploadImageToCloudinary from "../utils/uploadImageToCloudinary.js";
import { v2 as cloudinary} from "cloudinary";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = { name, email, password: hashedPassword };

    // Save user to DB
    const newUser = new userModel(userData);
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    return res.json({ success: true, token });

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d' // Optional: add expiration for better security
    });

    res.json({ success: true, token });

  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to update user profile
const updateProfile = async(req, res)=>{
  try {

    const {userId, name, phone, address, dob, gender} = req.body;
    const  imageFile = req.file;

    if(!name || !phone ||!dob ||!gender){
      return res.json({ success: false, message: "All fields are required" });
    }
    await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address),dob, gender}) ;

    if(imageFile){
      const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type: 'image'});
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, {image: imageUrl});

    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
  }
}


export { registerUser, loginUser, getProfile, updateProfile };