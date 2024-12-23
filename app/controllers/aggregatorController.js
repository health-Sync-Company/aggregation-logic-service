const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');

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
                from: "doctors", // Replace with the actual collection name for doctors
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
                _id: "$specialty", // Replace with the actual field representing specialty
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

// Main aggregation function
const aggregateData = async () => {
    try {
        const appointmentsPerDoctor = await getAppointmentsPerDoctor();
        const appointmentFrequency = await getAppointmentFrequency();
        const commonConditionsBySpecialty = await getCommonConditionsBySpecialty();

        return {
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
