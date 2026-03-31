const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "User",
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    refreshToken: { type: String },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return user object without password field
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
