
import * as XLSX from 'xlsx';
import { MileageEntry, User } from '@/types';

export function exportToCSV(entries: MileageEntry[], riders: User[], filename: string = 'kilometrage') {
  const data = entries.map(entry => {
    const rider = riders.find(r => r.id === entry.riderId);
    return {
      'Date': new Date(entry.timestamp).toLocaleDateString('fr-FR'),
      'Heure': new Date(entry.timestamp).toLocaleTimeString('fr-FR'),
      'Rider': rider?.name || 'Inconnu',
      'Matricule': rider?.matricule || 'N/A',
      'Type': entry.type,
      'Shift': entry.shift,
      'Kilométrage': entry.kilometrage
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kilométrage');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
}
