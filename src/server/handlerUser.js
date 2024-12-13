const { storeUserData, emailExists, usernameExists } = require("../services/storeData");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firestore
const firestore = new Firestore();

const userRegister = async (req, h) => {
    try {
        const { email, password, username, age, weight, height, gender, blood_pressure, cholesterol, blood_sugar, allergies } = req.payload;

        if (!username) {
            throw new Error("Username is required.");
        }

        // Cek apakah email sudah terdaftar
        if (await emailExists(email)) {
            return h.response({ status: "fail", message: "Email is already registered." }).code(400);
        }

        // Cek apakah username sudah terdaftar
        if (await usernameExists(username)) {
            return h.response({ status: "fail", message: "Username is already taken." }).code(400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan pengguna di Firestore
        const userId = await storeUserData(email, username, {
            password: hashedPassword,
            age: age || null,
            weight: weight || null,
            height: height || null,
            gender: gender || null,
            blood_pressure: blood_pressure || null,
            cholesterol: cholesterol || null,
            blood_sugar: blood_sugar || null,
            allergies: allergies || null,
        });

        return h
            .response({ status: "Created", message: "User registered successfully", userId: userId })
            .code(201);
    } catch (error) {
        console.error("Error registering user:", error);
        return h.response({ status: "fail", message: "Failed to register user", error: error.message }).code(400);
    }
};

const userLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const userSnapshot = await firestore.collection("users").where("email", "==", email).get();

        if (userSnapshot.empty) {
            return h.response({ message: "User not found" }).code(404);
        }

        const userData = userSnapshot.docs[0].data();

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            return h.response({ message: "Incorrect password" }).code(401);
        }

        // Buat token JWT
        const token = jwt.sign({ userId: userSnapshot.docs[0].id, email: userData.email, username: userData.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return h
            .response({
                status: "OK",
                message: "Log in Successful",
                token: token,
                userId: userSnapshot.docs[0].id, // Kirimkan userId
                data: {
                    email: userData.email,
                    username: userData.username,
                },
            })
            .code(200);
    } catch (error) {
        console.error("Error logging in user:", error);
        return h.response({ message: "Failed to log in user", error: error.message }).code(500);
    }
};

/* DATA POST edit
const fillUserData = async (req, h) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token
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

        const userRef = firestore.collection("users").doc(userId); // Gunakan userId untuk mencari pengguna
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return h.response({ message: "User not found" }).code(404);
        }

        await userRef.update({
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
        return h.response({ message: "Failed to update user data", error: error.message }).code(500);
    }
};
*/

// PATCH
const patchUserData = async (req, h) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token
        const updateData = req.payload; // Ambil data yang ingin diperbarui

        const userRef = firestore.collection("users").doc(userId); // Gunakan userId untuk mencari pengguna
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return h.response({ message: "User not found" }).code(404);
        }

        await userRef.update(updateData); // Hanya memperbarui data yang diberikan

        return h.response({ message: "User data updated successfully" }).code(200);
    } catch (error) {
        console.error("Error updating user data:", error);
        return h.response({ message: "Failed to update user data", error: error.message }).code(500);
    }
};

const getUserData = async (req, h) => {
    try {
        const userId = req.user.userId; // Ambil userId dari token

        const userRef = firestore.collection("users").doc(userId); // Gunakan userId untuk mencari pengguna
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return h.response({ message: "User not found" }).code(404);
        }

        const userData = userDoc.data(); // Ambil data pengguna

        // Kembalikan data pengguna tanpa menyertakan password
        const { password, ...userWithoutPassword } = userData;

        return h.response({
            message: "User data retrieved successfully",
            data: userWithoutPassword, // Kembalikan data pengguna
        }).code(200);
    } catch (error) {
        console.error("Error retrieving user data:", error);
        return h.response({ message: "Failed to retrieve user data", error: error.message }).code(500);
    }
};


module.exports = {
    userRegister,
    userLogin,
    patchUserData,
    getUserData,
};
