const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
    },
    medicalHistory: {
        type: String,
    },
    prescriptions: {
        type: [String],
    },
    labResults: {
        type: [String],
    },
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
