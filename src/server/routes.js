const { userRegister, userLogin, patchUserData, getUserData } = require('./handlerUser');
const { predictUserDisease, getUserPredictionData, getUserNutrition } = require('./handlerDisease');
const { match } = require('./handlerFood');
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
    {
        method: 'GET',
        path: '/user/nutrition', // Path untuk mengambil data nutrisi
        options: {
            pre: [{ method: authMiddleware }], // Autentikasi diperlukan
        },
        handler: getUserNutrition, // Handler untuk data nutrisi
    },
    {
        method: 'POST',
        path: '/user/detect', // More descriptive path
        options: {
            pre: [{ method: authMiddleware }],
            payload: {
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
            },
        },
        handler: match,
    },
];

module.exports = routes;
