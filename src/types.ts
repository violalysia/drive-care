export type Brand = 'Honda' | 'Yamaha' | 'Suzuki' | 'Kawasaki' | 'Lainnya';
export type MotorType = 'matic' | 'manual' | 'sport';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface MaintenanceItem {
  id: string; // Unique ID for state tracking
  name: string;
  status: 'safe' | 'warning' | 'danger';
  last_service?: string;
  recommendation: string;
}

export interface DriveCareAnalysis {
  motor: string;
  brand: Brand;
  type: MotorType;
  estimated_km: number;
  health_score: number;
  priority_level: PriorityLevel;
  maintenance_checklist: MaintenanceItem[];
  safety_tip: string;
  summary: string;
}

export interface UserMotorData {
  motor: string;
  brand: Brand;
  type: MotorType;
  current_km: number;
  last_service_km?: number;
}
