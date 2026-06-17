import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  OilSpillEvent,
  OilSpreadData,
  OceanCondition,
  ContainmentOperation,
  CleanupOperation,
  ResourceAssignment,
  EcologyAssessment,
  DisposalProgress,
  EventStatus,
  OperationStatus,
  TimelineItem,
  EventSummaryReport,
  CleanupType,
  ResourceStatus,
  ReportStatus,
  TaskBoardItem,
  ShoreSegment,
} from '../types';
import { oilTypeLabels, operationStatusLabels, resourceStatusLabels } from '../types';
import {
  mockEvents,
  mockOilSpreadData,
  mockOceanConditions,
  mockContainmentOperations,
  mockCleanupOperations,
  mockResourceAssignments,
  mockEcologyAssessment,
  mockDisposalProgress,
  mockShoreSegments,
} from '../data/mockData';
import { getTimeDiff } from '../utils/helpers';

interface AppState {
  events: OilSpillEvent[];
  currentEvent: OilSpillEvent | null;
  oilSpreadData: OilSpreadData[];
  oceanConditions: OceanCondition[];
  containmentOperations: ContainmentOperation[];
  cleanupOperations: CleanupOperation[];
  resourceAssignments: ResourceAssignment[];
  ecologyAssessments: EcologyAssessment[];
  shoreSegments: ShoreSegment[];
  disposalProgress: DisposalProgress[];
  summaryReports: EventSummaryReport[];
  sidebarCollapsed: boolean;

  setCurrentEvent: (event: OilSpillEvent | null) => void;
  addEvent: (event: Omit<OilSpillEvent, 'id'>) => OilSpillEvent;
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  toggleSidebar: () => void;
  getEventById: (id: string) => OilSpillEvent | undefined;
  getEventOilSpreadData: (eventId: string) => OilSpreadData[];
  getEventOceanConditions: (eventId: string) => OceanCondition[];
  getEventContainmentOperations: (eventId: string) => ContainmentOperation[];
  getEventCleanupOperations: (eventId: string, type?: CleanupType) => CleanupOperation[];
  getEventResourceAssignments: (eventId: string) => ResourceAssignment[];
  getEventDisposalProgress: (eventId: string) => DisposalProgress[];
  getEventEcologyAssessment: (eventId: string) => EcologyAssessment | undefined;
  getEventShoreSegments: (eventId: string) => ShoreSegment[];
  generateTimeline: (eventId: string) => TimelineItem[];
  computeDynamicProgress: (eventId: string) => DisposalProgress[];
  generateTaskBoard: (eventId: string) => TaskBoardItem[];

  updateCleanupProgress: (operationId: string, progress: number, collectedVolume?: number) => void;
  updateContainmentStatus: (operationId: string, status: OperationStatus, deployedLength?: number) => void;
  addContainmentOperation: (op: Omit<ContainmentOperation, 'id'>) => void;
  addCleanupOperation: (op: Omit<CleanupOperation, 'id'>) => void;
  updateCleanupStatus: (operationId: string, status: OperationStatus) => void;
  updateResourceStatus: (resourceId: string, status: ResourceStatus, task?: string) => void;
  updateResourcePosition: (resourceId: string, location: string) => void;
  assignResource: (
    resourceId: string,
    eventId: string,
    task: string,
    operationType?: CleanupType,
    targetLocation?: string
  ) => void;
  startResourceWork: (resourceId: string) => void;
  pauseResourceWork: (resourceId: string) => void;
  completeResourceWork: (resourceId: string) => void;

  generateSummaryReport: (eventId: string) => EventSummaryReport;
  getEventSummaryReports: (eventId: string) => EventSummaryReport[];
  getLatestReport: (eventId: string) => EventSummaryReport | undefined;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;

  updateShoreSegmentProgress: (segmentId: string, progress: number, collectedWaste?: number) => void;
  updateShoreSegmentStatus: (segmentId: string, status: ShoreSegment['status']) => void;
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const parseTime = (t: string) => new Date(t).getTime();

const isOverdue = (startTime: string, progress: number): boolean => {
  const hoursElapsed = (Date.now() - parseTime(startTime)) / (1000 * 60 * 60);
  return hoursElapsed > 24 && progress < 50;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      events: mockEvents,
      currentEvent: mockEvents[0],
      oilSpreadData: mockOilSpreadData,
      oceanConditions: mockOceanConditions,
      containmentOperations: mockContainmentOperations,
      cleanupOperations: mockCleanupOperations,
      resourceAssignments: mockResourceAssignments,
      ecologyAssessments: [mockEcologyAssessment],
      shoreSegments: mockShoreSegments,
      disposalProgress: mockDisposalProgress,
      summaryReports: [],
      sidebarCollapsed: false,

      setCurrentEvent: (event) => set({ currentEvent: event }),

      addEvent: (eventData) => {
        const newEvent: OilSpillEvent = {
          ...eventData,
          id: genId('EVT'),
        };
        set((state) => ({ events: [newEvent, ...state.events], currentEvent: newEvent }));
        return newEvent;
      },

      updateEventStatus: (eventId, status) => set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, status } : e
        ),
        currentEvent: state.currentEvent?.id === eventId
          ? { ...state.currentEvent, status }
          : state.currentEvent,
      })),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      getEventById: (id) => get().events.find((e) => e.id === id),

      getEventOilSpreadData: (eventId) =>
        get().oilSpreadData.filter((d) => d.eventId === eventId),

      getEventOceanConditions: (eventId) =>
        get().oceanConditions.filter((d) => d.eventId === eventId),

      getEventContainmentOperations: (eventId) =>
        get().containmentOperations.filter((o) => o.eventId === eventId),

      getEventCleanupOperations: (eventId, type) => {
        const list = get().cleanupOperations.filter((o) => o.eventId === eventId);
        return type ? list.filter((o) => o.operationType === type) : list;
      },

      getEventResourceAssignments: (eventId) =>
        get().resourceAssignments.filter((r) => r.eventId === eventId),

      getEventDisposalProgress: (eventId) => {
        const staticProgress = get().disposalProgress.filter((p) => p.eventId === eventId);
        if (staticProgress.length > 0) return staticProgress;
        return get().computeDynamicProgress(eventId);
      },

      getEventEcologyAssessment: (eventId) =>
        get().ecologyAssessments.find((e) => e.eventId === eventId),

      getEventShoreSegments: (eventId) =>
        get().shoreSegments.filter((s) => s.eventId === eventId),

      generateTimeline: (eventId) => {
        const items: TimelineItem[] = [];
        const event = get().getEventById(eventId);
        if (!event) return [];

        items.push({
          id: `tl-event-occur-${event.id}`,
          time: event.occurrenceTime,
          title: '溢油发生',
          description: `${event.location} 发生 ${oilTypeLabels[event.oilType]} 溢油，预估 ${event.estimatedVolume} 吨`,
          category: 'event',
          linkPath: `/events/${event.id}`,
          status: 'critical',
        });

        items.push({
          id: `tl-event-report-${event.id}`,
          time: event.reportTime,
          title: '事件接报登记',
          description: `${event.reporter} 接报并登记事件`,
          category: 'event',
          linkPath: `/events/${event.id}`,
          status: 'normal',
        });

        const spreadData = get().getEventOilSpreadData(eventId);
        if (spreadData.length > 0) {
          const first = spreadData[0];
          items.push({
            id: `tl-monitor-${first.id}`,
            time: first.recordTime,
            title: '开始油膜监测',
            description: `初始扩散面积 ${first.spreadArea} km²，扩散方向 ${first.diffusionDirection}`,
            category: 'monitoring',
            linkPath: '/monitoring/oil-spread',
            status: 'normal',
          });
          const last = spreadData[spreadData.length - 1];
          if (last.id !== first.id) {
            items.push({
              id: `tl-monitor-latest-${last.id}`,
              time: last.recordTime,
              title: '最新监测数据',
              description: `当前扩散面积 ${last.spreadArea} km²，油膜厚度 ${(last.thickness * 1000).toFixed(2)} mm`,
              category: 'monitoring',
              linkPath: '/monitoring/oil-spread',
              status: 'warning',
            });
          }
        }

        const containmentOps = get().getEventContainmentOperations(eventId);
        containmentOps.forEach((op) => {
          items.push({
            id: `tl-contain-${op.id}`,
            time: op.startTime,
            title: `围油栏布放：${op.boomType}`,
            description: `位置：${op.deploymentLocation}，长度 ${op.totalLength} 米，作业队伍：${op.operator}`,
            category: 'containment',
            linkPath: '/containment/boom',
            status: op.status === 'deployed' ? 'success' : 'normal',
          });
        });

        const cleanupOps = get().getEventCleanupOperations(eventId);
        cleanupOps.forEach((op) => {
          const typeMap: Record<string, string> = {
            skimmer: '撇油器收油',
            dispersant: '消油剂喷洒',
            shoreline: '岸线清理',
          };
          items.push({
            id: `tl-cleanup-${op.id}`,
            time: op.startTime,
            title: `${typeMap[op.operationType] || '清污作业'}：${op.equipment}`,
            description: `位置：${op.location}，进度 ${op.progress}%，作业方：${op.operator}`,
            category: 'cleanup',
            linkPath:
              op.operationType === 'skimmer'
                ? '/cleanup/skimmer'
                : op.operationType === 'dispersant'
                ? '/cleanup/dispersant'
                : '/cleanup/shoreline',
            status: op.status === 'completed' ? 'success' : 'normal',
          });
        });

        const resources = get().getEventResourceAssignments(eventId);
        resources
          .filter((r) => r.resourceType === 'vessel')
          .forEach((r) => {
            items.push({
              id: `tl-res-${r.id}`,
              time: r.assignedTime,
              title: `资源调度：${r.resourceName}`,
              description: `${r.quantity} ${r.unit}，位置：${r.currentLocation}，状态：${resourceStatusLabels[r.status]}`,
              category: 'resource',
              linkPath: '/resources/vessels',
              status: r.status === 'in_use' ? 'normal' : 'warning',
            });
          });

        const eco = get().getEventEcologyAssessment(eventId);
        if (eco) {
          items.push({
            id: `tl-eco-${eco.id}`,
            time: eco.assessmentTime,
            title: '生态损害评估',
            description: `损害等级 ${eco.damageLevel}/10，影响面积 ${eco.affectedArea} km²`,
            category: 'ecology',
            linkPath: '/ecology/assessment',
            status: eco.damageLevel > 7 ? 'critical' : 'warning',
          });
        }

        const reports = get().getEventSummaryReports(eventId);
        reports.forEach((r) => {
          const statusLabel: Record<ReportStatus, string> = {
            draft: '草稿',
            submitted: '送审中',
            confirmed: '已确认',
            archived: '已归档',
          };
          items.push({
            id: `tl-report-${r.id}`,
            time: r.generatedAt,
            title: `总结报告 v${r.version}（${statusLabel[r.status]}）`,
            description: `总体进度 ${r.overallProgress}%，回收率 ${r.recoveryStats.recoveryRate}%`,
            category: 'summary',
            linkPath: '/statistics/summary',
            status: r.status === 'archived' ? 'success' : r.status === 'submitted' ? 'warning' : 'normal',
          });
        });

        return items.sort((a, b) => parseTime(a.time) - parseTime(b.time));
      },

      computeDynamicProgress: (eventId) => {
        const result: DisposalProgress[] = [];
        const state = get();
        const event = state.getEventById(eventId);
        if (!event) return result;

        const containmentOps = state.getEventContainmentOperations(eventId);
        const cleanupOps = state.getEventCleanupOperations(eventId);
        const resources = state.getEventResourceAssignments(eventId);
        const spreadData = state.getEventOilSpreadData(eventId);
        const eco = state.getEventEcologyAssessment(eventId);
        const hasEco = !!eco;

        const calc = (ratio: number) => Math.min(100, Math.round(ratio * 100));

        const eventComplete = event.status !== 'pending';
        result.push({
          id: `dp-event-${eventId}`,
          eventId,
          stage: '事件响应',
          stageOrder: 1,
          completionRate: eventComplete ? 100 : 30,
          updateTime: event.reportTime,
          remarks: eventComplete ? '已完成事件接报、核实和分级响应' : '事件核实中',
          milestones: [
            { name: '接报登记', completed: true, time: event.reportTime },
            { name: '事件核实', completed: eventComplete, time: eventComplete ? event.reportTime : undefined },
            { name: '启动预案', completed: eventComplete, time: eventComplete ? event.reportTime : undefined },
          ],
        });

        const monitorRate = spreadData.length >= 5 ? 1 : spreadData.length / 5;
        result.push({
          id: `dp-monitor-${eventId}`,
          eventId,
          stage: '监测研判',
          stageOrder: 2,
          completionRate: calc(monitorRate),
          updateTime: spreadData.length > 0 ? spreadData[spreadData.length - 1].recordTime : event.reportTime,
          remarks: spreadData.length > 0 ? `已获取 ${spreadData.length} 条监测数据` : '等待监测数据',
          milestones: [
            { name: '初始监测', completed: spreadData.length > 0, time: spreadData[0]?.recordTime },
            { name: '扩散预测', completed: spreadData.length >= 3, time: spreadData[2]?.recordTime },
            { name: '持续跟踪', completed: spreadData.length >= 5, time: spreadData[4]?.recordTime },
          ],
        });

        let containProgress = 0;
        if (containmentOps.length > 0) {
          const totalLen = containmentOps.reduce((s, o) => s + o.totalLength, 0);
          const deployedLen = containmentOps.reduce((s, o) => s + o.deployedLength, 0);
          containProgress = totalLen > 0 ? deployedLen / totalLen : 0;
        }
        result.push({
          id: `dp-contain-${eventId}`,
          eventId,
          stage: '围控布防',
          stageOrder: 3,
          completionRate: calc(containProgress),
          updateTime: containmentOps.length > 0 ? containmentOps[0].startTime : event.reportTime,
          remarks: containmentOps.length > 0
            ? `共 ${containmentOps.length} 处围油栏，已布放 ${containmentOps.reduce((s, o) => s + o.deployedLength, 0)} 米`
            : '围控方案制定中',
          milestones: [
            { name: '方案制定', completed: containmentOps.length > 0 },
            { name: '围油栏布放', completed: containProgress > 0.5, time: containmentOps[0]?.startTime },
            { name: '围控效果评估', completed: containmentOps.some((o) => o.status === 'deployed') },
          ],
        });

        let cleanupProgress = 0;
        if (cleanupOps.length > 0) {
          const total = cleanupOps.reduce((s, o) => s + o.targetVolume, 0);
          const done = cleanupOps.reduce((s, o) => s + o.collectedVolume, 0);
          cleanupProgress = total > 0 ? done / total : 0;
        }
        result.push({
          id: `dp-cleanup-${eventId}`,
          eventId,
          stage: '清污作业',
          stageOrder: 4,
          completionRate: calc(cleanupProgress),
          updateTime: cleanupOps.length > 0 ? cleanupOps[0].startTime : event.reportTime,
          remarks: cleanupOps.length > 0
            ? `${cleanupOps.length} 项清污作业进行中，累计回收 ${cleanupOps.reduce((s, o) => s + o.collectedVolume, 0).toFixed(1)} 吨`
            : '清污准备中',
          milestones: [
            { name: '机械收油', completed: cleanupOps.some((o) => o.operationType === 'skimmer' && o.progress > 0) },
            { name: '消油剂喷洒', completed: cleanupOps.some((o) => o.operationType === 'dispersant' && o.progress > 0) },
            { name: '岸线清理', completed: cleanupOps.some((o) => o.operationType === 'shoreline' && o.progress > 0) },
          ],
        });

        const assigned = resources.filter((r) => r.status === 'in_use' || r.status === 'assigned');
        const resourceRate = resources.length > 0 ? assigned.length / Math.min(resources.length, 6) : 0;
        result.push({
          id: `dp-res-${eventId}`,
          eventId,
          stage: '资源调度',
          stageOrder: 5,
          completionRate: calc(Math.min(1, resourceRate)),
          updateTime: resources.length > 0 ? resources[0].assignedTime : event.reportTime,
          remarks: `已调度 ${resources.length} 类资源，${assigned.length} 项已到位`,
          milestones: [
            { name: '队伍集结', completed: resources.some((r) => r.resourceType === 'personnel') },
            { name: '物资调运', completed: resources.some((r) => r.resourceType === 'material') },
            { name: '现场保障', completed: assigned.length >= 3 },
          ],
        });

        result.push({
          id: `dp-eco-${eventId}`,
          eventId,
          stage: '生态评估',
          stageOrder: 6,
          completionRate: hasEco ? 100 : 0,
          updateTime: hasEco ? eco!.assessmentTime : event.reportTime,
          remarks: hasEco
            ? `损害等级 ${eco!.damageLevel}/10，预计恢复时间 ${eco!.estimatedRecoveryTime}`
            : '待开展生态评估',
          milestones: [
            { name: '快速评估', completed: hasEco, time: hasEco ? eco!.assessmentTime : undefined },
            { name: '损害调查', completed: hasEco },
            { name: '修复方案', completed: hasEco && !!eco!.recoveryPlan },
          ],
        });

        const overall = result.reduce((s, r) => s + r.completionRate, 0) / result.length;
        const isCompleted = event.status === 'completed' || event.status === 'archived';
        const reports = state.getEventSummaryReports(eventId);
        const hasArchived = reports.some((r) => r.status === 'archived');
        result.push({
          id: `dp-summary-${eventId}`,
          eventId,
          stage: '收尾总结',
          stageOrder: 7,
          completionRate: hasArchived ? 100 : isCompleted ? 80 : overall > 80 ? 50 : 0,
          updateTime: new Date().toLocaleString('zh-CN'),
          remarks: hasArchived ? '事件已归档' : isCompleted ? '总结确认中' : overall > 80 ? '进入收尾阶段' : '处置进行中',
          milestones: [
            { name: '清场验收', completed: isCompleted },
            { name: '事件总结', completed: reports.length > 0 },
            { name: '经验归档', completed: hasArchived },
          ],
        });

        return result.sort((a, b) => a.stageOrder - b.stageOrder);
      },

      generateTaskBoard: (eventId) => {
        const items: TaskBoardItem[] = [];
        const state = get();

        const containmentOps = state.getEventContainmentOperations(eventId);
        containmentOps.forEach((op) => {
          items.push({
            id: `task-contain-${op.id}`,
            category: 'containment',
            title: `围油栏布放 - ${op.boomType}`,
            description: op.remarks || '围控溢油扩散',
            responsibleUnit: op.operator,
            targetLocation: op.deploymentLocation,
            status: operationStatusLabels[op.status],
            startTime: op.startTime,
            progress: op.totalLength > 0 ? Math.round((op.deployedLength / op.totalLength) * 100) : 0,
            isOverdue: isOverdue(op.startTime, op.totalLength > 0 ? (op.deployedLength / op.totalLength) * 100 : 0),
            linkPath: '/containment/boom',
          });
        });

        const skimmerOps = state.getEventCleanupOperations(eventId, 'skimmer');
        skimmerOps.forEach((op) => {
          items.push({
            id: `task-skim-${op.id}`,
            category: 'skimmer',
            title: `撇油器收油 - ${op.equipment}`,
            description: `目标回收 ${op.targetVolume} 吨`,
            responsibleUnit: op.operator,
            targetLocation: op.location,
            status: operationStatusLabels[op.status],
            startTime: op.startTime,
            progress: op.progress,
            isOverdue: isOverdue(op.startTime, op.progress),
            linkPath: '/cleanup/skimmer',
          });
        });

        const dispersantOps = state.getEventCleanupOperations(eventId, 'dispersant');
        dispersantOps.forEach((op) => {
          items.push({
            id: `task-disp-${op.id}`,
            category: 'dispersant',
            title: `消油剂喷洒 - ${op.equipment}`,
            description: `目标用量 ${op.targetVolume} 吨`,
            responsibleUnit: op.operator,
            targetLocation: op.location,
            status: operationStatusLabels[op.status],
            startTime: op.startTime,
            progress: op.progress,
            isOverdue: isOverdue(op.startTime, op.progress),
            linkPath: '/cleanup/dispersant',
          });
        });

        const vessels = state.getEventResourceAssignments(eventId).filter((r) => r.resourceType === 'vessel');
        vessels.forEach((v) => {
          items.push({
            id: `task-vessel-${v.id}`,
            category: 'vessel',
            title: `${v.resourceName}`,
            description: v.currentTask || '待命',
            responsibleUnit: v.contact,
            targetLocation: v.targetLocation || v.currentLocation,
            status: resourceStatusLabels[v.status],
            startTime: v.assignedTime,
            progress: v.status === 'in_use' ? 60 : v.status === 'assigned' ? 30 : v.status === 'available' ? 0 : 100,
            isOverdue: v.status === 'assigned' && isOverdue(v.assignedTime, 30),
            linkPath: '/resources/vessels',
          });
        });

        const shores = state.getEventShoreSegments(eventId);
        shores.forEach((s) => {
          items.push({
            id: `task-shore-${s.id}`,
            category: 'shoreline',
            title: `岸线清理 - ${s.name}`,
            description: `岸线长度 ${s.length} km，污染程度：${s.pollutionLevel === 'heavy' ? '严重' : s.pollutionLevel === 'medium' ? '中等' : '轻微'}`,
            responsibleUnit: s.assignedTeam,
            targetLocation: s.name,
            status: s.status === 'pending' ? '待处理' : s.status === 'in_progress' ? '进行中' : '已完成',
            startTime: s.status !== 'pending' ? s.name : new Date().toLocaleString('zh-CN'),
            progress: s.progress,
            isOverdue: isOverdue(s.status !== 'pending' ? s.name : new Date().toLocaleString('zh-CN'), s.progress),
            linkPath: '/cleanup/shoreline',
          });
        });

        return items.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
      },

      updateCleanupProgress: (operationId, progress, collectedVolume) => set((state) => ({
        cleanupOperations: state.cleanupOperations.map((o) =>
          o.id === operationId
            ? { ...o, progress, collectedVolume: collectedVolume ?? o.collectedVolume }
            : o
        ),
      })),

      updateContainmentStatus: (operationId, status, deployedLength) => set((state) => ({
        containmentOperations: state.containmentOperations.map((o) =>
          o.id === operationId
            ? { ...o, status, deployedLength: deployedLength ?? o.deployedLength }
            : o
        ),
      })),

      addContainmentOperation: (op) => set((state) => ({
        containmentOperations: [
          { ...op, id: genId('BOM') },
          ...state.containmentOperations,
        ],
      })),

      addCleanupOperation: (op) => set((state) => ({
        cleanupOperations: [
          { ...op, id: genId('CLN') },
          ...state.cleanupOperations,
        ],
      })),

      updateCleanupStatus: (operationId, status) => set((state) => ({
        cleanupOperations: state.cleanupOperations.map((o) =>
          o.id === operationId ? { ...o, status } : o
        ),
      })),

      updateResourceStatus: (resourceId, status, task) => set((state) => ({
        resourceAssignments: state.resourceAssignments.map((r) =>
          r.id === resourceId
            ? { ...r, status, currentTask: task ?? (r.currentTask || '') }
            : r
        ),
      })),

      updateResourcePosition: (resourceId, location) => set((state) => ({
        resourceAssignments: state.resourceAssignments.map((r) =>
          r.id === resourceId ? { ...r, currentLocation: location } : r
        ),
      })),

      assignResource: (resourceId, eventId, task, operationType, targetLocation) =>
        set((state) => ({
          resourceAssignments: state.resourceAssignments.map((r) =>
            r.id === resourceId
              ? {
                  ...r,
                  eventId,
                  status: 'assigned' as ResourceStatus,
                  currentTask: task,
                  operationType,
                  targetLocation,
                  assignedTime: new Date().toLocaleString('zh-CN'),
                }
              : r
          ),
        })),

      startResourceWork: (resourceId) =>
        set((state) => ({
          resourceAssignments: state.resourceAssignments.map((r) =>
            r.id === resourceId ? { ...r, status: 'in_use' as ResourceStatus } : r
          ),
        })),

      pauseResourceWork: (resourceId) =>
        set((state) => ({
          resourceAssignments: state.resourceAssignments.map((r) =>
            r.id === resourceId ? { ...r, status: 'assigned' as ResourceStatus } : r
          ),
        })),

      completeResourceWork: (resourceId) =>
        set((state) => ({
          resourceAssignments: state.resourceAssignments.map((r) =>
            r.id === resourceId
              ? { ...r, status: 'available' as ResourceStatus, currentTask: '', operationType: undefined, targetLocation: undefined }
              : r
          ),
        })),

      generateSummaryReport: (eventId) => {
        const state = get();
        const event = state.getEventById(eventId);
        if (!event) {
          return {} as EventSummaryReport;
        }

        const existingReports = state.getEventSummaryReports(eventId);
        const nextVersion = existingReports.length > 0
          ? Math.max(...existingReports.map((r) => r.version)) + 1
          : 1;

        const containmentOps = state.getEventContainmentOperations(eventId);
        const cleanupOps = state.getEventCleanupOperations(eventId);
        const resources = state.getEventResourceAssignments(eventId);
        const eco = state.getEventEcologyAssessment(eventId);

        const totalCollected = cleanupOps.reduce((s, o) => s + o.collectedVolume, 0);
        const recoveryRate = event.estimatedVolume > 0
          ? Math.round((totalCollected / event.estimatedVolume) * 1000) / 10
          : 0;

        const byType = {
          skimmer: cleanupOps.filter((o) => o.operationType === 'skimmer').reduce((s, o) => s + o.collectedVolume, 0),
          dispersant: cleanupOps.filter((o) => o.operationType === 'dispersant').reduce((s, o) => s + o.collectedVolume, 0),
          shoreline: cleanupOps.filter((o) => o.operationType === 'shoreline').reduce((s, o) => s + o.collectedVolume, 0),
        };

        const dynamicProgress = state.computeDynamicProgress(eventId);
        const overallProgress = Math.round(
          dynamicProgress.reduce((s, p) => s + p.completionRate, 0) / dynamicProgress.length
        );

        const disposalProcess = [
          `事件于 ${event.occurrenceTime} 在 ${event.location} 发生，${event.reporter} 于 ${event.reportTime} 接报。`,
          `立即启动应急预案，组织开展油膜监测和扩散研判。`,
          `先后在 ${containmentOps.length} 处布设围油栏，总长度 ${containmentOps.reduce((s, o) => s + o.totalLength, 0)} 米。`,
          `出动 ${resources.filter((r) => r.resourceType === 'vessel').length} 艘清污船舶，开展机械收油和消油剂喷洒作业。`,
          `累计回收油污 ${totalCollected.toFixed(1)} 吨，总体回收率约 ${recoveryRate}%。`,
          eco ? `已完成生态损害评估，损害等级 ${eco.damageLevel}/10。` : '生态评估待开展。',
        ].join('\n');

        const lessons = [
          '本次溢油事件处置整体响应及时，围控措施得当，有效控制了油膜扩散范围。',
          '建议后续加强敏感区域的应急物资储备，进一步缩短响应时间。',
          '需持续开展生态监测，跟踪评估中长期生态影响。',
        ].join('\n\n');

        const report: EventSummaryReport = {
          id: genId('RPT'),
          eventId,
          version: nextVersion,
          status: 'draft',
          generatedAt: new Date().toLocaleString('zh-CN'),
          basicInfo: {
            eventName: event.eventName,
            location: event.location,
            oilType: oilTypeLabels[event.oilType],
            estimatedVolume: event.estimatedVolume,
            occurrenceTime: event.occurrenceTime,
            reporter: event.reporter,
          },
          disposalProcess,
          resourceInvestment: {
            vessels: resources.filter((r) => r.resourceType === 'vessel').length,
            equipment: resources.filter((r) => r.resourceType === 'equipment').length,
            personnel: resources.filter((r) => r.resourceType === 'personnel').reduce((s, r) => s + r.quantity, 0),
            materials: resources.filter((r) => r.resourceType === 'material').length,
            containmentLength: containmentOps.reduce((s, o) => s + o.totalLength, 0),
          },
          recoveryStats: {
            totalCollected: Math.round(totalCollected * 10) / 10,
            recoveryRate,
            byType,
          },
          ecologyImpact: {
            damageLevel: eco ? eco.damageLevel : 0,
            affectedArea: eco ? eco.affectedArea : 0,
            sensitiveResources: eco ? eco.sensitiveResources : [],
            affectedSpecies: eco ? eco.affectedSpecies : [],
            estimatedRecoveryTime: eco ? eco.estimatedRecoveryTime : '待评估',
          },
          lessons,
          overallProgress,
          duration: getTimeDiff(event.occurrenceTime),
        };

        set((state) => ({
          summaryReports: [report, ...state.summaryReports],
        }));

        return report;
      },

      getEventSummaryReports: (eventId) =>
        get().summaryReports.filter((r) => r.eventId === eventId).sort((a, b) => b.version - a.version),

      getLatestReport: (eventId) => {
        const reports = get().getEventSummaryReports(eventId);
        return reports.length > 0 ? reports[0] : undefined;
      },

      updateReportStatus: (reportId, status) =>
        set((state) => ({
          summaryReports: state.summaryReports.map((r) => {
            if (r.id !== reportId) return r;
            const now = new Date().toLocaleString('zh-CN');
            const updated = { ...r, status };
            if (status === 'submitted') updated.submittedAt = now;
            if (status === 'confirmed') updated.confirmedAt = now;
            if (status === 'archived') updated.archivedAt = now;
            return updated;
          }),
        })),

      updateShoreSegmentProgress: (segmentId, progress, collectedWaste) =>
        set((state) => ({
          shoreSegments: state.shoreSegments.map((s) =>
            s.id === segmentId
              ? { ...s, progress, collectedWaste: collectedWaste ?? s.collectedWaste }
              : s
          ),
        })),

      updateShoreSegmentStatus: (segmentId, status) =>
        set((state) => ({
          shoreSegments: state.shoreSegments.map((s) =>
            s.id === segmentId ? { ...s, status, progress: status === 'completed' ? 100 : s.progress } : s
          ),
        })),
    }),
    {
      name: 'oil-spill-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        events: state.events,
        containmentOperations: state.containmentOperations,
        cleanupOperations: state.cleanupOperations,
        resourceAssignments: state.resourceAssignments,
        summaryReports: state.summaryReports,
        shoreSegments: state.shoreSegments,
        ecologyAssessments: state.ecologyAssessments,
        currentEvent: state.currentEvent,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
