<template>
  <div id="app">
    <nav>
      <router-link to="/">Inicio</router-link> |
      <router-link to="/rutas">Gestión de Rutas</router-link> |
      <router-link to="/rutas-list">Lista de Rutas</router-link> |
      <router-link to="/vehicles">Vehículos</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
#app {
  padding: 20px;
}

nav {
  padding: 20px 0;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #2c3e50;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}
</style>
