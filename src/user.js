const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('./utils/passwordHash');

// Clear out mongoose's model cache to allow --watch to work for tests:
// https://github.com/Automattic/mongoose/issues/1251
mongoose.models = {};
mongoose.modelSchemas = {};

const UserSchema = new mongoose.Schema({
  // TODO: fill in this schema
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', async function handlePasswordHash(next) {
  try {
    const user = this;
    if (!user.isModified('passwordHash')) return next();
    user.passwordHash = await hashPassword(user.passwordHash);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.checkPassword = async function checkPassword(password) {
  try {
    const match = await comparePassword(password, this.passwordHash);
    return match;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model('User', UserSchema);

