<template>
  <div class="card">
    <h2 class="card-title">Créer une annonce</h2>

    <!-- Erreur -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Succès -->
    <div v-if="success" class="alert alert-success">
      {{ success }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label" for="title">Titre *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-input"
          required
          maxlength="100"
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="description">Description *</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-textarea"
          required
          maxlength="2000"
          :disabled="isSubmitting"
          placeholder="Décrivez votre article..."
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="price">Prix (€) *</label>
        <input
          id="price"
          v-model="form.price"
          type="number"
          step="0.01"
          min="0"
          class="form-input"
          required
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="location">Localisation *</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          class="form-input"
          required
          maxlength="100"
          :disabled="isSubmitting"
          placeholder="Ville, département..."
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="category">Catégorie *</label>
        <select
          id="category"
          v-model="form.categoryId"
          class="form-select"
          required
          :disabled="isSubmitting || isLoadingCategories"
        >
          <option value="">Sélectionner une catégorie</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <button 
        type="submit" 
        class="btn btn-primary" 
        :disabled="isSubmitting || isLoadingCategories"
        style="width: 100%;"
      >
        <span v-if="isSubmitting" class="loading"></span>
        <span v-else>Créer l'annonce</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useListings } from '@/composables/useListings'
import { useCategories } from '@/composables/useCategories'

const { createListing, listingsError } = useListings()
const { categories, loadCategories, isLoadingCategories } = useCategories()

const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const form = reactive({
  title: '',
  description: '',
  price: 0,
  location: '',
  categoryId: ''
})

const handleSubmit = async () => {
  error.value = null
  success.value = null
  isSubmitting.value = true

  try {
    await createListing({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      location: form.location,
      categoryId: Number(form.categoryId)
    })

    success.value = 'Annonce créée avec succès !'
    
    // Réinitialiser le formulaire
    form.title = ''
    form.description = ''
    form.price = 0
    form.location = ''
    form.categoryId = ''

    // Faire disparaître le message de succès après 3 secondes
    setTimeout(() => {
      success.value = null
    }, 3000)

  } catch (err) {
    error.value = listingsError.value || 'Erreur lors de la création de l\'annonce'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>