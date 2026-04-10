import Building from './model';
import Room from '../rooms/model';
import mongoose from 'mongoose';

export class BuildingService {
  /**
   * Retrieves buildings with attached room statistics (available, rented, etc.)
   */
  static async getBuildingsWithStats(query: any, skip: number, limit: number) {
    const buildings = await Building.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const buildingsWithStats = await Promise.all(
      buildings.map(async (building) => {
        const stats = await Room.aggregate([
          { $match: { buildingId: building._id } },
          {
            $group: {
              _id: null,
              totalRooms: { $sum: 1 },
              available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
              rented: { $sum: { $cond: [{ $eq: ['$status', 'rented'] }, 1, 0] } },
              booked: { $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] } },
              maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
            }
          }
        ]);

        const buildingStats = stats[0] || {
          totalRooms: 0,
          available: 0,
          rented: 0,
          booked: 0,
          maintenance: 0
        };

        return {
          ...building.toObject(),
          stats: {
            total: buildingStats.totalRooms,
            available: buildingStats.available,
            rented: buildingStats.rented,
            booked: buildingStats.booked,
            maintenance: buildingStats.maintenance
          }
        };
      })
    );

    return buildingsWithStats;
  }
}
