const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');
const { Client } = require('pg');

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

// Insert data into Redshift
const insertAppointmentsPerDoctor = async (appointments) => {
    const query = `INSERT INTO health_sync.public.AppointmentsPerDoctor (DoctorId, DoctorName, Specialization, AppointmentCount)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (DoctorId) DO UPDATE SET
                   DoctorName = EXCLUDED.DoctorName,
                   Specialization = EXCLUDED.Specialization,
                   AppointmentCount = EXCLUDED.AppointmentCount;`;

    for (const appointment of appointments) {
        const { doctorId, doctorName, specialization, totalAppointments } = appointment;
        await redshiftClient.query(query, [doctorId, doctorName, specialization || null, totalAppointments]);
    }
};

const insertAppointmentFrequency = async (frequencies) => {
    const query = `INSERT INTO health_sync.public.AppointmentFrequency (AppointmentDate, AppointmentCount)
                   VALUES ($1, $2)
                   ON CONFLICT (AppointmentDate) DO UPDATE SET
                   AppointmentCount = EXCLUDED.AppointmentCount;`;

    for (const frequency of frequencies) {
        const { year, month, totalAppointments } = frequency;
        const date = new Date(year, month - 1, 1); // Create a date object for the first day of the month
        await redshiftClient.query(query, [date.toISOString().split('T')[0], totalAppointments]);
    }
};

const insertCommonConditionsBySpecialty = async (conditions) => {
    const query = `INSERT INTO health_sync.public.CommonConditionsBySpecialty (Specialty, CommonCondition)
                   VALUES ($1, $2)
                   ON CONFLICT (Specialty, CommonCondition) DO NOTHING;`;

    for (const condition of conditions) {
        const { specialty, commonConditions } = condition;
        for (const commonCondition of commonConditions) {
            await redshiftClient.query(query, [specialty, commonCondition]);
        }
    }
};

// Main aggregation function
const aggregateData = async () => {
    try {
        await connectDB(); // Connect to MongoDB

        // Fetch data from MongoDB
        const appointmentsPerDoctor = await getAppointmentsPerDoctor();
        const appointmentFrequency = await getAppointmentFrequency();
        const commonConditionsBySpecialty = await getCommonConditionsBySpecialty();

        // Insert data into Redshift
        await insertAppointmentsPerDoctor(appointmentsPerDoctor);
        await insertAppointmentFrequency(appointmentFrequency);
        await insertCommonConditionsBySpecialty(commonConditionsBySpecialty);

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