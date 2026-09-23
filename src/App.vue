<script setup lang="ts">
</script>

<template>
  <div id="app-root">
    <nav class="app-nav">
      <h1>Car Perfect</h1>
      <RouterLink to="/" data-testid="nav-home">Home</RouterLink>
      <RouterLink to="/browse" data-testid="nav-browse">Browse</RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}
</style>
