const { userRegister, userLogin, fillUserData } = require('./handlerUser');
const authMiddleware = require('../middleware/auth'); 
// cek nanti dummy
const { getFoodRecommendations } = require('../service/foodRecommendation');

const routes = [
    {
        method: 'POST',
        path: '/register',
        handler: userRegister,
    },
    {
        method: 'POST',
        path: '/login',
        handler: userLogin,
    },
    {
        method: 'POST',
        path: '/user/data',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: fillUserData,
    },
    {
        method: 'GET',
        path: '/user/recommendations',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: async (req, h) => {
            try {
                const recommendations = await getFoodRecommendations(req.user.uid);
                return h.response({
                    status: "OK",
                    message: "Food recommendations retrieved successfully",
                    data: recommendations,
                }).code(200);
            } catch (error) {
                return h.response({ message: error.message }).code(500);
            }
        },
    },
];

module.exports = routes;
