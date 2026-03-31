const mongoose = require("mongoose");
require("dotenv").config();
const Company = require("./models/Company");

const companies = [
  {
    name: "Google",
    logo: "https://logo.clearbit.com/google.com",
    type: "MNC",
    location: "Mountain View, CA",
    rating: 4.8,
    tags: ["Technology", "Search", "AI"],
    description: "Organize the world's information and make it universally accessible and useful."
  },
  {
    name: "Stripe",
    logo: "https://logo.clearbit.com/stripe.com",
    type: "Fintech",
    location: "San Francisco, CA",
    rating: 4.7,
    tags: ["Payments", "Infrastructure", "Finance"],
    description: "Financial infrastructure platform for the internet."
  },
  {
    name: "OpenAI",
    logo: "https://logo.clearbit.com/openai.com",
    type: "Startup",
    location: "San Francisco, CA",
    rating: 4.9,
    tags: ["Artificial Intelligence", "Research"],
    description: "Creating safe AGI that benefits all of humanity."
  },
  {
    name: "Coursera",
    logo: "https://logo.clearbit.com/coursera.org",
    type: "Edtech",
    location: "Mountain View, CA",
    rating: 4.5,
    tags: ["Education", "E-learning"],
    description: "Global online learning platform."
  }
];

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal")
  .then(async () => {
    console.log("Connected to MongoDB. Seeding companies...");
    await Company.deleteMany({});
    await Company.insertMany(companies);
    console.log("Companies seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });
