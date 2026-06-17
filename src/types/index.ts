export type EventStatus = 'pending' | 'monitoring' | 'containment' | 'cleanup' | 'completed' | 'archived';

export type OilType = 'crude' | 'diesel' | 'gasoline' | 'heavy' | 'lubricant' | 'other';

export type OperationStatus = 'planning' | 'deploying' | 'deployed' | 'recovering' | 'idle' | 'in_progress' | 'paused' | 'completed';

export type ResourceType = 'vessel' | 'equipment' | 'personnel' | 'material';

export type ResourceStatus = 'available' | 'assigned' | 'in_use' | 'returned';

export interface OilSpillEvent {
  id: string;
  eventName: string;
  location: string;
  latitude: number;
  longitude: number;
  oilType: OilType;
  estimatedVolume: number;
  occurrenceTime: string;
  reportTime: string;
  status: EventStatus;
  description: string;
  reporter: string;
  source: string;
}

export interface OilSpreadData {
  id: string;
  eventId: string;
  recordTime: string;
  spreadArea: number;
  thickness: number;
  diffusionDirection: string;
  diffusionSpeed: number;
  centerLat: number;
  centerLng: number;
}

export interface OceanCondition {
  id: string;
  eventId: string;
  recordTime: string;
  windSpeed: number;
  windDirection: string;
  currentSpeed: number;
  currentDirection: string;
  waveHeight: number;
  waterTemperature: number;
  visibility: number;
  tideLevel: number;
}

export interface ContainmentOperation {
  id: string;
  eventId: string;
  boomType: string;
  totalLength: number;
  deployedLength: number;
  deploymentLocation: string;
  status: OperationStatus;
  startTime: string;
  operator: string;
  remarks: string;
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface CleanupOperation {
  id: string;
  eventId: string;
  operationType: 'skimmer' | 'dispersant' | 'shoreline';
  equipment: string;
  equipmentCount: number;
  collectedVolume: number;
  targetVolume: number;
  status: OperationStatus;
  startTime: string;
  operator: string;
  location: string;
  progress: number;
}

export interface ResourceAssignment {
  id: string;
  eventId: string;
  resourceType: ResourceType;
  resourceName: string;
  quantity: number;
  unit: string;
  status: ResourceStatus;
  assignedTime: string;
  currentLocation: string;
  contact: string;
}

export interface EcologyAssessment {
  id: string;
  eventId: string;
  assessmentTime: string;
  affectedArea: number;
  damageLevel: number;
  sensitiveResources: string[];
  affectedSpecies: string[];
  recoveryPlan: string;
  estimatedRecoveryTime: string;
  assessor: string;
}

export interface DisposalProgress {
  id: string;
  eventId: string;
  stage: string;
  stageOrder: number;
  completionRate: number;
  updateTime: string;
  remarks: string;
  milestones: Array<{ name: string; completed: boolean; time?: string }>;
}

export interface StatisticData {
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export const eventStatusLabels: Record<EventStatus, string> = {
  pending: '待处理',
  monitoring: '监测中',
  containment: '围控中',
  cleanup: '清污中',
  completed: '已完成',
  archived: '已归档',
};

export const eventStatusColors: Record<EventStatus, string> = {
  pending: 'bg-alert-yellow text-yellow-800',
  monitoring: 'bg-alert-blue text-blue-800',
  containment: 'bg-alert-orange text-orange-800',
  cleanup: 'bg-purple-100 text-purple-800',
  completed: 'bg-alert-green text-green-800',
  archived: 'bg-slate-200 text-slate-700',
};

export const oilTypeLabels: Record<OilType, string> = {
  crude: '原油',
  diesel: '柴油',
  gasoline: '汽油',
  heavy: '重油',
  lubricant: '润滑油',
  other: '其他',
};

export const operationStatusLabels: Record<string, string> = {
  planning: '规划中',
  deploying: '布放中',
  deployed: '已布放',
  recovering: '回收中',
  idle: '待命',
  in_progress: '进行中',
  paused: '暂停',
  completed: '已完成',
};

export const operationStatusColors: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  deploying: 'bg-alert-yellow text-yellow-800',
  deployed: 'bg-alert-green text-green-800',
  recovering: 'bg-alert-blue text-blue-800',
  idle: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-alert-orange text-orange-800',
  paused: 'bg-alert-yellow text-yellow-800',
  completed: 'bg-alert-green text-green-800',
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  vessel: '船舶',
  equipment: '设备',
  personnel: '人员',
  material: '物资',
};

export const resourceStatusLabels: Record<ResourceStatus, string> = {
  available: '可用',
  assigned: '已分配',
  in_use: '使用中',
  returned: '已归还',
};

export const resourceStatusColors: Record<ResourceStatus, string> = {
  available: 'bg-alert-green text-green-800',
  assigned: 'bg-alert-yellow text-yellow-800',
  in_use: 'bg-alert-orange text-orange-800',
  returned: 'bg-slate-200 text-slate-700',
};
