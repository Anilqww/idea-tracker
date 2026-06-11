<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Snackbar from '../components/Snackbar.vue'
import axios from 'axios'

const router = useRouter()
const snackbar = ref(null)

const form = ref({
  title: '',
  description: ''
})

const titleMax = 100
const descMax = 500

const titleLength = computed(() => form.value.title.length)
const descLength = computed(() => form.value.description.length)
const loading = ref(false)

const API_URL = 'http://localhost:5000/api'

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const showMessage = (msg, type = 'success') => {
  if (snackbar.value) {
    snackbar.value.show(msg, type)
  }
}

const submitIdea = async () => {
  if (!form.value.title.trim() || !form.value.description.trim()) {
    showMessage('Заполните название и описание', 'error')
    return
  }

  if (form.value.title.length > titleMax) {
    showMessage(`Название не может быть длиннее ${titleMax} символов`, 'error')
    return
  }

  if (form.value.description.length > descMax) {
    showMessage(`Описание не может быть длиннее ${descMax} символов`, 'error')
    return
  }

  loading.value = true

  try {
    await axios.post(`${API_URL}/ideas`, {
      title: form.value.title.trim(),
      description: form.value.description.trim()
    }, getAuthHeaders())

    showMessage('Идея добавлена!', 'success')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    showMessage(error.response?.data?.error || 'Ошибка создания идеи', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-page">
    <Snackbar ref="snackbar" />
    <div class="container">
      <h1>Создать идею</h1>
      <p>Поделись своей мыслью</p>

      <form @submit.prevent="submitIdea" class="idea-form">
        <div class="form-group">
          <label>Название идеи</label>
          <input v-model="form.title" type="text" :maxlength="titleMax" required>
          <div class="counter" :class="{ 'warning': titleLength > titleMax - 20, 'danger': titleLength === titleMax }">
            {{ titleLength }} / {{ titleMax }}
          </div>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="form.description" rows="5" :maxlength="descMax" required></textarea>
          <div class="counter" :class="{ 'warning': descLength > descMax - 100, 'danger': descLength === descMax }">
            {{ descLength }} / {{ descMax }}
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Отправка...' : 'Отправить идею' }}
        </button>
        <button type="button" class="cancel-btn" @click="router.push('/')">Отмена</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: white;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 10px;
}

p {
  color: rgba(255,255,255,0.9);
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.idea-form {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
  font-family: inherit;
  box-sizing: border-box;
}

.counter {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
  margin-top: 5px;
}

.counter.warning {
  color: #f59e0b;
}

.counter.danger {
  color: #ef4444;
  font-weight: bold;
}

.submit-btn {
  background: #ff9a44;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 10px;
}

.submit-btn:hover:not(:disabled) {
  background: #fc6076;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  width: 100%;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.8rem;
  }
  .idea-form {
    padding: 20px;
  }
}
</style>