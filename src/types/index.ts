export interface User {
  id: string;
  email: string;
  role: 'patient' | 'provider';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
  };
  patientInfo?: {
    allergies: string[];
    medications: string[];
    assignedProvider?: string;
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
  providerInfo?: {
    licenseNumber: string;
    specialization: string;
    patients: string[];
  };
}

export interface WellnessGoal {
  _id: string;
  patientId: string;
  assignedBy: string;
  goalType: 'steps' | 'water_intake' | 'sleep_hours' | 'exercise_minutes' | 'weight_loss';
  targets: {
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  unit: string;
  duration: {
    startDate: string;
    endDate: string;
    periodType: string;
  };
  progress: {
    currentStreak: number;
    longestStreak: number;
    daysCompleted: number;
    totalDays: number;
    completionRate: number;
  };
  status: 'active' | 'completed' | 'paused' | 'expired';
  notes?: string;
}

export interface DailyProgress {
  _id: string;
  goalId: string;
  date: string;
  targetValue: number;
  actualValue: number;
  achieved: boolean;
  completionPercentage: number;
}

export interface PreventiveCare {
  _id: string;
  careType: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface HealthTip {
  _id: string;
  title: string;
  content: string;
  category: string;
}

export interface DashboardData {
  activeGoals: number;
  todayProgress: DailyProgress[];
  upcomingCare: PreventiveCare[];
  healthTip: HealthTip;
}