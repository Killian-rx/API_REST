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
              class="favorite-btn favorited"
              title="Retirer des favoris"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="heart-icon"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
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

.favorite-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.favorite-btn:hover {
  background-color: rgba(229, 36, 94, 0.1);
  transform: scale(1.1);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.heart-icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #e5245e;
  stroke: #e5245e;
  stroke-width: 1.5;
  fill: #e5245e;
}

.favorite-btn.favorited .heart-icon {
  animation: heartBeat 0.5s ease;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
