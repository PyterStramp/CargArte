// stores/routeStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { createRoute } from '@/services/routeService';

export const useRouteStore = defineStore('route', {
  state: () => ({
    availableDrivers: [],
    availableVehicles: [],
    selectedDate: null,
    isLoading: false,
    error: null
  }),

  getters: {
    hasAvailableDrivers: (state) => Array.isArray(state.availableDrivers) && state.availableDrivers.length > 0,
    hasAvailableVehicles: (state) => Array.isArray(state.availableVehicles) && state.availableVehicles.length > 0
  },

  actions: {
    async fetchAvailableDrivers(date) {
      this.isLoading = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/drivers/available`, {
          params: { date }
        });
        this.availableDrivers = response.data.data || [];
        this.error = null;
      } catch (error) {
        console.error('Error fetching drivers:', error);
        this.error = 'Error al cargar conductores disponibles';
        this.availableDrivers = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAvailableVehicles(date) {
      this.isLoading = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/vehicles/available`, {
          params: { date }
        });
        this.availableVehicles = response.data.data || [];
        this.error = null;
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        this.error = 'Error al cargar vehículos disponibles';
        this.availableVehicles = [];
      } finally {
        this.isLoading = false;
      }
    },

    async validateAvailability({ date, driverId, vehicleId }) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/routes/validate-availability`, {
          date,
          driver_id: driverId,
          vehicle_id: vehicleId
        });
        return response.data.data;
      } catch (error) {
        this.error = 'Error al validar disponibilidad';
        throw error;
      }
    },

    async saveRoute(routeData, deliveryPoints) {
      try {
        const formattedRouteData = {
          ...routeData,
          deliveryPoints: deliveryPoints.map(point => ({
            position: point.position,
            address: point.address || 'Dirección no especificada',
            packages: point.packages
          }))
        };

        const result = await createRoute(formattedRouteData);

        if (result.success) {
          return { success: true, routeId: result.routeId };
        }
      } catch (error) {
        console.error('Error en saveRoute:', error);
        throw new Error('Error al guardar la ruta: ' + error.message);
      }
    },

    clearError() {
      this.error = null;
    }
  }
});
