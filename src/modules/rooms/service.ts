import Room from './model';
import Contract from '../contracts/model';
import mongoose from 'mongoose';

export class RoomService {
  /**
   * Retrieves a list of rooms with their current active contracts in an optimized way.
   * Standardized for modular English naming.
   */
  static async getRoomsWithStats(query: any, skip: number, limit: number) {
    // 1. Get the basic room list
    const rooms = await Room.find(query)
      .populate('buildingId', 'name address')
      .sort({ roomCode: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (rooms.length === 0) return [];

    const roomIds = rooms.map(r => r._id);

    // 2. Fetch all active contracts for these rooms
    const activeContracts = await Contract.find({
      roomId: { $in: roomIds },
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate('tenantIds', 'fullName phoneNumber')
    .populate('representativeId', 'fullName phoneNumber')
    .lean();

    // 3. Map contracts back to rooms
    const contractMap = new Map();
    activeContracts.forEach((contract: any) => {
      contractMap.set(contract.roomId.toString(), contract);
    });

    return rooms.map((room: any) => ({
      ...room,
      currentContract: contractMap.get(room._id.toString()) || null
    }));
  }

  /**
   * Derives room status based on active or upcoming contracts.
   */
  static async deriveStatus(roomId: string): Promise<'available' | 'booked' | 'rented' | 'maintenance'> {
    const now = new Date();
    
    const activeContract = await Contract.findOne({
      roomId,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean();

    if (activeContract) return 'rented';

    const upcomingContract = await Contract.findOne({
      roomId,
      status: 'active',
      startDate: { $gt: now }
    }).lean();

    if (upcomingContract) return 'booked';

    // We keep 'maintenance' if it was already set manually, otherwise 'available'
    const room: any = await Room.findById(roomId).select('status').lean();
    return room?.status === 'maintenance' ? 'maintenance' : 'available';
  }

  /**
   * Batch updates room statuses for better performance.
   */
  static async syncAllRoomStatuses() {
    const rooms = await Room.find({}, '_id').lean();
    const updates = await Promise.all(rooms.map(async (r: any) => {
      const status = await this.deriveStatus(r._id.toString());
      return {
        updateOne: {
          filter: { _id: r._id },
          update: { $set: { status: status } }
        }
      };
    }));

    if (updates.length > 0) {
      await Room.bulkWrite(updates as any);
    }
  }
}
