/**
 * User model.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../dto/user.dto";

export interface IUser extends mongoose.Document, User {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: { type: String, trim: true, required: true },
    password: { type: String, trim: true, required: true },
  },
  { timestamps: true, toObject: { getters: true }, toJSON: { getters: true } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.get("password"), salt);
  this.set("password", hash);
  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt
    .compare(candidatePassword, this.get("password"))
    .catch(() => false);
};

const User = mongoose.model("User", userSchema);

export default User;
