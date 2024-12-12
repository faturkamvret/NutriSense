const { userRegister, userLogin, patchUserData, getUserData } = require('./handlerUser');
const { predictUserDisease, getUserPredictionData } = require('./handlerDisease');
const authMiddleware = require('../middleware/auth');

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
    /* POST edit data
    {
        method: 'POST',
        path: '/user/data',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: fillUserData,
    },
    */
    {
        method: 'PATCH',
        path: '/user/data',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: patchUserData,
    },
    {
        method: 'GET',
        path: '/user/data',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: getUserData,
    },
    {
        method: 'POST',
        path: '/user/predict',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: predictUserDisease,
    },
    {
        method: 'get',
        path: '/user/disease',
        options: {
            pre: [{ method: authMiddleware }],
        },
        handler: getUserPredictionData,
    },
];

module.exports = routes;
