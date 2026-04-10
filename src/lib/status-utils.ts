import Contract from '@/modules/contracts/model';
import Room from '@/modules/rooms/model';
import Tenant from '@/modules/tenants/model';

/**
 * Calculates room status based on contracts
 * @param roomId - ID of the room
 * @returns Room status: 'available' | 'booked' | 'rented' | 'maintenance'
 */
export async function calculateRoomStatus(roomId: string): Promise<'available' | 'booked' | 'rented' | 'maintenance'> {
  try {
    const now = new Date();
    
    // Find active contract
    const activeContract = await Contract.findOne({
      roomId: roomId,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (activeContract) {
      return 'rented';
    }

    // Check for booked but not yet started contracts
    const bookedContract = await Contract.findOne({
      roomId: roomId,
      status: 'active',
      startDate: { $gt: now }
    });

    if (bookedContract) {
      return 'booked';
    }

    // Default to available
    return 'available';
  } catch (error) {
    console.error('Error calculating room status:', error);
    return 'available';
  }
}

/**
 * Calculates tenant status based on contracts
 * @param tenantId - ID of the tenant
 * @returns Tenant status: 'renting' | 'checkedOut' | 'idle'
 */
export async function calculateTenantStatus(tenantId: string): Promise<'renting' | 'checkedOut' | 'idle'> {
  try {
    const now = new Date();
    
    // Find active contract for the tenant
    const activeContract = await Contract.findOne({
      $or: [
        { tenantIds: tenantId },
        { representativeId: tenantId }
      ],
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (activeContract) {
      return 'renting';
    }

    // Check if tenant ever had a contract
    const previousContract = await Contract.findOne({
      $or: [
        { tenantIds: tenantId },
        { representativeId: tenantId }
      ]
    });

    if (previousContract) {
      return 'checkedOut'; 
    }

    return 'idle'; 
  } catch (error) {
    console.error('Error calculating tenant status:', error);
    return 'idle';
  }
}

/**
 * Updates room status in DB based on contracts
 * @param roomId - ID of the room
 */
export async function updateRoomStatus(roomId: string): Promise<void> {
  try {
    const newStatus = await calculateRoomStatus(roomId);
    await Room.findByIdAndUpdate(roomId, { status: newStatus });
  } catch (error) {
    console.error('Error updating room status:', error);
  }
}

/**
 * Updates tenant status in DB based on contracts
 * @param tenantId - ID of the tenant
 */
export async function updateTenantStatus(tenantId: string): Promise<void> {
  try {
    const newStatus = await calculateTenantStatus(tenantId);
    await Tenant.findByIdAndUpdate(tenantId, { status: newStatus });
  } catch (error) {
    console.error('Error updating tenant status:', error);
  }
}

/**
 * Updates all room statuses when contracts change
 * @param roomId - Optional ID for single room update
 */
export async function updateAllRoomsStatus(roomId?: string): Promise<void> {
  try {
    if (roomId) {
      await updateRoomStatus(roomId);
    } else {
      const allRooms = await Room.find({}, '_id');
      await Promise.all(
        allRooms.map(room => updateRoomStatus(room._id.toString()))
      );
    }
  } catch (error) {
    console.error('Error updating all rooms status:', error);
  }
}

/**
 * Updates all tenant statuses when contracts change
 * @param tenantIds - Optional list of IDs for specific tenant updates
 */
export async function updateAllTenantsStatus(tenantIds?: string[]): Promise<void> {
  try {
    if (tenantIds && tenantIds.length > 0) {
      await Promise.all(
        tenantIds.map(id => updateTenantStatus(id))
      );
    } else {
      const allTenants = await Tenant.find({}, '_id');
      await Promise.all(
        allTenants.map(tenant => updateTenantStatus(tenant._id.toString()))
      );
    }
  } catch (error) {
    console.error('Error updating all tenants status:', error);
  }
}
