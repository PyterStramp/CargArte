import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'


export const useDriverStore = defineStore('driver', {
    state: () => ({
        drivers: [],
        isLoading: false,
        error: null,
    }),
    actions: {
        async fetchDrivers() {
            this.isLoading = true
            try {
                const response = await axios.get(`${API_BASE_URL}/api/drivers`)
                this.drivers = response.data.data
                this.error = null
            } catch (error) {
                this.error = error.message
                this.drivers = []
            } finally {
                this.isLoading = false
            }
        },
        async addDriver(driverData) {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/drivers`, driverData)
                if (response.data.success) {
                    // Actualizar la lista de vehículos
                    await this.fetchDrivers()
                }
                return response.data
            } catch (error) {
                throw error
            }
        },
        async updateDriver(driverData) {
            try {
                const response = await axios.put(`${API_BASE_URL}/api/drivers/${driverData.identification}`, {
                    first_name: driverData.first_name,
                    last_name: driverData.last_name,
                    license_number: driverData.cargoCapacity,
                    phone: driverData.phone,
                    email: driverData.email,
                })
                if (response.data.success) {
                    await this.fetchDrivers()
                }
                return response.data
            } catch (error) {
                throw error
            }
        },
        async deleteDriver(identification) {
            try {
                const response = await axios.delete(`${API_BASE_URL}/api/drivers/${identification}`);

                if (response.data.success) {
                    this.drivers = this.drivers.filter((v) => v.identification !== identification);
                } else {
                    console.error("Error del servidor:", response.data.message);
                }

                return response.data;
            } catch (error) {
                console.error("Error al eliminar el conductor:", error.response?.data || error.message);
                throw error;
            }
        },

    },
})