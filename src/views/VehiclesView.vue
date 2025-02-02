<!-- src/views/VehiclesView.vue -->
<template>
  <div class="vehicles-container">
    <h1>Gestión de Vehículos</h1>

    <!-- Loading state -->
    <div v-if="vehicleStore.isLoading" class="loading">
      Cargando vehículos...
    </div>

    <!-- Error state -->
    <div v-else-if="vehicleStore.error" class="error">
      {{ vehicleStore.error }}
    </div>

    <!-- Tabla de vehículos -->
    <div class="vehicles-table">
      <table v-if="vehicleStore.vehicles.length">
        <thead>
          <tr class="header-row">
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
            <th>Capacidad (paquetes)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in vehicleStore.vehicles" :key="vehicle.plate" class="table-row">
            <td>{{ vehicle.plate }}</td>
            <td>{{ vehicle.brand_name }}</td>
            <td>{{ vehicle.model_name }}</td>
            <td class="color-cell">
              <span class="color-indicator" :style="getColorStyle(vehicle.color)"></span>
              {{ vehicle.color }}
            </td>
            <td>{{ vehicle.cargo_capacity }}</td>
            <td class="actions-cell">
              <button class="btn-edit">Editar</button>
              <button class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>No hay vehículos registrados</div>
    </div>

    <!-- Botón para agregar nuevo vehículo -->
    <button @click="showAddForm = true" class="btn add">Agregar Vehículo</button>
    <AddVehicleForm :is-open="showAddForm" @close="showAddForm = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'
import AddVehicleForm from '@/components/AddVehicleForm.vue'

const vehicleStore = useVehicleStore()
const showAddForm = ref(false)

onMounted(async () => {
  await vehicleStore.fetchVehicles()
})

const getColorStyle = (color) => {
  const colorMap = {
    'White': '#FFFFFF',
    'Black': '#333333',
    'Silver': '#C0C0C0',
    'Gray': '#808080',
    'Blue': '#4169E1',
    'Red': '#DC3545'
  }
  return {
    backgroundColor: colorMap[color] || color,
    border: color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none'
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 12px;
  text-align: left;
}

td {
  padding: 16px;
  color: #212529;
}

th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.vehicles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.vehicles-table {
  margin: 20px 0;
  overflow-x: auto;
}

.header-row {
  background-color: #f8f9fa;
}

.table-row {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-edit {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #218838;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background-color: #c82333;
}

.btn.add {
  background-color: #228ce4;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn.add:hover {
  background-color: #0e82e1;
}

@media (max-width: 768px) {
  .vehicles-table {
    overflow-x: auto;
  }
}
</style>
