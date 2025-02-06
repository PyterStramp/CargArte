<!-- src/views/VehiclesView.vue -->
<template>
  <div class="vehicles-container">
    <h1>Gestión de Conductores</h1>

    <!-- Loading state -->
    <div v-if="driverStore.isLoading" class="loading">
      Cargando conductores...
    </div>

    <!-- Error state -->
    <div v-else-if="driverStore.error" class="error">
      {{ driverStore.error }}
    </div>

    <!-- Tabla de vehículos -->
    <div class="vehicles-table">
      <table v-if="driverStore.drivers.length">
        <thead>
          <tr class="header-row">
            <th>Identificación</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Telefono</th>
            <th># de Licencia</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="driver in driverStore.drivers" :key="driver.identification"  class="table-row">
            <td>{{ driver.identification }}</td>
            <td>{{ driver.first_name }}</td>
            <td>{{ driver.last_name }}</td>
            <td>{{ driver.phone }}</td>
            <td>{{ driver.email }}</td>
            <td>{{ driver.license_number }}</td>
            <td class="actions-cell">
              <button @click="handleEdit(driver)" class="btn-edit">Editar</button>
              <button @click="handleDelete(driver.identification)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>No hay conductores registrados</div>
    </div>

    <!-- Botón para agregar nuevo vehículo -->
    <button @click="showAddForm = true" class="btn add">Agregar Conductores</button>
    <AddDriverForm :is-open="showAddForm" @close="showAddForm = false" />
    <!-- Modal de Editar -->
    <EditDriverForm :is-open="showEditForm" :driver="selectedDriver" @close="closeEditForm" />
    <!-- Modal de confirmación para eliminar -->
    <ConfirmDialog :is-open="showDeleteConfirm" title="Eliminar Conductor"
      :message="`¿Está seguro que desea eliminar el conductor con identificacion ${driverToDelete}?`" @confirm="confirmDelete"
      @cancel="cancelDelete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import AddDriverForm from '@/components/AddDriverForm.vue'
import EditDriverForm from '@/components/EditDriverForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const driverStore = useDriverStore()
const showAddForm = ref(false)
const showEditForm = ref(false)
const selectedDriver = ref(null)
const showDeleteConfirm = ref(false)
const driverToDelete = ref('')

onMounted(async () => {
  await driverStore.fetchDrivers()
})

const handleEdit = (driver) => {
  selectedDriver.value = driver
  showEditForm.value = true
}

const closeEditForm = () => {
  showEditForm.value = false
  selectedDriver.value = null
}

const handleDelete = (identificacion) => {
  driverToDelete.value = identificacion
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await driverStore.deleteDriver(driverToDelete.value)
    showDeleteConfirm.value = false
    driverToDelete.value = ''
  } catch (error) {
    console.error('Error al eliminar:', error)
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  driverToDelete.value = ''
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
