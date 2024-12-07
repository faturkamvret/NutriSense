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

module.exports = {
    storeUserData,
    emailExists,
    usernameExists,
};
