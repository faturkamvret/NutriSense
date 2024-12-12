const tf = require('@tensorflow/tfjs-node');

// Define the custom L2 regularizer
class L2Regularizer {
    constructor(lambda) {
        this.lambda = lambda;
    }

    // Apply the regularization to the weights
    apply(weights) {
        return this.lambda * tf.sum(tf.square(weights));
    }

    // This method is required for serialization
    static get className() {
        return 'L2Regularizer';
    }
}

// Register the custom regularizer
tf.serialization.registerClass(L2Regularizer);

async function loadModel() {
    // Load the model from the specified URL
    const model = await tf.loadLayersModel(process.env.MODEL_URL, { 
        // You can pass custom options here if needed
    });

    return model;
}

module.exports = loadModel;
