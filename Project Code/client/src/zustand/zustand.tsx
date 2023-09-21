import create from "zustand";
import { CELL } from "../Components/SeatingPlan/SeatingGrid";
import { immer } from "zustand/middleware/immer";

import { enableMapSet } from 'immer'

enableMapSet()

interface ISeatPlannerState {
  groupSeat: number;
  seatsBeforeEdit: number;
  resetGroupSeat: () => void;
  addGroupSeat: () => void;
  removeGroupSeat: () => void;
  setNumSeats: (seats: number) => void;
  setSeatsBeforeEdit: (seats: number) => void;
}

export const useSeatPlannerState = create<ISeatPlannerState>((set) => ({
  // Tooltips
  groupSeat: 0,
  seatsBeforeEdit: 0,

  addGroupSeat: () => {
    set((state) => ({ groupSeat: state.groupSeat + 1 }));
  },

  setNumSeats: (seats: number) => {
    set(() => ({ groupSeat: seats }));
  },

  setSeatsBeforeEdit: (seats: number) => {
    set(() => ({ seatsBeforeEdit: seats }));
  },

  removeGroupSeat: () => {
    set((state) => ({ groupSeat: state.groupSeat - 1 }));
  },

  resetGroupSeat: () => {
    set(() => ({ seatsBeforeEdit: 0, groupSeat: 0 }));
  },
}));


interface IGridInfo {
  grid: CELL[][],
  numSeats: number
}

interface ISeatPlannerGroupingCache {
  groups: Map<string, IGridInfo>;
  activeImage: string;
  setActiveImage: (img: string) => void;
  setGroup: (key: string, value: CELL[][]) => void;
  getGroup: (key: string) => IGridInfo;
  resetAll: () => void;
  removeGroup: (id: string) => void;
  getTotalSeated: () => number;
  editGroup:(oldKey:string, newKey:string, newValue: IGridInfo) => void;
}

/*
Caches all group information for the current event
*/
export const useSeatPlannerGroupingCache = create(
  immer<ISeatPlannerGroupingCache>((set, get) => ({
    groups: new Map(),
    activeImage: null,
    setActiveImage: (img: string) => {
      set(state => {state.activeImage = img})
    },
    // Adds/Updates a group with the specified key
    setGroup: (key: string, grid: CELL[][]) => {
      const clone: CELL[][] = [];
      let numSeats = 0;
      // Clone the grid and count number of seats in the grid
      for (let i = 0; i < grid.length; i++) {
        const row = []
        for (let j = 0; j < grid[i].length; j++) {
          row.push(grid[i][j])
          if (grid[i][j] === CELL.SEAT) {
            numSeats++;
          }
        }
        clone.push(row)
      }
      // Commits this to the groups map.
      set((state) => {
        state.groups.set(key, { grid: clone, numSeats });
      })
    },

    // Gets the details of a specific group based on the key
    getGroup: (key: string) => {
      return get().groups.get(key)
    },

    // Gets the details of a specific group based on the key
    getTotalSeated: () => {
      let total = 0;
      for (let val of get().groups.values()) {
        total += val.numSeats;
      }
      return total
    },

    removeGroup: (id: string) => {
      set((state) => {
        state.groups.delete(id);
      })
    },

    // Resets the map
    resetAll: () => {
      set((state) => {
        state.groups = new Map<string, IGridInfo>();
        state.activeImage = null;
      })
    },

    editGroup:(oldKey, newKey, newValue) => {
      set((state) => {
        state.groups.delete(oldKey);
        state.groups.set(newKey, newValue)
      })
    }

  }))
);

interface ISeatSelectCache {
  groupsSelectedSeats: Map<number, Set<string>>;
  setSelectedSeats: (id: number, seats:Set<string>) => void;
  resetAll: () => void;
}

// state management for buying tickets 
export const useSeatSelectCache = create(
  immer<ISeatSelectCache>((set, get) => ({
    groupsSelectedSeats: new Map(),
    setSelectedSeats: (id: number, seats:Set<string>) => {
      set((state) => {
        state.groupsSelectedSeats.set(id, new Set(seats));
        if (seats.size === 0) {
          state.groupsSelectedSeats.delete(id);
        }
      })
    },

    resetAll: () => {
      set((state) => {
        state.groupsSelectedSeats = new Map();
      })
    },
  }))
);
