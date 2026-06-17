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
} from '../types';
import {
  mockEvents,
  mockOilSpreadData,
  mockOceanConditions,
  mockContainmentOperations,
  mockCleanupOperations,
  mockResourceAssignments,
  mockEcologyAssessment,
  mockDisposalProgress,
} from '../data/mockData';

interface AppState {
  events: OilSpillEvent[];
  currentEvent: OilSpillEvent | null;
  oilSpreadData: OilSpreadData[];
  oceanConditions: OceanCondition[];
  containmentOperations: ContainmentOperation[];
  cleanupOperations: CleanupOperation[];
  resourceAssignments: ResourceAssignment[];
  ecologyAssessment: EcologyAssessment | null;
  disposalProgress: DisposalProgress[];
  sidebarCollapsed: boolean;

  setCurrentEvent: (event: OilSpillEvent | null) => void;
  addEvent: (event: Omit<OilSpillEvent, 'id'>) => OilSpillEvent;
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  toggleSidebar: () => void;
  getEventById: (id: string) => OilSpillEvent | undefined;
  getEventOilSpreadData: (eventId: string) => OilSpreadData[];
  getEventOceanConditions: (eventId: string) => OceanCondition[];
  getEventContainmentOperations: (eventId: string) => ContainmentOperation[];
  getEventCleanupOperations: (eventId: string, type?: CleanupOperation['operationType']) => CleanupOperation[];
  getEventResourceAssignments: (eventId: string) => ResourceAssignment[];
  getEventDisposalProgress: (eventId: string) => DisposalProgress[];
  updateCleanupProgress: (operationId: string, progress: number, collectedVolume?: number) => void;
  updateContainmentStatus: (operationId: string, status: OperationStatus, deployedLength?: number) => void;
  addContainmentOperation: (op: Omit<ContainmentOperation, 'id'>) => void;
  addCleanupOperation: (op: Omit<CleanupOperation, 'id'>) => void;
  updateCleanupStatus: (operationId: string, status: OperationStatus) => void;
  updateResourceStatus: (resourceId: string, status: ResourceAssignment['status'], task?: string) => void;
  updateResourcePosition: (resourceId: string, location: string) => void;
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

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
      ecologyAssessment: mockEcologyAssessment,
      disposalProgress: mockDisposalProgress,
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

      getEventDisposalProgress: (eventId) =>
        get().disposalProgress.filter((p) => p.eventId === eventId),

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
    }),
    {
      name: 'oil-spill-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        events: state.events,
        containmentOperations: state.containmentOperations,
        cleanupOperations: state.cleanupOperations,
        resourceAssignments: state.resourceAssignments,
        currentEvent: state.currentEvent,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
