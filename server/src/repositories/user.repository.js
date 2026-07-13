import { User, } from '../models/User.js';

export class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email, includePrivateFields = false) {
    let query = User.findOne({ email: email.toLowerCase() });
    if (includePrivateFields) {
      query = query.select('+password +verificationToken +verificationExpires +resetPasswordToken +resetPasswordExpires');
    }
    return query;
  }

  async findByVerificationToken(token) {
    return User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationExpires');
  }

  async findByResetToken(token) {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');
  }

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async existsByEmail(email) {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
