import { User, UserDocument, IUser } from '../models/User.js';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<UserDocument> {
    return User.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string, includePrivateFields = false): Promise<UserDocument | null> {
    let query: any = User.findOne({ email: email.toLowerCase() });
    if (includePrivateFields) {
      query = query.select('+password +verificationToken +verificationExpires +resetPasswordToken +resetPasswordExpires');
    }
    return query;
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationExpires');
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');
  }

  async update(id: string, data: Partial<IUser>): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
