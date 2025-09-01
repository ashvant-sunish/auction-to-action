require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is missing. Check your .env file.");
  process.exit(1);
}

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB for seeding");

    // TODO: add seeding logic here (insert dummy transactions, etc.)

    return mongoose.disconnect();
  })
  .then(() => {
    console.log("✅ Done seeding, disconnected");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  });