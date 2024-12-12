const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firestore
const firestore = new Firestore();

// Fungsi untuk memeriksa apakah email sudah terdaftar
const emailExists = async (email) => {
    const userSnapshot = await firestore.collection('users').where('email', '==', email).get();
    return !userSnapshot.empty; // Mengembalikan true jika email sudah ada
};

// Fungsi untuk memeriksa apakah username sudah terdaftar
const usernameExists = async (username) => {
    const userSnapshot = await firestore.collection('users').where('username', '==', username).get();
    return !userSnapshot.empty; // Mengembalikan true jika username sudah ada
};

// Fungsi untuk menyimpan data pengguna
async function storeUserData(email, username, additionalData) {
    let userId;
    do {
        userId = generateUserId(); // Menghasilkan ID unik 5 digit
    } while (await userIdExists(userId)); // Periksa apakah userId sudah ada

    const userRef = firestore.collection('users').doc(userId); // Gunakan userId sebagai string

    await userRef.set({
        email: email,
        username: username,
        ...additionalData, // Menyimpan data tambahan
    });

    return userId; // Mengembalikan ID pengguna yang baru dibuat
}

// Fungsi untuk menghasilkan userId acak 5 digit sebagai string
const generateUserId = () => {
    return (Math.floor(10000 + Math.random() * 90000)).toString(); // Menghasilkan angka acak 5 digit dan mengonversinya menjadi string
};

// Fungsi untuk memeriksa apakah userId sudah ada di Firestore
const userIdExists = async (userId) => {
    const userSnapshot = await firestore.collection('users').doc(userId).get();
    return userSnapshot.exists; // Mengembalikan true jika userId sudah ada
};

// Fungsi untuk menyimpan hasil prediksi
const storePredictionData = async (userId, bmi, diseases, nutritionData) => {
    try {
        // Referensi ke dokumen di koleksi 'predictions' menggunakan userId sebagai ID dokumen
        const predictionsRef = firestore.collection('predictions').doc(userId);

        // Periksa apakah dokumen sudah ada
        const docSnapshot = await predictionsRef.get();

        if (docSnapshot.exists) {
            // Jika dokumen sudah ada, perbarui field tertentu
            await predictionsRef.set(
                {
                    bmi: bmi, // BMI sebagai field di level atas
                    diseases: diseases,
                    nutrition: nutritionData,
                    createdAt: Firestore.Timestamp.now(),
                },
                { merge: true } // Gunakan merge untuk hanya menimpa field tertentu
            );
            console.log(`Prediction updated for userId: ${userId}`);
        } else {
            // Jika dokumen belum ada, buat dokumen baru
            await predictionsRef.set({
                userId: userId,
                bmi: bmi, // BMI sebagai field di level atas
                diseases: diseases,
                nutrition: nutritionData,
                createdAt: Firestore.Timestamp.now(),
            });
            console.log(`New prediction created for userId: ${userId}`);
        }
    } catch (error) {
        console.error("Error storing or updating prediction:", error);
        throw new Error("Failed to store or update prediction");
    }
};

module.exports = {
    storeUserData,
    emailExists,
    usernameExists,
    storePredictionData,
};
