const axios = require('axios');
const { Firestore } = require('@google-cloud/firestore');
const { storeDetectionData } = require('../services/storeData'); // Implement this function
const firestore = new Firestore();
const PREDICT_URL = process.env.PREDICT_URL;

const match = async (req, h) => {
    const userId = req.user.userId; // Get userId from authentication middleware
    const image = req.payload; // Hapi.js handles multipart; this is the stream

    console.log('Received payload:', req.payload); // Log for debugging

    if (!image || !image.hapi) {
        return h.response({ status: 'fail', message: 'Invalid image upload.' }).code(400);
    }

    try {
        const response = await axios.post(PREDICT_URL, image.hapi.data, { // Send the stream directly
            headers: {
                'Content-Type': 'application/octet-stream', // Or a more specific content type if known
                'Content-Disposition': `form-data; name="key_image"; filename="${image.hapi.filename}"` // Important for Flask
            },
            maxContentLength: Infinity, // Handle large files
            maxBodyLength: Infinity // Handle large files
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

module.exports = { match };
