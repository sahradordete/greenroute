const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    emissionFactor: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TransportMode", transportSchema);
