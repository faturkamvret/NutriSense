const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firestore
const firestore = new Firestore();

// Fungsi untuk menghapus koleksi
const deleteCollection = async (collectionPath) => {
    const collectionRef = firestore.collection(collectionPath);
    const query = collectionRef.limit(100); // Batasi jumlah dokumen yang dihapus dalam satu batch

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
};

const deleteQueryBatch = async (query, resolve) => {
    const snapshot = await query.get();

    // Jika tidak ada dokumen, selesai
    if (snapshot.size === 0) {
        console.log('Koleksi telah dihapus.');
        return resolve();
    }

    // Hapus setiap dokumen dalam snapshot
    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Dihapus ${snapshot.size} dokumen.`);

    // Panggil lagi untuk menghapus dokumen berikutnya
    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
};

// Ganti 'foods' dengan nama koleksi yang ingin Anda hapus
deleteCollection('foods')
    .then(() => {
        console.log('Penghapusan koleksi selesai.');
    })
    .catch((error) => {
        console.error('Terjadi kesalahan saat menghapus koleksi:', error);
    });
