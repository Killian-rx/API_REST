<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1 class="logo">LeBoncoin-like</h1>
          
          <!-- Informations utilisateur -->
          <div v-if="isAuthenticated" class="user-info">
            <span>Bonjour, {{ currentUser?.name }} !</span>
            <button @click="handleLogout" class="btn btn-secondary btn-small">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="container">
      <!-- Si non connecté : formulaire d'authentification -->
      <div v-if="!isAuthenticated" class="main-content" style="grid-template-columns: 1fr; max-width: 500px; margin: 0 auto;">
        <AuthForm />
      </div>

      <!-- Si connecté : interface principale -->
      <div v-else class="main-content">
        <!-- Sidebar : Formulaire de création -->
        <aside>
          <CreateListingForm />
        </aside>

        <!-- Contenu principal : Annonces / Favoris -->
        <section>
          <div class="view-switch" style="display:flex; gap:0.5rem; margin-bottom:1rem;">
            <button class="btn" :class="{ 'btn-primary': view === 'listings' }" @click="view = 'listings'">Annonces</button>
            <button class="btn" :class="{ 'btn-primary': view === 'favorites' }" @click="view = 'favorites'">Favoris</button>
          </div>

          <ListingsGrid v-if="view === 'listings'" />
          <FavoritesPage v-else />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import AuthForm from '@/components/AuthForm.vue'
import CreateListingForm from '@/components/CreateListingForm.vue'
import ListingsGrid from '@/components/ListingsGrid.vue'
import FavoritesPage from '@/components/FavoritesPage.vue'

const { currentUser, isAuthenticated, logout, checkAuth } = useAuth()

const handleLogout = () => {
  logout()
}

// Vérifier l'authentification au chargement
onMounted(() => {
  checkAuth()
})

const view = ref<'listings'|'favorites'>('listings')
</script>
