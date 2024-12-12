const xlsx = require('xlsx');
const path = require('path');
const { Firestore } = require('@google-cloud/firestore');


const firestore = new Firestore();

// Fungsi untuk membaca file Excel
const readExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath); // Membaca file Excel
  const sheetName = workbook.SheetNames[0]; // Ambil nama sheet pertama
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet); // Konversi sheet menjadi array objek
};

// Fungsi untuk mengunggah data ke Firestore
const uploadToFirestore = async (data) => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item.name || !item.sodium || !item.fat || !item.protein || !item.carbs) {
      console.error(`Data tidak lengkap pada baris ${i + 1}:`, item);
      continue; // Skip data yang tidak lengkap
    }

    const docData = {
      name: item.name.trim(),
      nutrition: {
        sodium: parseFloat(item.sodium),
        fat: parseFloat(item.fat),
        protein: parseFloat(item.protein),
        carbs: parseFloat(item.carbs),
      },
      per: '100 gram',
    };

    try {
      await firestore.collection('foods').doc(String(i + 1)).set(docData);
      console.log(`Berhasil menambahkan dokumen ${i + 1}`);
    } catch (error) {
      console.error(`Gagal menambahkan dokumen ${i + 1}:`, error);
    }
  }
};

// Jalankan proses
const filePath = path.resolve(__dirname, 'nutrition_database.xlsx'); // Ganti dengan path file Excel Anda
const data = readExcel(filePath);
uploadToFirestore(data);
