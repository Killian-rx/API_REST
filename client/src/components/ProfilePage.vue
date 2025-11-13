<template>
  <div class="profile-page">
    <h2>Mon profil</h2>

    <div class="card">
      <h3>Informations</h3>
      <p><strong>Nom :</strong> {{ user?.name }}</p>
      <p><strong>Email :</strong> {{ user?.email }}</p>
      <p v-if="user?.phone"><strong>Téléphone :</strong> {{ user?.phone }}</p>
    </div>

    <div class="card mt-2">
      <h3>Mes annonces</h3>

      <div v-if="isLoading" class="text-muted">Chargement...</div>
      <div v-else>
        <div v-if="listings.length === 0">
          Vous n'avez publié aucune annonce.
        </div>

        <div v-for="listing in listings" :key="listing.id" class="listing-item">
          <div class="listing-main">
            <img
              v-if="listing.imageUrl"
              :src="listing.imageUrl"
              alt="image"
              class="thumb"
            />
            <div style="flex: 1">
              <!-- Title -->
              <div class="field-row">
                <strong>Titre :</strong>
                <template v-if="isEditingField(listing.id, 'title')">
                  <input v-model="fieldValue" />
                  <button
                    class="btn btn-primary btn-small"
                    @click="submitField(listing.id, 'title')"
                  >
                    Ok
                  </button>
                  <button
                    class="btn btn-secondary btn-small"
                    @click="cancelField"
                  >
                    Annuler
                  </button>
                </template>
                <template v-else>
                  <span class="field-val">{{ listing.title }}</span>
                  <button
                    class="btn btn-link btn-small"
                    @click="startField(listing, 'title')"
                  >
                    Modifier
                  </button>
                </template>
              </div>

              <!-- Price -->
              <div class="field-row">
                <strong>Prix :</strong>
                <template v-if="isEditingField(listing.id, 'price')">
                  <input v-model.number="fieldValue" type="number" />
                  <button
                    class="btn btn-primary btn-small"
                    @click="submitField(listing.id, 'price')"
                  >
                    Ok
                  </button>
                  <button
                    class="btn btn-secondary btn-small"
                    @click="cancelField"
                  >
                    Annuler
                  </button>
                </template>
                <template v-else>
                  <span class="field-val">{{ listing.price }} €</span>
                  <button
                    class="btn btn-link btn-small"
                    @click="startField(listing, 'price')"
                  >
                    Modifier
                  </button>
                </template>
              </div>

              <!-- Location -->
              <div class="field-row">
                <strong>Localisation :</strong>
                <template v-if="isEditingField(listing.id, 'location')">
                  <input v-model="fieldValue" />
                  <button
                    class="btn btn-primary btn-small"
                    @click="submitField(listing.id, 'location')"
                  >
                    Ok
                  </button>
                  <button
                    class="btn btn-secondary btn-small"
                    @click="cancelField"
                  >
                    Annuler
                  </button>
                </template>
                <template v-else>
                  <span class="field-val">{{ listing.location }}</span>
                  <button
                    class="btn btn-link btn-small"
                    @click="startField(listing, 'location')"
                  >
                    Modifier
                  </button>
                </template>
              </div>

              <!-- Description -->
              <div class="field-row">
                <strong>Description :</strong>
                <template v-if="isEditingField(listing.id, 'description')">
                  <textarea v-model="fieldValue" rows="3"></textarea>
                  <button
                    class="btn btn-primary btn-small"
                    @click="submitField(listing.id, 'description')"
                  >
                    Ok
                  </button>
                  <button
                    class="btn btn-secondary btn-small"
                    @click="cancelField"
                  >
                    Annuler
                  </button>
                </template>
                <template v-else>
                  <span class="field-val">{{ listing.description }}</span>
                  <button
                    class="btn btn-link btn-small"
                    @click="startField(listing, 'description')"
                  >
                    Modifier
                  </button>
                </template>
              </div>
            </div>
          </div>

          <div class="listing-actions">
            <button
              class="btn btn-danger btn-small"
              @click="remove(listing.id)"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { apiService } from "@/services/api";
import { useListings } from "@/composables/useListings";

const { currentUser } = useAuth();
const user = ref<any>(null);
const listings = ref<any[]>([]);
const isLoading = ref(false);

const { updateListing, deleteListing } = useListings();

const editingId = ref<number | null>(null);
const editingField = ref<string | null>(null);
const fieldValue = ref<any>(null);

const loadProfile = async () => {
  isLoading.value = true;
  try {
    const res = await apiService.getMe();
    user.value = res.user;
    listings.value = res.user.listings ?? [];
  } finally {
    isLoading.value = false;
  }
};

const startField = (listing: any, field: string) => {
  editingId.value = listing.id;
  editingField.value = field;
  fieldValue.value = (listing as any)[field];
};

const cancelField = () => {
  editingId.value = null;
  editingField.value = null;
  fieldValue.value = null;
};

const isEditingField = (id: number, field: string) => {
  return editingId.value === id && editingField.value === field;
};

const submitField = async (id: number, field: string) => {
  try {
    const payload: any = {};
    payload[field] =
      field === "price" ? Number(fieldValue.value) : fieldValue.value;
    // use apiService directly because useListings doesn't expose updateListing
    await apiService.updateListing(id, payload);
    // recharger le profil et réinitialiser l'édition
    await loadProfile();
    cancelField();
  } catch (err) {
    console.error(err);
  }
};

const remove = async (id: number) => {
  if (!confirm("Supprimer cette annonce ?")) return;
  try {
    await deleteListing(id);
    listings.value = listings.value.filter((l) => l.id !== id);
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  // valeur initiale pour nom/email
  user.value = (currentUser as any).value;
  loadProfile();
});
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}
.card {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
}
.listing-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.listing-main {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}
.listing-actions {
  display: flex;
  gap: 0.5rem;
}
.edit-form {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
</style>
