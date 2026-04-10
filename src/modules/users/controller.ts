import { NextRequest, NextResponse } from 'next/server';
import User from './model';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['admin', 'landlord', 'staff']).optional(),
  status: z.enum(['active', 'locked']).optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
});

export class UserController {
  static async register(request: NextRequest) {
    const body = await request.json();
    
    // Support backward compatibility for registration
    const formattedData = {
      name: body.name || body.ten,
      email: (body.email || '').toLowerCase(),
      password: body.password || body.matKhau,
      phoneNumber: body.phoneNumber || body.soDienThoai,
      role: body.role || (body.vaiTro === 'chuNha' ? 'landlord' : body.vaiTro === 'nhanVien' ? 'staff' : body.role),
      address: body.address,
      avatar: body.avatar
    };

    if (!formattedData.name || !formattedData.email || !formattedData.password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: formattedData.email },
        { phoneNumber: formattedData.phoneNumber }
      ]
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email or phone number already in use' }, { status: 400 });
    }

    const newUser = new User(formattedData);
    await newUser.save();

    return NextResponse.json({ success: true, message: 'Registration successful' }, { status: 201 });
  }

  static async getUsers(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  }

  static async getUserById(id: string) {
    const user = await User.findById(id).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  }

  static async createUser(request: NextRequest) {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const existing = await User.findOne({ email: validatedData.email });
    if (existing) return NextResponse.json({ message: 'Email already in use' }, { status: 400 });

    if (!validatedData.password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const newUser = new User(validatedData);
    await newUser.save();

    const result = newUser.toObject();
    delete result.password;

    return NextResponse.json({ success: true, data: result, message: 'User created successfully' });
  }

  static async updateUser(id: string, request: NextRequest) {
    const body = await request.json();
    const validatedData = userSchema.partial().parse(body);

    if (validatedData.email) {
      const existing = await User.findOne({ email: validatedData.email, _id: { $ne: id } });
      if (existing) return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedUser, message: 'User updated successfully' });
  }

  static async deleteUser(id: string) {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  }

  static async updateProfile(userId: string, request: NextRequest) {
    const body = await request.json();
    // Profile update is limited to non-sensitive fields
    const validatedData = userSchema.pick({
      name: true,
      phoneNumber: true,
      address: true,
      avatar: true,
    }).partial().parse(body);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({ success: true, data: updatedUser, message: 'Profile updated successfully' });
  }
}
