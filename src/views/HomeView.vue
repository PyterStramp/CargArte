<template>
  <div class="home">
    <h1>Sistema de Gestión de Rutas</h1>
    <p>Bienvenido al sistema de gestión de rutas de entrega.</p>
    <router-link to="/rutas" class="btn-start">
      Comenzar a planificar rutas
    </router-link>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

.btn-start {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.btn-start:hover {
  background-color: #3aa876;
}
</style>
