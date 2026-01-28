
export enum WorkType {
  FULL_DAY = 'FULL_DAY',
  HALF_DAY = 'HALF_DAY',
  ABSENT = 'ABSENT',
  OVERTIME = 'OVERTIME'
}

export interface WorkEntry {
  id: string;
  date: string;
  type: WorkType;
  hours?: number;
  bonus?: number;
}

export interface Employee {
  id: string;
  name: string;
  dailyRate: number;
  position: string;
  entries: WorkEntry[];
  joinDate: string;
}

export interface SalaryReport {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  totalAmount: number;
  bonusTotal: number;
  month: string;
}
