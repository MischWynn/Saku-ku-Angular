export type BungaTenorStatus = 'ACTIVE' | 'INACTIVE';

export interface BungaTenor {
  id: string;
  tenor: number;
  interestRate: number;
  status: BungaTenorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BungaTenorRequest {
  tenor: number;
  interestRate: number;
  status: BungaTenorStatus;
}
