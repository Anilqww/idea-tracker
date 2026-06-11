<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userIdeas = ref([])
const currentUser = ref(null)
const loading = ref(true)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const loadUserIdeas = async () => {
  try {
    const response = await axios.get(`${API_URL}/ideas/my`, getAuthHeaders())
    if (currentUser.value?.role === 'admin') {
      userIdeas.value = response.data.filter(idea => idea.status !== 'idea')
    } else {
      userIdeas.value = response.data.filter(idea => idea.status === 'idea')
    }
  } catch (error) {
    console.error('Ошибка загрузки идей:', error)
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

// Сортировка: от наибольшего к наименьшему (b - a)
const sortedUserIdeas = computed(() => {
  return [...userIdeas.value].sort((a, b) => (b.votes || 0) - (a.votes || 0))
})

const totalIdeas = computed(() => userIdeas.value.length)
const totalVotes = computed(() => userIdeas.value.reduce((sum, idea) => sum + (idea.votes || 0), 0))
const inProgressCount = computed(() => userIdeas.value.filter(idea => idea.status === 'in_progress').length)
const bestIdea = computed(() => {
  if (userIdeas.value.length === 0) return null
  return userIdeas.value.reduce((best, idea) => (idea.votes > best.votes ? idea : best), userIdeas.value[0])
})

onMounted(async () => {
  loadCurrentUser()
  await loadUserIdeas()
  loading.value = false
})
</script>

<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <div class="avatar">
          <div class="avatar-initials">
            {{ currentUser?.name?.charAt(0) || '?' }}
          </div>
        </div>
        <h1>{{ currentUser?.name || 'Пользователь' }}</h1>
        <p class="email">{{ currentUser?.email || '' }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ totalIdeas }}</div>
          <div class="stat-label">Идей создано</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalVotes }}</div>
          <div class="stat-label">Голосов получено</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ inProgressCount }}</div>
          <div class="stat-label">В работе</div>
        </div>
      </div>

      <div v-if="bestIdea" class="best-idea">
        <h3>Лучшая идея</h3>
        <p class="best-title">{{ bestIdea.title }}</p>
        <p class="best-votes">{{ bestIdea.votes }} голосов</p>
      </div>

      <div class="ideas-section">
        <h2>Мои идеи</h2>
        <div v-if="loading" class="loading-state">Загрузка...</div>
        <div v-else-if="userIdeas.length === 0" class="empty-state">
          <p>У вас пока нет идей</p>
        </div>
        <div v-else class="ideas-list">
          <div v-for="idea in sortedUserIdeas" :key="idea.id" class="idea-item">
            <div class="idea-info">
              <h4>{{ idea.title }}</h4>
              <p>{{ idea.description }}</p>
              <div class="idea-meta">
                <span class="status-badge" :class="idea.status">
                  {{ idea.status === 'idea' ? 'Идея' : idea.status === 'in_progress' ? 'В работе' : 'Сделано' }}
                </span>
                <span class="vote-count">{{ idea.votes || 0 }} голосов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 40px 20px;
  padding-bottom: 100px; /* Добавлен отступ для футера */
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.avatar {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.avatar-initials {
  font-size: 3rem;
  font-weight: bold;
  color: #ff9a44;
}

.profile-header h1 {
  color: white;
  font-size: 2rem;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.email {
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ff9a44;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.best-idea {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.best-idea h3 {
  color: #ff9a44;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.best-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.best-votes {
  color: #666;
  font-size: 0.9rem;
}

.ideas-section h2 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.empty-state, .loading-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
  color: #666;
  margin-top: 20px;
}

.ideas-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.idea-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s;
}

.idea-item:hover {
  transform: translateX(5px);
}

.idea-info h4 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.idea-info p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 12px;
  line-height: 1.4;
}

.idea-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-badge.idea { background: #007bff; color: white; }
.status-badge.in_progress { background: #fd7e14; color: white; }
.status-badge.done { background: #28a745; color: white; }

.vote-count {
  color: #5a4a3a;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; gap: 12px; }
  .stat-value { font-size: 2rem; }
  .profile-header h1 { font-size: 1.5rem; }
}
</style>