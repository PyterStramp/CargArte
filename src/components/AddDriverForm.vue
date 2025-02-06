<!-- src/components/AddVehicleForm.vue -->
<template>
  <div class="modal-overlay" v-if="props.isOpen">
    <div class="modal-content">
      <h2>Agregar Nuevo Conductor</h2>
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="identification">Identificación</label>
          <input id="identification" v-model="formData.identification" type="text" required placeholder="Ej: 102242">
        </div>

        <div class="form-group">
          <label for="first_name">Nombre</label>
          <input id="first_name" v-model="formData.first_name" type="text" required placeholder="Ej: Rosa">
        </div>

        <div class="form-group">
          <label for="last_name">Apellido</label>
          <input id="last_name" v-model="formData.last_name" type="text" required placeholder="Ej: Melano">
        </div>

        <div class="form-group">
          <label for="license_number">Numero de Licencia</label>
          <input id="license_number" v-model.number="formData.license_number" type="number" required min="1" >
        </div>

        <div class="form-group">
          <label for="phone">Numero de Telefono</label>
          <input id="phone" v-model.number="formData.phone" type="number" required min="1" >
        </div>
        <div class="form-group">
          <label for="email">Correo</label>
          <input id="email" v-model="formData.email" type="email" required >
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-submit">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useDriverStore } from '@/stores/driverStore'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const driverStore = useDriverStore()

const formData = reactive({
  identification: '',
  first_name: '',
  last_name: '',
  license_number: '',
  phone: '',
  email: '',
})

const handleSubmit = async () => {
  try {
    await driverStore.addDriver(formData)
    emit('close')
    // Resetear formulario
    Object.keys(formData).forEach(key => formData[key] = '')
  } catch (error) {
    console.error('Error al guardar conductor:', error)
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #374151;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.btn-submit {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: #218838;
}
</style>
