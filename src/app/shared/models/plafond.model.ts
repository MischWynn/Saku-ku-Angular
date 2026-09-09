export type PlafondStatus = 'ACTIVE' | 'INACTIVE';

export interface Plafond {
  idPlafond: string;
  namaPlafond: string;
  deskripsi: string | null;
  tipe: string | null;
  limitMaksimal: number;
  status: PlafondStatus;
  createdAt: string;
}

export interface PlafondRequest {
  namaPlafond: string;
  deskripsi: string;
  tipe: string;
  limitMaksimal: number;
  status: PlafondStatus;
}
