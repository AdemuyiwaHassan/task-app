const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum length for password
      trim: true, // Trim whitespace from the password
      validate(value) {
        // if (validate.isStrongPassword(value)) {
        //   throw new Error("Password is not strong enough");
        // }
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain the word 'password'");
        }
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field: lets us populate all tasks for a user
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "author",
});

// Ensure virtuals show up in JSON / objects
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Hide some properties
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// Method to generate authentication token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id.toString() },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: "7 days",
    }
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//find by credential
userSchema.statics.findbyCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * Cascade delete (query middleware)
 * Triggered when you call: await User.findByIdAndDelete(id)
 */
userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    await mongoose.model("Task").deleteMany({ author: user._id });
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
