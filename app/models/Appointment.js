const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, "Doctor ID is required"],
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, "Patient ID is required"],
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
