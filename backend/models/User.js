const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
  type: String,
  unique: true,
  sparse: true,   // allows null/undefined without unique conflict
  trim: true,
  minlength: 3
},
  googleId: {
  type: String,
  sparse: true
},
avatar: {
  type: String
},
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 100000 // $100,000 virtual USD
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();   // skip hashing if no password (Google users)
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toPublic = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    balance: this.balance,
    avatar: this.avatar,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
