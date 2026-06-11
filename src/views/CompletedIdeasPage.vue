<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const ideas = ref([])
const currentUser = ref(null)
const userVotes = ref([])
const loading = ref(true)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const loadIdeas = async () => {
  try {
    const response = await axios.get(`${API_URL}/ideas?status=done`)
    ideas.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки идей:', error)
  }
}

const loadUserVotes = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    const response = await axios.get(`${API_URL}/votes/my`, getAuthHeaders())
    userVotes.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки голосов:', error)
  }
}

const loadCurrentUser = () => {
  const user = localStorage.getItem('user')
  if (user) {
    currentUser.value = JSON.parse(user)
  }
}

const vote = async (id) => {
  if (!currentUser.value) return
  if (userVotes.value.includes(id)) return
  
  try {
    await axios.post(`${API_URL}/votes`, { ideaId: id }, getAuthHeaders())
    const idea = ideas.value.find(i => i.id === id)
    if (idea) {
      idea.votes++
      userVotes.value.push(id)
    }
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка голосования')
  }
}

const unvote = async (id) => {
  const idea = ideas.value.find(i => i.id === id)
  if (!idea || !userVotes.value.includes(id)) return
  
  try {
    await axios.delete(`${API_URL}/votes`, { data: { ideaId: id }, ...getAuthHeaders() })
    idea.votes--
    userVotes.value = userVotes.value.filter(v => v !== id)
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка отмены голоса')
  }
}

const topThree = computed(() => {
  return [...ideas.value].sort((a, b) => b.votes - a.votes).slice(0, 3)
})

const restIdeas = computed(() => {
  const topIds = topThree.value.map(i => i.id)
  return ideas.value.filter(i => !topIds.includes(i.id))
})

onMounted(async () => {
  loadCurrentUser()
  await loadIdeas()
  await loadUserVotes()
  loading.value = false
})
</script>

<template>
  <div class="completed-page">
    <div class="hero">
      <h1 class="hero-title">Лучшие идеи</h1>
      <p class="hero-subtitle">Топ реализованных проектов</p>
    </div>

    <div class="ideas-section">
      <div class="container">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-number">{{ ideas.length }}</div>
            <div class="stat-label">Реализованных идей</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ ideas.reduce((sum, i) => sum + i.votes, 0) }}</div>
            <div class="stat-label">Всего голосов</div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">Загрузка...</div>

        <div v-else>
          <div v-if="topThree.length > 0" class="top-three-wrapper">
            <div class="podium">
              <div v-for="(idea, index) in topThree" 
                   :key="idea.id" 
                   class="standard-card podium-card" 
                   :class="'place-' + (index + 1)">
                
                <div class="card-votes-side">
                  <div class="vote-count">{{ idea.votes }}</div>
                  <div class="vote-label">голосов</div>
                </div>
                
                <div class="card-body">
                  <div class="podium-digit-top">#{{ index + 1 }}</div>
                  <h3>{{ idea.title }}</h3>
                  <p class="description">{{ idea.description }}</p>
                  <div class="card-footer">
                    <button 
                      v-if="currentUser && !userVotes.includes(idea.id)" 
                      class="vote-btn" 
                      @click="vote(idea.id)"
                    >
                      Голосовать
                    </button>
                    <button 
                      v-if="currentUser && userVotes.includes(idea.id)" 
                      class="voted-btn" 
                      @click="unvote(idea.id)"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="restIdeas.length > 0" class="other-ideas">
            <h2 class="section-title">Остальные идеи</h2>
            <div class="ideas-grid">
              <div v-for="idea in restIdeas" :key="idea.id" class="standard-card">
                <div class="card-votes-side">
                  <div class="vote-count">{{ idea.votes }}</div>
                  <div class="vote-label">голосов</div>
                </div>
                <div class="card-body">
                  <h3>{{ idea.title }}</h3>
                  <p class="description">{{ idea.description }}</p>
                  <div class="card-footer">
                    <button 
                      v-if="currentUser && !userVotes.includes(idea.id)" 
                      class="vote-btn" 
                      @click="vote(idea.id)"
                    >
                      Голосовать
                    </button>
                    <button 
                      v-if="currentUser && userVotes.includes(idea.id)" 
                      class="voted-btn" 
                      @click="unvote(idea.id)"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.completed-page {
  font-family: inherit;
  min-height: 100vh;
}

.hero {
  text-align: center;
  padding: 60px 20px 40px;
}

.hero-title {
  font-family: inherit;
  font-size: 3.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-family: inherit;
  font-size: 1.3rem;
  color: rgba(255,255,255,0.9);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 50px;
}

.stat-card {
  background: white;
  padding: 25px 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.stat-number {
  font-family: inherit;
  font-size: 3rem;
  font-weight: bold;
  color: #ff9a44;
}

.stat-label {
  font-family: inherit;
  color: #5a4a3a;
  font-weight: 500;
}

.section-title {
  font-family: inherit;
  text-align: center;
  color: white;
  font-size: 2.2rem;
  margin-bottom: 40px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

/* Обычная карточка */
.standard-card {
  font-family: inherit;
  background: white;
  border-radius: 20px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  border: 3px solid transparent;
}

.standard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.card-votes-side {
  background: white;
  padding: 20px 15px;
  min-width: 95px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 2px solid #e0e0e0;
}

.vote-count {
  font-family: inherit;
  font-size: 2rem;
  font-weight: bold;
  color: #ff9a44;
  line-height: 1.2;
}

.vote-label {
  font-family: inherit;
  font-size: 0.8rem;
  color: #5a4a3a;
  font-weight: 500;
}

.card-body {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-body h3 {
  font-family: inherit;
  font-size: 1.15rem;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.card-body .description {
  font-family: inherit;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

/* Подиум */
.top-three-wrapper {
  max-width: 1050px;
  margin: 0 auto 60px;
}

.podium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  align-items: end;
}

.podium-digit-top {
  font-family: inherit;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  margin-top: -5px;
  margin-bottom: 5px;
}

.place-1 { grid-column: 2; order: 2; height: 340px; border-color: #ffd700; }
.place-1 .podium-digit-top { color: #ffd700; }

.place-2 { grid-column: 1; order: 1; height: 290px; border-color: #c0c0c0; }
.place-2 .podium-digit-top { color: #a8a8a8; }

.place-3 { grid-column: 3; order: 3; height: 240px; border-color: #cd7f32; }
.place-3 .podium-digit-top { color: #cd7f32; }

/* Остальные стили кнопок и адаптив остались прежними */
.other-ideas { margin-top: 50px; }
.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  padding-bottom: 80px; /* Добавьте эту строку, она создаст отступ в 80 пикселей снизу */
}
.vote-btn, .voted-btn { font-family: inherit; padding: 7px 18px; border-radius: 25px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s ease; }
.vote-btn { background: #ff9a44; color: white; }
.voted-btn { background: #28a745; color: white; }

@media (max-width: 768px) {
  .podium { grid-template-columns: 1fr; }
  .podium-card { height: auto !important; }
  .standard-card { flex-direction: column; }
  .card-votes-side { border-right: none; border-bottom: 2px solid #e0e0e0; flex-direction: row; justify-content: space-between; padding: 12px 20px; width: 100%; }
}
</style>