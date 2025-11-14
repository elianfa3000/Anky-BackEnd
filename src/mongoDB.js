import mongoose from "mongoose";

const URL = process.env.MONGODB_URL; //.anv
export default async function connectDB() {
  try {
    await mongoose.connect(URL);

    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.log(err);
    throw err;
  }
}
