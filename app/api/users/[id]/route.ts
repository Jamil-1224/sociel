import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// Validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 400 }
    );
  }
}

// PUT /api/users/[id] - Update a user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Prevent updating certain fields
    delete body._id;
    delete body.createdAt;
    
    // If email is being updated, check if it's already in use
    if (body.email) {
      const existingUser = await User.findOne({ 
        email: body.email,
        _id: { $ne: params.id }
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already in use by another user' },
          { status: 409 }
        );
      }
    }
    
    const user = await User.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 400 }
    );
  }
}

// PATCH /api/users/[id] - Partial update
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Handle specific updates like lastLogin
    if (body.updateLastLogin) {
      body.lastLogin = new Date();
      delete body.updateLastLogin;
    }
    
    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error patching user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const deletedUser = await User.findByIdAndDelete(params.id);
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully',
      data: {} 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 400 }
    );
  }
}
