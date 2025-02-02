/* eslint-disable no-useless-catch */
// src/stores/vehicleStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    vehicles: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchVehicles() {
      this.isLoading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/api/vehicles`)
        this.vehicles = response.data.data
        this.error = null
      } catch (error) {
        this.error = error.message
        this.vehicles = []
      } finally {
        this.isLoading = false
      }
    },
    async fetchBrands() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/brands`)
        return response.data.data
      } catch (error) {
        throw error
      }
    },

    async fetchModelsByBrand(brandId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/brands/${brandId}/models`)
        return response.data.data
      } catch (error) {
        throw error
      }
    },

    async addVehicle(vehicleData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/vehicles`, vehicleData)
        if (response.data.success) {
          // Actualizar la lista de vehículos
          await this.fetchVehicles()
        }
        return response.data
      } catch (error) {
        throw error
      }
    },
  },
})
