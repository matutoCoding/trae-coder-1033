export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};

export const getTimeDiff = (startTime: string, endTime?: string): string => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const diff = end - start;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}天${remainingHours}小时`;
  }
  return `${hours}小时${minutes}分钟`;
};

export const getWindDirectionAngle = (direction: string): number => {
  const directions: Record<string, number> = {
    '北': 0,
    '东北': 45,
    '东': 90,
    '东南': 135,
    '南': 180,
    '西南': 225,
    '西': 270,
    '西北': 315,
    '东北偏东': 67.5,
    '东南偏东': 112.5,
    '东南偏南': 157.5,
    '西南偏南': 202.5,
    '西南偏西': 247.5,
    '西北偏西': 292.5,
    '西北偏北': 337.5,
    '东北偏北': 22.5,
  };
  return directions[direction] || 0;
};

export const latLngToXY = (
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  scale: number = 5000
): { x: number; y: number } => {
  const x = (lng - centerLng) * scale + 400;
  const y = (centerLat - lat) * scale + 300;
  return { x, y };
};

export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'bg-alert-green';
  if (progress >= 50) return 'bg-alert-blue';
  if (progress >= 20) return 'bg-alert-yellow';
  return 'bg-alert-orange';
};
