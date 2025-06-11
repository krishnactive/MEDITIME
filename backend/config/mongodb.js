import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('MongoDB connected'));
    await mongoose.connect(`${process.env.MONGODB_URL}`);

}

export default connectDB;