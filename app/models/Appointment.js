const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        required: [true, "Doctor ID is required"],
    },
    patientId: {
        type: String,
        required: [true, "Patient ID is required"],
    },
    doctorName: {
        type: String,
        required: [true, "Doctor name is required"],
    },
    patientName: {
        type: String,
        required: [true, "Patient name is required"],
    },
    date: {
        type: Date,
        required: [true, "Appointment date is required"],
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
