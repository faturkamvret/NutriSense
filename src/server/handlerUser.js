const { firestore } = require("../config/gcp");
const firebaseAdmin = require("../config/firebase");
const axios = require("axios");

const userRegister = async (req, h) => {
    try {
        const { email, password, username } = req.payload;

        if (!username) {
            throw new Error("Username is required.");
        }

        // Create user in Firebase Authentication
        const userRecord = await firebaseAdmin.auth().createUser({
            email,
            password,
        });

        await firestore.collection("users").doc(userRecord.uid).set({
            email: email,
            username: username,
            age: null,
            weight: null,
            height: null,
            gender: null,
            blood_pressure: null,
            cholesterol: null,
            blood_sugar: null,
            allergies: null,
        });

        return h
            .response({ status: "Created", message: "User registered successfully", email: email })
            .code(201);
    } catch (error) {
        return h.response({ status: "fail", message: "Failed to register user", error }).code(400);
    }
};

// Fungsi untuk login pengguna
const userLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;
        const firebaseApiKey = process.env.FIREBASE_API_KEY;

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
            {
                email,
                password,
                returnSecureToken: true,
            }
        );

        const { idToken, localId } = response.data;

        const userSnapshot = await firestore.collection("users").doc(localId).get();

        if (!userSnapshot.exists) {
            return h.response({ message: "User not found in Firestore" }).code(404);
        }

        const userData = userSnapshot.data();
        const { username } = userData;

        return h
            .response({
                status: "OK",
                message: "Log in Successful",
                token: idToken,
                data: {
                    email: email,
                    username: username,
                },
            })
            .code(200)
            .header("Content-Type", "application/json");
    } catch (error) {
        if (error.response && error.response.status === 400) {
            return h.response({ message: "Incorrect password" }).code(401);
        }
        return h.response({ message: "Failed to login user", error }).code(500);
    }
};

// Fungsi untuk mengisi data pengguna
const fillUserData = async (req, h) => {
    try {
        const uid = req.user.uid;
        const {
            age,
            weight,
            height,
            gender,
            blood_pressure,
            cholesterol,
            blood_sugar,
            allergies,
        } = req.payload;

        await firestore.collection("users").doc(uid).update({
            age,
            weight,
            height,
            gender,
            blood_pressure,
            cholesterol,
            blood_sugar,
            allergies,
        });

        return h.response({ message: "User data updated successfully" }).code(200);
    } catch (error) {
        console.error("Error updating user data:", error);
        return h.response({ message: "Failed to update user data", error }).code(500);
    }
};

module.exports = {
    userRegister,
    userLogin,
    fillUserData,
};
