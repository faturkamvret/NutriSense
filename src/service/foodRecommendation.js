// Dummy cek nanti
const { firestore } = require("../config/gcp");

const getFoodRecommendations = async (uid) => {
    try {
        const userDoc = await firestore.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }

        const recommendations = [
            { food: "Salad", reason: "Low in calories" },
            { food: "Grilled Chicken", reason: "High in protein" },
        ];

        return recommendations;
    } catch (error) {
        throw new Error("Failed to get food recommendations: " + error.message);
    }
};

module.exports = { getFoodRecommendations };
