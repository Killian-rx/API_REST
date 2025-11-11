<template>
  <div class="card">
    <div class="auth-tabs">
      <button 
        class="auth-tab" 
        :class="{ active: activeTab === 'login' }"
        @click="activeTab = 'login'"
      >
        Connexion
      </button>
      <button 
        class="auth-tab" 
        :class="{ active: activeTab === 'register' }"
        @click="activeTab = 'register'"
      >
        Inscription
      </button>
    </div>

    <!-- Erreur -->
    <div v-if="authError" class="alert alert-danger">
      {{ authError }}
    </div>

    <!-- Formulaire de connexion -->
    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
      <h2 class="card-title">Se connecter</h2>
      
      <div class="form-group">
        <label class="form-label" for="login-email">Email</label>
        <input
          id="login-email"
          v-model="loginForm.email"
          type="email"
          class="form-input"
          required
          :disabled="isLoadingAuth"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="login-password">Mot de passe</label>
        <input
          id="login-password"
          v-model="loginForm.password"
          type="password"
          class="form-input"
          required
          :disabled="isLoadingAuth"
        />
      </div>

      <button 
        type="submit" 
        class="btn btn-primary" 
        :disabled="isLoadingAuth"
        style="width: 100%;"
      >
        <span v-if="isLoadingAuth" class="loading"></span>
        <span v-else>Se connecter</span>
      </button>
    </form>

    <!-- Formulaire d'inscription -->
    <form v-else @submit.prevent="handleRegister">
      <h2 class="card-title">S'inscrire</h2>
      
      <div class="form-group">
        <label class="form-label" for="register-name">Nom</label>
        <input
          id="register-name"
          v-model="registerForm.name"
          type="text"
          class="form-input"
          required
          :disabled="isLoadingAuth"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="register-email">Email</label>
        <input
          id="register-email"
          v-model="registerForm.email"
          type="email"
          class="form-input"
          required
          :disabled="isLoadingAuth"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="register-phone">Téléphone (optionnel)</label>
        <input
          id="register-phone"
          v-model="registerForm.phone"
          type="tel"
          class="form-input"
          :disabled="isLoadingAuth"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="register-password">Mot de passe</label>
        <input
          id="register-password"
          v-model="registerForm.password"
          type="password"
          class="form-input"
          required
          minlength="6"
          :disabled="isLoadingAuth"
        />
      </div>

      <button 
        type="submit" 
        class="btn btn-primary" 
        :disabled="isLoadingAuth"
        style="width: 100%;"
      >
        <span v-if="isLoadingAuth" class="loading"></span>
        <span v-else>S'inscrire</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login, register, isLoadingAuth, authError, clearError } = useAuth()

const activeTab = ref<'login' | 'register'>('login')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const handleLogin = async () => {
  clearError()
  try {
    await login(loginForm.email, loginForm.password)
    // Réinitialiser le formulaire en cas de succès
    loginForm.email = ''
    loginForm.password = ''
  } catch (error) {
    // L'erreur est déjà gérée dans le composable
  }
}

const handleRegister = async () => {
  clearError()
  try {
    await register(
      registerForm.name, 
      registerForm.email, 
      registerForm.password,
      registerForm.phone || undefined
    )
    // Réinitialiser le formulaire en cas de succès
    registerForm.name = ''
    registerForm.email = ''
    registerForm.phone = ''
    registerForm.password = ''
  } catch (error) {
    // L'erreur est déjà gérée dans le composable
  }
}
</script>