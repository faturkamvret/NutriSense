const axios = require('axios');
const FormData = require('form-data');
const { Firestore } = require('@google-cloud/firestore');
const { storeDetectionData } = require('../services/storeData');
const firestore = new Firestore();
const PREDICT_URL = process.env.PREDICT_URL;

const detectAndMatch = async (req, h) => {
    const userId = req.user.userId;
    const imageData = req.payload.image;

    console.log('Received payload:', req.payload);

    if (!imageData) {
        return h.response({ status: 'fail', message: 'Invalid image upload.' }).code(400);
    }

    try {
        const formData = new FormData();
        formData.append('image', imageData, { filename: 'image.jpg' });

        const response = await axios.post(PREDICT_URL, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const { annotated_image, detected_classes } = response.data;

        if (!detected_classes || detected_classes.length === 0) {
            return h.response({ message: "No objects detected." }).code(400);
        }

        const nutritionData = await Promise.all(detected_classes.map(async (className) => {
            const foodRef = firestore.collection('foods').where('name', '==', className);
            const snapshot = await foodRef.get();
            if (!snapshot.empty) {
                const foodDoc = snapshot.docs[0].data();
                return { name: foodDoc.name, nutrition: foodDoc.nutrition };
            } else {
                return null;
            }
        }));

        const matchedNutritionData = nutritionData.filter(item => item !== null);
        await storeDetectionData(userId, annotated_image, matchedNutritionData);

        return h.response({ annotated_image, detected_classes: matchedNutritionData }).code(200);

    } catch (error) {
        console.error("Error processing detection:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            return h.response({ message: "Prediction API error: " + (error.response.data.error || error.response.statusText) }).code(error.response.status);
        }
        return h.response({ message: "Failed to process detection", error: error.message }).code(500);
    }
};

module.exports = { detectAndMatch };
