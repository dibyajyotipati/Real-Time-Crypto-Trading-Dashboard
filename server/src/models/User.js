import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for Google users
    googleId: { type: String },
    provider: { type: String, default: "local" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
