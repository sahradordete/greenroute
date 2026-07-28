const mongoose = require("mongoose")

const journeySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true},
    origin: { type: String, required: true }, 
    destination: { type: String, required: true }, 
    distanceKm: { type: Number, required: true, min: [0.01, "Distance must be greater than 0"] }, 
    modeId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportMode", required: true }, 
    emissionFactorUsed: { type: Number, required: true }, 
    estimatedEmissions: { type: Number, required: true }
}, 
{
    timestamps: true
});

module.exports = mongoose.model("Journey", journeySchema);
