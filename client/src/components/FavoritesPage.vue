<template>
  <div>
    <h2 class="card-title">Mes favoris</h2>

    <div v-if="isLoading" class="text-center">
      <div class="loading" style="width: 40px; height: 40px"></div>
      <p class="text-muted mt-1">Chargement des favoris...</p>
    </div>

    <div v-else-if="listings.length === 0" class="text-center">
      <p class="text-muted">Vous n'avez pas encore de favoris.</p>
    </div>

    <div v-else class="listings-grid">
      <div v-for="listing in listings" :key="listing.id" class="listing-card">
        <div class="listing-content">
          <h3 class="listing-title">{{ listing.title }}</h3>
          <div class="listing-price">{{ formatPrice(listing.price) }}</div>
          <div class="listing-location">📍 {{ listing.location }}</div>
          <p class="listing-description">
            {{ truncateText(listing.description, 100) }}
          </p>

          <div class="listing-meta">
            <span>{{ listing.category.name }}</span>
            <span>{{ formatDate(listing.createdAt) }}</span>
          </div>

          <div class="listing-meta">
            <span>Par {{ listing.user.name }}</span>
            <span v-if="listing.user.phone">📞 {{ listing.user.phone }}</span>
          </div>

          <!-- Bouton favoris (retirer) -->
          <div class="listing-actions">
            <button
              @click="toggleFavorite(listing.id)"
              class="btn btn-link btn-small"
            >
              <span style="color: #e0245e; font-size: 1.25rem">♥</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useListings } from "@/composables/useListings";
import { useAuth } from "@/composables/useAuth";

const { loadFavorites, removeFavorite } = useListings();
const { currentUser } = useAuth();

const listings = ref<any[]>([]);
const isLoading = ref(false);

const load = async () => {
  isLoading.value = true;
  try {
    const data = await loadFavorites();
    listings.value = data;
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!currentUser.value) return;
  await load();
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    price
  );
const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
const truncateText = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.substring(0, maxLength) + "...";

const toggleFavorite = async (id: number) => {
  try {
    await removeFavorite(id);
    // rafraîchir la liste
    const data = await loadFavorites();
    listings.value = data;
  } catch (err) {
    // ignore — error handled in composable
  }
};
</script>

<style scoped>
.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.listing-card {
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 6px;
}
</style>
