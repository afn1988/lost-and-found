/**
 * User model.
 */
import mongoose, { model, Model } from "mongoose";
import bcrypt from "bcrypt";
import { User, UserRole } from "../dto/user.dto";

export interface IUser extends mongoose.Document, Omit<User, "password"> {
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAgent(): boolean;
  isPassenger(): boolean;
}

/**
 * Create a custom interface for the model to include static methods
 */
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.AGENT,
      required: true,
    },
    refreshToken: {
      type: String,
      select: false, // Don't include refresh token in queries by default
    },
  },
  { timestamps: true, toObject: { getters: true }, toJSON: { getters: true } }
);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.get("password"), salt);
  this.set("password", hash);
  return next();
});

// Compare the password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt
    .compare(candidatePassword, this.get("password"))
    .catch(() => false);
};

userSchema.methods.isAgent = function(): boolean {
  return this.role === UserRole.AGENT;
};

userSchema.methods.isPassenger = function(): boolean {
  return this.role === UserRole.PASSENGER;
};

// Find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).exec();
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
