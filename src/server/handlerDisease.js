// diseaseHandler.js
const { Firestore } = require('@google-cloud/firestore');
const predictDisease = require('../services/inferenceServices');
const { storePredictionData } = require('../services/storeData');

const firestore = new Firestore();
const predictUserDisease = async (req, h) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token
        const userRef = firestore.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return h.response({ message: "User not found" }).code(404);
        }

        const userData = userDoc.data();

        // Ambil data dari userData atau gunakan nilai default
        const height = userData.height || 0;
        const weight = userData.weight || 0;
        const gender = userData.gender || 0;
        const age = userData.age || 0;
        const bloodPressure = userData.blood_pressure || 0;
        const cholesterol = userData.cholesterol || 0;
        const bloodGlucose = userData.blood_sugar || 0;

        const heightM = height / 100;
        const bmi = heightM > 0 ? weight / (heightM ** 2) : 0;

        const bmiCategory = bmi < 18.5 ? 0 : (bmi < 25 ? 1 : (bmi < 30 ? 2 : 3));
        const ageCategory = age < 30 ? 0 : (age < 45 ? 1 : (age < 60 ? 2 : 3));
        const bpCategory = bloodPressure < 120 ? 0 : (bloodPressure < 140 ? 1 : (bloodPressure < 160 ? 2 : 3));

        const bmiAge = bmi * age;
        const bpAge = bloodPressure * age;
        const bmiBp = bmi * bloodPressure;

        const sodium = weight * 20;
        const fat = weight * (gender === 1 ? 0.15 : 0.25);
        const protein = weight * 0.9;
        const carbs = weight * 3;

        // Siapkan data untuk prediksi
        let inputData = [
            height,         
            weight,         
            gender,         
            age,            
            bloodPressure,  
            cholesterol,    
            bloodGlucose,   
            bmi,            
            bmiCategory,    
            ageCategory,    
            bpCategory,     
            bmiAge,         
            bpAge,          
            bmiBp,          
            sodium          
        ];

        // Validasi data
        if (inputData.some(value => typeof value !== 'number' || isNaN(value))) {
            throw new Error('Input data contains invalid values');
        }

        const model = req.server.app.model;

        // Panggil fungsi prediksi
        const prediction = await predictDisease(model, inputData);

        // Label prediksi sesuai urutan
        const diseasesLabels = [
            'anemia', 'cholesterol', 'ckd', 'diabetes', 
            'heart', 'hypertension', 'ms', 'nafld', 
            'obesity', 'stroke'
        ];

        // Filter hasil prediksi untuk yang bernilai true (1)
        const diseases = diseasesLabels.reduce((result, disease, index) => {
            if (prediction[index] === 1) {
                result[disease] = true;
            }
            return result;
        }, {});

        // Nutrition data
        const nutritionData = {
            sodium: sodium,
            fat: fat,
            protein: protein,   
            carbs: carbs
        };

        // Simpan ke Firestore
        await storePredictionData(userId, bmi, diseases, nutritionData);

        return h.response({
            message: "Disease prediction successful",
            prediction: prediction,
        }).code(200);
    } catch (error) {
        console.error("Error predicting disease:", error);
        return h.response({ message: "Failed to predict disease", error: error.message }).code(500);
    }
};

const getUserPredictionData = async (req, h) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token
        const predictionsRef = firestore.collection('predictions').doc(userId);
        const predictionDoc = await predictionsRef.get();

        if (!predictionDoc.exists) {
            return h.response({ message: "Prediction data not found" }).code(404);
        }

        const predictionData = predictionDoc.data();

        return h.response({
            userId: userId,
            bmi: predictionData.bmi, // BMI sebagai field di level atas
            diseases: predictionData.diseases, // Data penyakit
            nutrition: predictionData.nutrition, // Data nutrisi
            createdAt: predictionData.createdAt.toDate().toISOString() // Tanggal dalam ISO format
        }).code(200);
    } catch (error) {
        console.error("Error fetching prediction data:", error);
        return h.response({ message: "Failed to fetch prediction data", error: error.message }).code(500);
    }
};

const getUserNutrition = async (req, h) => {
    try {
        const userId = req.user.userId;
        const predictionsRef = firestore.collection('predictions').doc(userId);
        const predictionDoc = await predictionsRef.get();

        if (!predictionDoc.exists) {
            return h.response({ message: "Nutrition data not found" }).code(404);
        }

        const predictionData = predictionDoc.data();
        const nutritionData = predictionData.nutrition;

        // Mengembalikan hanya data nutrisi
        return h.response(nutritionData).code(200);

    } catch (error) {
        console.error("Error fetching nutrition data:", error);
        return h.response({ message: "Failed to fetch nutrition data", error: error.message }).code(500);
    }
};

module.exports = {
    predictUserDisease,
    getUserPredictionData,
    getUserNutrition,
};
