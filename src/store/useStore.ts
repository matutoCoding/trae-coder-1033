import { create } from 'zustand';
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
  addEvent: (event: Omit<OilSpillEvent, 'id'>) => void;
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  toggleSidebar: () => void;
  getEventById: (id: string) => OilSpillEvent | undefined;
  getEventOilSpreadData: (eventId: string) => OilSpreadData[];
  getEventOceanConditions: (eventId: string) => OceanCondition[];
  getEventContainmentOperations: (eventId: string) => ContainmentOperation[];
  getEventCleanupOperations: (eventId: string) => CleanupOperation[];
  getEventResourceAssignments: (eventId: string) => ResourceAssignment[];
  getEventDisposalProgress: (eventId: string) => DisposalProgress[];
  updateCleanupProgress: (operationId: string, progress: number, collectedVolume: number) => void;
  updateContainmentStatus: (operationId: string, status: string, deployedLength: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
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

  addEvent: (eventData) => set((state) => {
    const newEvent: OilSpillEvent = {
      ...eventData,
      id: `EVT-${new Date().getFullYear()}-${String(state.events.length + 1).padStart(3, '0')}`,
    };
    return { events: [newEvent, ...state.events] };
  }),

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

  getEventCleanupOperations: (eventId) =>
    get().cleanupOperations.filter((o) => o.eventId === eventId),

  getEventResourceAssignments: (eventId) =>
    get().resourceAssignments.filter((r) => r.eventId === eventId),

  getEventDisposalProgress: (eventId) =>
    get().disposalProgress.filter((p) => p.eventId === eventId),

  updateCleanupProgress: (operationId, progress, collectedVolume) => set((state) => ({
    cleanupOperations: state.cleanupOperations.map((o) =>
      o.id === operationId ? { ...o, progress, collectedVolume } : o
    ),
  })),

  updateContainmentStatus: (operationId, status, deployedLength) => set((state) => ({
    containmentOperations: state.containmentOperations.map((o) =>
      o.id === operationId ? { ...o, status: status as any, deployedLength } : o
    ),
  })),
}));
