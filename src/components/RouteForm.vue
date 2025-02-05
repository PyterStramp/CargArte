// components/RouteForm.vue
<template>
  <div class="route-form">
    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Nombre de la Ruta -->
      <div class="form-group">
        <label class="form-label" for="routeName">
          Nombre de la Ruta
          <span class="required">*</span>
        </label>
        <input
          id="routeName"
          v-model="formData.name"
          type="text"
          required
          class="form-input"
          placeholder="Ej: Ruta Norte Bogotá"
        />
      </div>

      <!-- Fecha -->
      <div class="form-group">
        <label class="form-label" for="routeDate">
          Fecha
          <span class="required">*</span>
        </label>
        <input
          id="routeDate"
          v-model="formData.date"
          type="date"
          required
          :min="minDate"
          @change="handleDateChange"
          class="form-input"
        />
      </div>

      <!-- Conductor -->
      <div class="form-group">
        <label class="form-label" for="driver">
          Conductor
          <span class="required">*</span>
        </label>
        <div class="select-wrapper">
          <select
            id="driver"
            v-model="formData.driverId"
            required
            :disabled="!routeStore.hasAvailableDrivers"
            class="form-select"
          >
            <option value="" disabled>Seleccione un conductor</option>
            <option
              v-for="driver in routeStore.availableDrivers"
              :key="driver.id"
              :value="driver.id"
            >
              {{ driver.first_name }} {{ driver.last_name }} - {{ driver.license_number }}
            </option>
          </select>
        </div>
        <p v-if="!routeStore.hasAvailableDrivers && formData.date" class="form-error">
          No hay conductores disponibles para esta fecha
        </p>
      </div>

      <!-- Vehículo -->
      <div class="form-group">
        <label class="form-label" for="vehicle">
          Vehículo
          <span class="required">*</span>
        </label>
        <div class="select-wrapper">
          <select
            id="vehicle"
            v-model="formData.vehicleId"
            required
            :disabled="!routeStore.hasAvailableVehicles"
            class="form-select"
          >
            <option value="" disabled>Seleccione un vehículo</option>
            <option
              v-for="vehicle in routeStore.availableVehicles"
              :key="vehicle.id"
              :value="vehicle.id"
            >
              {{ vehicle.plate }} - {{ vehicle.brand_name }} {{ vehicle.model_name }} ({{ vehicle.color }})
            </option>
          </select>
        </div>
        <p v-if="!routeStore.hasAvailableVehicles && formData.date" class="form-error">
          No hay vehículos disponibles para esta fecha
        </p>
      </div>

      <!-- Error general -->
      <div v-if="routeStore.error" class="alert-error">
        {{ routeStore.error }}
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="routeStore.isLoading || !isFormValid"
          class="btn btn-primary"
        >
          {{ routeStore.isLoading ? 'Guardando...' : 'Crear Ruta' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouteStore } from '@/stores/routeStore';

export default {
  name: 'RouteForm',
  emits: ['submit', 'cancel'],

  setup(props, { emit }) {
    const routeStore = useRouteStore();
    const formData = ref({
      name: '',
      date: '',
      driverId: '',
      vehicleId: ''
    });

    const minDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });

    const isFormValid = computed(() => {
      return formData.value.name &&
        formData.value.date &&
        formData.value.driverId &&
        formData.value.vehicleId;
    });

    const handleDateChange = async () => {
      if (formData.value.date) {
        // Limpiar selecciones previas
        formData.value.driverId = '';
        formData.value.vehicleId = '';

        // Formatear la fecha a YYYY-MM-DD antes de enviarla
        const formattedDate = formatDate(formData.value.date);

        // Cargar datos disponibles para la nueva fecha
        await Promise.all([
          routeStore.fetchAvailableDrivers(formattedDate),
          routeStore.fetchAvailableVehicles(formattedDate)
        ]);
      }
    };

    // Función auxiliar para formatear la fecha
    const formatDate = (date) => {
      if (!date) return null;
      // Si es un string, convertirlo a objeto Date
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString().split('T')[0]; // Retorna YYYY-MM-DD
    };

    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      // Validar disponibilidad antes de emitir
      const availability = await routeStore.validateAvailability({
        date: formData.value.date,
        driverId: formData.value.driverId,
        vehicleId: formData.value.vehicleId
      });

      if (availability.isDriverAvailable && availability.isVehicleAvailable) {
        // Emitir el evento con los datos del formulario
        emit('submit', { ...formData.value });
      }
    };

    return {
      routeStore,
      formData,
      minDate,
      isFormValid,
      handleDateChange,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.route-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required {
  color: #dc2626;
  font-size: 1rem;
}

.form-input,
.form-select {
  width: 90%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: #fff;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2872a7;
  box-shadow: 0 0 0 3px rgba(40, 114, 167, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '';
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6b7280;
  pointer-events: none;
}

.form-error {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.alert-error {
  padding: 0.75rem 1rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #2872a7;
  color: white;
  border: 1px solid transparent;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e5c8f;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
