const jwt = require('jsonwebtoken');

const authMiddleware = async (req, h) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return h.response({ message: "Missing authorization header" }).code(401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Simpan informasi pengguna di request
        return h.continue;
    } catch (error) {
        return h.response({ message: "Invalid token" }).code(401);
    }
};

module.exports = authMiddleware;
