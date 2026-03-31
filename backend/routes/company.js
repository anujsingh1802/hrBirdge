import express from "express";
import Company from "../models/Company.js";

const router = express.Router();

// GET /api/companies
router.get("/", async (req, res) => {
  try {
    const { type, search, location, limit = 10, page = 1 } = req.query;
    const query = {};

    if (type) query.type = { $regex: new RegExp(`^${type}$`, "i") };
    if (location) query.location = { $regex: new RegExp(location, "i") };
    if (search) query.name = { $regex: new RegExp(search, "i") };

    const skip = (Number(page) - 1) * Number(limit);
    
    const [items, total] = await Promise.all([
      Company.find(query).skip(skip).limit(Number(limit)),
      Company.countDocuments(query)
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /api/companies/:id
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
