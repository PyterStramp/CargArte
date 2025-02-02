<template>
  <div class="modal-overlay" v-if="props.isOpen">
    <div class="modal-content">
      <h2>Editar Vehículo</h2>
      <form @submit.prevent="handleSubmit" class="form">
        <!-- Placa (solo lectura) -->
        <div class="form-group">
          <label for="plate">Placa</label>
          <input id="plate" :value="props.vehicle.plate" type="text" readonly class="readonly">
        </div>

        <div class="form-group">
          <label for="brand">Marca</label>
          <select id="brand" v-model="formData.brandId" required @change="loadModels">
            <option value="">Seleccione una marca</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="model">Modelo</label>
          <select id="model" v-model="formData.modelId" required :disabled="!formData.brandId">
            <option value="">Seleccione un modelo</option>
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="color">Color</label>
          <select id="color" v-model="formData.color" required>
            <option value="">Seleccione un color</option>
            <option value="White">Blanco</option>
            <option value="Black">Negro</option>
            <option value="Silver">Plateado</option>
            <option value="Gray">Gris</option>
            <option value="Blue">Azul</option>
            <option value="Red">Rojo</option>
          </select>
        </div>

        <div class="form-group">
          <label for="capacity">Capacidad (paquetes)</label>
          <input id="capacity" v-model.number="formData.cargoCapacity" type="number" required min="1" max="1000">
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-submit">Guardar cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'

const props = defineProps({
  isOpen: Boolean,
  vehicle: Object
})

const emit = defineEmits(['close'])
const vehicleStore = useVehicleStore()
const brands = ref([])
const models = ref([])

const formData = reactive({
  plate: '',
  brandId: '',
  modelId: '',
  color: '',
  cargoCapacity: null
})

// Cargar datos del vehículo cuando se abre el modal
watch(() => props.vehicle, (newVehicle) => {
  if (newVehicle) {
    formData.plate = newVehicle.plate
    formData.color = newVehicle.color
    formData.cargoCapacity = newVehicle.cargo_capacity
    // Hay que obtener brandId y modelId basado en brand_name y model_name
    loadBrandAndModel(newVehicle.brand_name, newVehicle.model_name)
  }
}, { immediate: true })

const loadBrandAndModel = async (brandName, modelName) => {
  await vehicleStore.fetchBrands()
  const brand = brands.value.find(b => b.name === brandName)
  if (brand) {
    formData.brandId = brand.id
    await vehicleStore.fetchModelsByBrand(formData.brandId)
    const model = models.value.find(m => m.name === modelName)
    if (model) {
      formData.modelId = model.id
    }
  }
}

const loadBrands = async () => {
  // desde backend
  brands.value = await vehicleStore.fetchBrands()
}

const loadModels = async () => {
  if (formData.brandId) {
    models.value = await vehicleStore.fetchModelsByBrand(formData.brandId)
  } else {
    models.value = []
  }
  formData.modelId = ''
}

const closeModal = () => {
  emit('close')
}

onMounted(() => {
  loadBrands()
})

const handleSubmit = async () => {
  try {
    await vehicleStore.updateVehicle({
      plate: formData.plate,
      modelId: formData.modelId,
      color: formData.color,
      cargoCapacity: formData.cargoCapacity
    })
    emit('close')
  } catch (error) {
    console.error('Error al actualizar vehículo:', error)
  }
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

.readonly {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
