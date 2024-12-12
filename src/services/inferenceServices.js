const tf = require('@tensorflow/tfjs-node');

async function predictDisease(model, data) {
    try {
        // Konversi data menjadi tensor 2D
        const inputTensor = tf.tensor2d(data, [1, data.length]); // Pastikan data berbentuk array 1D

        // Lakukan prediksi
        const prediction = model.predict(inputTensor);

        // Ambil hasil prediksi
        const predictionArray = await prediction.array();
        return predictionArray[0]; // Mengembalikan hasil prediksi
    } catch (error) {
        throw new Error('Failed to predict disease: ' + error.message);
    }
}

module.exports = predictDisease;
