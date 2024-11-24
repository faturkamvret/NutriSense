const firebaseAdmin = require('../config/firebase');

const authMiddleware = async (request, h) => {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return h.response({ message: 'Unauthorized' }).code(401).takeover();
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        request.user = decodedToken;
        return h.continue;
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return h.response({ message: 'Unauthorized' }).code(401).takeover();
    }
};

module.exports = authMiddleware;
