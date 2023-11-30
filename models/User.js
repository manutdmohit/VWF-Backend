const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      trim: true,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: `{VALUE} is not supported. Only male or female or other is supported`,
      },
    },
    address: {
      type: String,
      trim: true,
    },
    guardian_name: {
      type: String,
      trim: true,
    },
    phone: {
      type: [String],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'staff', 'child'],
        message: `{VALUE} is not supported. Only admin or staff or child is supported`,
      },
      default: 'child',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving to the database
UserSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the generated salt
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Replace the plain password with the hashed one
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare the provided password with the hashed password in the database
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
