import Tenant from './model';
import Contract from '../contracts/model';
import { updateTenantStatus } from '@/lib/status-utils';

export class TenantService {
  /**
   * Retrieves tenants with attached active contract and room info.
   */
  static async getTenantsWithDetails(query: any, skip: number, limit: number) {
    const tenants = await Tenant.find(query)
      .select('+password') 
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(limit);

    // Sync statuses first
    await Promise.all(
      tenants.map(tenant => updateTenantStatus(tenant._id.toString()))
    );

    // Refresh data after status sync (or just map it if we don't want another query)
    const refreshedTenants = await Tenant.find(query)
      .select('+password')
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(limit);

    const tenantsWithContracts = await Promise.all(
      refreshedTenants.map(async (tenant) => {
        const contract = await Contract.findOne({
          $or: [{ tenantIds: tenant._id }, { representativeId: tenant._id }],
          status: 'active',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        })
        .populate({
          path: 'roomId',
          select: 'roomCode buildingId',
          populate: {
            path: 'buildingId',
            select: 'name'
          }
        })
        .lean();
        
        const tenantObj = tenant.toObject();
        return {
          ...tenantObj,
          password: !!tenantObj.password ? '******' : undefined,
          currentContract: contract
        };
      })
    );

    return tenantsWithContracts;
  }
}
