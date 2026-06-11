<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import IdeaCard from '../components/IdeaCard.vue'
import EditIdeaModal from '../components/EditIdeaModal.vue'
import Snackbar from '../components/Snackbar.vue'
import axios from 'axios'

const router = useRouter()
const ideas = ref([])
const currentUser = ref(null)
const snackbar = ref(null)
const loading = ref(true)
const editingIdea = ref(null)

const API_URL = 'http://localhost:5000/api'

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const showMessage = (msg, type = 'success') => {
  if (snackbar.value) {
    snackbar.value.show(msg, type)
  }
}

const loadIdeas = async () => {
  try {
    const response = await axios.get(`${API_URL}/ideas/my`, getAuthHeaders())
    ideas.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки идей:', error)
    showMessage('Ошибка загрузки идей', 'error')
  }
}

const loadCurrentUser = () => {
  const user = localStorage.getItem('user')
  if (user) {
    currentUser.value = JSON.parse(user)
  } else {
    router.push('/login')
  }
}

const getStatusText = (status) => {
  const statuses = { idea: 'Идея', in_progress: 'В работе', done: 'Сделано' }
  return statuses[status] || status
}

const startEdit = (idea) => {
  editingIdea.value = idea
}

const onIdeaSaved = async () => {
  await loadIdeas()
  showMessage('Идея обновлена', 'success')
}

const deleteIdea = async (id) => {
  const confirmed = await new Promise((resolve) => {
    const result = window.confirm('Удалить эту идею?')
    resolve(result)
  })
  
  if (!confirmed) return
  
  try {
    await axios.delete(`${API_URL}/ideas/${id}`, getAuthHeaders())
    await loadIdeas()
    showMessage('Идея удалена', 'success')
  } catch (error) {
    showMessage(error.response?.data?.error || 'Ошибка удаления', 'error')
  }
}

onMounted(async () => {
  loadCurrentUser()
  await loadIdeas()
  loading.value = false
})
</script>

<template>
  <div class="my-ideas-page">
    <Snackbar ref="snackbar" />
    <EditIdeaModal 
      :idea="editingIdea" 
      @close="editingIdea = null"
      @saved="onIdeaSaved"
    />
    <div class="container">
      <h1>{{ currentUser?.role === 'admin' ? 'Все идеи' : 'Мои идеи' }}</h1>
      <p v-if="currentUser?.role !== 'admin' && ideas.length > 0">Здесь только ваши идеи</p>

      <div class="actions-header">
        <router-link to="/create" class="create-link">Создать новую идею</router-link>
      </div>

      <div v-if="loading" class="loading-state">Загрузка...</div>

      <div v-else class="ideas-grid">
        <IdeaCard
          v-for="idea in ideas"
          :key="idea.id"
          :idea="idea"
          :statusText="getStatusText(idea.status)"
          :currentUser="currentUser"
          :manageMode="true"
          @edit="startEdit"
          @delete="deleteIdea"
        />
      </div>

      <div v-if="!loading && ideas.length === 0" class="empty-state">
        <p v-if="currentUser?.role !== 'admin'">У вас пока нет идей</p>
        <p v-else>Идей пока нет</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-ideas-page {
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: white;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

p {
  color: rgba(255,255,255,0.9);
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.actions-header {
  text-align: right;
  margin-bottom: 20px;
}

.create-link {
  background: white;
  color: #ff9a44;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.create-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  align-items: stretch;
}

.ideas-grid > * {
  display: flex;
  height: 100%;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
  color: #666;
  margin-top: 20px;
}

.empty-state p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.8rem;
  }
  .ideas-grid {
    grid-template-columns: 1fr;
  }
  .actions-header {
    text-align: center;
  }
  .empty-state {
    padding: 30px;
  }
  .empty-state p {
    font-size: 1rem;
  }
}
</style>