
import localForage from 'localforage';
import { MileageEntry, User } from '@/types';

// Configure localForage
localForage.config({
  name: 'KilometrageApp',
  version: 1.0,
  storeName: 'app_data'
});

export const storage = {
  async saveEntry(entry: MileageEntry): Promise<void> {
    const entries = await this.getEntries();
    const updatedEntries = [...entries, entry];
    await localForage.setItem('mileageEntries', updatedEntries);
  },

  async getEntries(): Promise<MileageEntry[]> {
    const entries = await localForage.getItem<MileageEntry[]>('mileageEntries');
    return entries || [];
  },

  async getEntriesByRider(riderId: string): Promise<MileageEntry[]> {
    const entries = await this.getEntries();
    return entries.filter(entry => entry.riderId === riderId);
  },

  async getRiders(): Promise<User[]> {
    const riders = await localForage.getItem<User[]>('riders');
    return riders || [];
  },

  async updateRider(rider: User): Promise<void> {
    const riders = await this.getRiders();
    const updatedRiders = riders.map(r => r.id === rider.id ? rider : r);
    await localForage.setItem('riders', updatedRiders);
  }
};
