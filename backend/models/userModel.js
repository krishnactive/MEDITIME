import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    googleId: { type: String, unique: true, sparse: true },
    image: { type: String, default: 'https://res.cloudinary.com/de3dlsov2/image/upload/v1749630538/samples/animals/reindeer.jpg' },
    phone: { type: String, default: '000000000' },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, default: 'Not Selected' },
    dob: { type: String, default: 'Not Selected' },
    password: { type: String },
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;