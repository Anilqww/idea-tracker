<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: email.value,
      password: password.value
    })

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    window.location.href = '/'
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Вход</h1>
      <form @submit.prevent="login" autocomplete="off">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" autocomplete="off">
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input type="password" v-model="password" autocomplete="new-password">
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="auth-btn" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      <p class="auth-link">Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #ff9a44;
}

.error {
  color: #ef4444;
  font-size: 0.9rem;
  margin-bottom: 16px;
  text-align: center;
}

.auth-btn {
  background: #ff9a44;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.auth-btn:hover:not(:disabled) {
  background: #fc6076;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.auth-link a {
  color: #ff9a44;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 24px;
  }
  h1 {
    font-size: 1.6rem;
  }
}
</style>