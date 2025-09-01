import dotenv from "dotenv";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js"; // adjust path if needed

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding...");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  try {
    await Transaction.deleteMany();

    await Transaction.insertMany([
      {
        teamId: "TeamA",
        itemName: "Laptop",
        amount: 2000,
        date: new Date(),
      },
      {
        teamId: "TeamB",
        itemName: "Projector",
        amount: 1500,
        date: new Date(),
      },
    ]);

    console.log("Sample transactions inserted!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
};

seed();