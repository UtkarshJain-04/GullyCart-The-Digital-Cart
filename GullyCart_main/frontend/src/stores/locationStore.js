import { create } from 'zustand'

export const useLocationStore = create((set) => ({
  vendorLocation: null,
  setVendorLocation: (location) => set({ vendorLocation: location }),
}))
