import jwt from 'jsonwebtoken';

// User authentication middleware
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, please login again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded user ID:', decoded.id);

        req.userId = decoded.id; // ✅ attach to req.userId instead of req.body
        next();
    } catch (error) {
        console.error('AuthUser Middleware Error:', error);
        res.status(401).json({ success: false, message: 'Token verification failed, please login again.' });
    }
};

export default authUser;
