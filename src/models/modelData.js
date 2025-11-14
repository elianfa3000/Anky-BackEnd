import mongoose from "mongoose";

const dataSchema = mongoose.Schema({}, { strict: false });

export default mongoose.model("items", dataSchema);
