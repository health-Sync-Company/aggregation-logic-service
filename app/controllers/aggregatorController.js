const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');
const Client = require('pg');

// MongoDB connection setup
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/health-sync', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};

const redshiftClient = new Client(
    {     host: process.env.REDSHIFT_HOST,     
          port: process.env.REDSHIFT_PORT,     
          user: process.env.REDSHIFT_USER,     
          password: process.env.REDSHIFT_PASSWORD,     
          database: process.env.REDSHIFT_DATABASE, 
        }
    );

// Get appointments per doctor
const getAppointmentsPerDoctor = async () => {
    return await Appointment.aggregate([
        {
            $group: {
                _id: "$doctorId",
                totalAppointments: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: "doctors", 
                localField: "_id",
                foreignField: "_id",
                as: "doctorInfo",
            },
        },
        {
            $unwind: "$doctorInfo",
        },
        {
            $project: {
                doctorName: "$doctorInfo.name",
                totalAppointments: 1,
            },
        },
    ]);
};

// Get appointment frequency over time
const getAppointmentFrequency = async () => {
    return await Appointment.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                },
                totalAppointments: { $sum: 1 },
            },
        },
        {
            $project: {
                year: "$_id.year",
                month: "$_id.month",
                totalAppointments: 1,
            },
        },
        {
            $sort: {
                year: 1,
                month: 1,
            },
        },
    ]);
};

// Get common symptoms and conditions by specialty
const getCommonConditionsBySpecialty = async () => {
    return await Patient.aggregate([
        {
            $unwind: "$medicalHistory",
        },
        {
            $group: {
                _id: "$specialty", 
                commonConditions: { $addToSet: "$medicalHistory" },
            },
        },
        {
            $project: {
                specialty: "$_id",
                commonConditions: 1,
            },
        },
    ]);
};

// Fetch all patients
const getAllPatients = async () => {
    return await Patient.find({});
};

// Main aggregation function
const aggregateData = async () => {
    try {
        await connectDB(); // Connect to MongoDB

        const allPatients = await getAllPatients(); // Fetch all patients
        console.log("All Patients:", allPatients);

        const appointmentsPerDoctor = await getAppointmentsPerDoctor();
        const appointmentFrequency = await getAppointmentFrequency();
        const commonConditionsBySpecialty = await getCommonConditionsBySpecialty();

        return {
            allPatients,
            appointmentsPerDoctor,
            appointmentFrequency,
            commonConditionsBySpecialty,
        };
    } catch (error) {
        console.error("Error in data aggregation:", error.message);
        throw error;
    }
};

module.exports = {
    aggregateData,
};