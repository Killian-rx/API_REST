<template>
  <div>
    <h2 class="card-title">Annonces</h2>

    <!-- Barre de recherche et filtres -->
    <div class="card mb-2">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Rechercher une annonce..."
          @input="handleSearch"
        />
        <select
          v-model="selectedCategory"
          class="form-select"
          @change="handleSearch"
          style="max-width: 200px;"
        >
          <option value="">Toutes catégories</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="listingsError" class="alert alert-danger">
      {{ listingsError }}
    </div>

    <!-- Loading -->
    <div v-if="isLoadingListings" class="text-center">
      <div class="loading" style="width: 40px; height: 40px;"></div>
      <p class="text-muted mt-1">Chargement des annonces...</p>
    </div>

    <!-- Aucune annonce -->
    <div v-else-if="listings.length === 0" class="text-center">
      <p class="text-muted">Aucune annonce trouvée.</p>
    </div>

    <!-- Grille d'annonces -->
    <div v-else class="listings-grid">
      <div 
        v-for="listing in listings" 
        :key="listing.id" 
        class="listing-card"
      >
        <div class="listing-content">
          <h3 class="listing-title">{{ listing.title }}</h3>
          <div class="listing-price">{{ formatPrice(listing.price) }}</div>
          <div class="listing-location">📍 {{ listing.location }}</div>
          <p class="listing-description">{{ truncateText(listing.description, 100) }}</p>
          
          <div class="listing-meta">
            <span>{{ listing.category.name }}</span>
            <span>{{ formatDate(listing.createdAt) }}</span>
          </div>

          <div class="listing-meta">
            <span>Par {{ listing.user.name }}</span>
            <span v-if="listing.user.phone">📞 {{ listing.user.phone }}</span>
          </div>

          <!-- Actions pour les annonces de l'utilisateur connecté -->
          <div 
            v-if="currentUser && currentUser.id === listing.user.id" 
            class="listing-actions"
          >
            <button 
              @click="handleDelete(listing.id)"
              class="btn btn-danger btn-small"
              :disabled="isDeleting[listing.id]"
            >
              <span v-if="isDeleting[listing.id]" class="loading"></span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="loadPage(currentPage - 1)"
        :disabled="currentPage <= 1 || isLoadingListings"
        class="btn"
      >
        ← Précédent
      </button>
      
      <span class="pagination-info">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>
      
      <button
        @click="loadPage(currentPage + 1)"
        :disabled="currentPage >= totalPages || isLoadingListings"
        class="btn"
      >
        Suivant →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useListings } from '@/composables/useListings'
import { useCategories } from '@/composables/useCategories'
import { useAuth } from '@/composables/useAuth'

const { 
  listings, 
  loadListings, 
  deleteListing, 
  isLoadingListings, 
  listingsError,
  currentPage,
  totalPages
} = useListings()

const { categories, loadCategories } = useCategories()
const { currentUser } = useAuth()

const searchQuery = ref('')
const selectedCategory = ref('')
const isDeleting = reactive<Record<number, boolean>>({})

// Debounce pour la recherche
let searchTimeout: NodeJS.Timeout

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadListings({
      q: searchQuery.value || undefined,
      categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
      page: 1
    })
  }, 500)
}

const loadPage = (page: number) => {
  loadListings({
    q: searchQuery.value || undefined,
    categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
    page
  })
}

const handleDelete = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
    return
  }

  isDeleting[id] = true
  try {
    await deleteListing(id)
  } catch (error) {
    // L'erreur est gérée dans le composable
  } finally {
    isDeleting[id] = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(async () => {
  await loadCategories()
  await loadListings()
})
</script>

<style scoped>
.pagination-info {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>