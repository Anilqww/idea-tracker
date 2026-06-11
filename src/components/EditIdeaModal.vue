<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  idea: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const visible = ref(false)
const loading = ref(false)
const currentUser = ref(null)

const form = ref({
  title: '',
  description: '',
  status: 'idea'
})

const API_URL = 'http://localhost:5000/api'

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const loadCurrentUser = () => {
  const user = localStorage.getItem('user')
  if (user) {
    currentUser.value = JSON.parse(user)
  }
}

const isAdmin = computed(() => currentUser.value?.role === 'admin')

watch(() => props.idea, (newIdea) => {
  if (newIdea) {
    form.value = {
      title: newIdea.title || '',
      description: newIdea.description || '',
      status: newIdea.status || 'idea'
    }
    visible.value = true
  }
}, { immediate: true })

const close = () => {
  visible.value = false
  emit('close')
}

const save = async () => {
  if (!form.value.title.trim() || !form.value.description.trim()) {
    alert('Заполните название и описание')
    return
  }

  loading.value = true

  try {
    const updateData = {
      title: form.value.title.trim(),
      description: form.value.description.trim()
    }
    
    if (isAdmin.value) {
      updateData.status = form.value.status
    }
    
    await axios.put(`${API_URL}/ideas/${props.idea.id}`, updateData, getAuthHeaders())

    emit('saved')
    close()
  } catch (error) {
    console.error('Ошибка:', error.response?.data)
    alert(error.response?.data?.error || 'Ошибка сохранения')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCurrentUser()
})
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Редактировать идею</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>Название</label>
          <input v-model="form.title" type="text" placeholder="Введите название">
        </div>
        
        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="form.description" rows="5" placeholder="Введите описание"></textarea>
        </div>
        
        <div class="form-group" v-if="isAdmin">
          <label>Статус</label>
          <select v-model="form.status">
            <option value="idea">Идея</option>
            <option value="in_progress">В работе</option>
            <option value="done">Сделано</option>
          </select>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="close" :disabled="loading">Отмена</button>
        <button class="save-btn" @click="save" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
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

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #ff9a44;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  background: #f0f0f0;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.save-btn {
  background: #ff9a44;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #fc6076;
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>