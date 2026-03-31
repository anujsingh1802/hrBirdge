const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: "" },
    type: { type: String, enum: ["MNC", "Startup", "Fintech", "Edtech", "Other"], default: "Other" },
    location: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 0 },
    tags: [{ type: String }],
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
