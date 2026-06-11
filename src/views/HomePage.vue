<template>
  <div class="home">
    <Snackbar ref="snackbar" />
    <div class="hero">
      <h1 class="hero-title">Трекер идей</h1>
      <p class="hero-subtitle">Превращайте мысли в проекты</p>
      <div class="hero-buttons">
        <router-link v-if="currentUser" to="/create" class="btn-primary">Предложить идею</router-link>
        <a href="#ideas" class="btn-secondary">Смотреть идеи</a>
      </div>
    </div>

    <div class="ideas-section" id="ideas">
      <div class="container">
        <div class="section-header">
          <h2>Активные идеи</h2>
          <p>Голосуйте за понравившиеся</p>
        </div>

        <div class="filters">
          <div class="search-box">
            <input type="text" v-model="searchQuery" placeholder="Поиск идей..." class="search-input">
            <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">✕</button>
          </div>
          <div class="filter-buttons">
            <button @click="selectedStatus = 'all'" :class="{ active: selectedStatus === 'all' }" class="filter-btn">Все</button>
            <button @click="selectedStatus = 'idea'" :class="{ active: selectedStatus === 'idea' }" class="filter-btn">Идеи</button>
            <button @click="selectedStatus = 'in_progress'" :class="{ active: selectedStatus === 'in_progress' }" class="filter-btn">В работе</button>
            <button @click="selectedStatus = 'done'" :class="{ active: selectedStatus === 'done' }" class="filter-btn">Сделано</button>
          </div>
          <div class="sort-box">
            <label>Сортировать:</label>
            <select v-model="sortBy" class="sort-select">
              <option value="votes">По голосам</option>
              <option value="name_asc">По названию (А-Я)</option>
              <option value="name_desc">По названию (Я-А)</option>
            </select>
          </div>
        </div>

        <!-- Облако слов после фильтров -->
        <div class="cloud-wrapper">
          <div ref="measureContainer" class="cloud-measure-container">
            <span
              v-for="word in cloudWords"
              :key="'measure-' + word.text"
              :id="'measure-' + word.text"
              :style="{ fontSize: calculateFontSize(word.count) + 'px' }"
              class="tag-item-measure"
            >
              {{ word.text }}
            </span>
          </div>

          <div v-if="cloudWords.length > 0" class="collision-free-cloud">
            <span
              v-for="(word, index) in cloudWords"
              :key="word.text"
              :style="{ 
                fontSize: calculateFontSize(word.count) + 'px',
                color: wordPositions[index]?.color || '#ffffff',
                left: `calc(50% + ${wordPositions[index]?.x || 0}px)`,
                top: `calc(50% + ${wordPositions[index]?.y || 0}px)`,
                transform: `translate(-50%, -50%) rotate(${wordPositions[index]?.rotate || 0}deg)`
              }"
              :class="{ 'tag-item': true, 'active-tag': searchQuery.toLowerCase() === word.text.toLowerCase(), 'is-vertical': wordPositions[index]?.rotate !== 0 }"
              @click="searchByTag(word.text)"
            >
              {{ word.text }}
            </span>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-number">{{ filteredIdeas.length }}</span>
            <span class="stat-label">Показано идей</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ ideas.filter(i => i.status === 'in_progress').length }}</span>
            <span class="stat-label">В работе</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ ideas.filter(i => i.status === 'done').length }}</span>
            <span class="stat-label">Сделано</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ ideas.reduce((sum, i) => sum + i.votes, 0) }}</span>
            <span class="stat-label">Всего голосов</span>
          </div>
        </div>

        <div class="ideas-grid">
          <IdeaCard
            v-for="idea in filteredIdeas"
            :key="idea.id"
            :idea="idea"
            :index="-1"
            :statusText="getStatusText(idea.status)"
            :currentUser="currentUser"
            :hasVoted="userVotes.includes(idea.id)"
            :canVote="true"
            :manageMode="false"
            @vote="vote"
            @unvote="unvote"
          />
        </div>

        <div v-if="!loading && filteredIdeas.length === 0" class="empty-state">
          <p>Ничего не найдено</p>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
        <div v-if="loading" class="loading-state">Загрузка...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import IdeaCard from '../components/IdeaCard.vue'
import Snackbar from '../components/Snackbar.vue'
import axios from 'axios'

const ideas = ref([])
const currentUser = ref(null)
const userVotes = ref([])
const snackbar = ref(null)
const loading = ref(true)
const measureContainer = ref(null)
const wordPositions = ref([])

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
    const response = await axios.get(`${API_URL}/ideas`)
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

const searchQuery = ref('')
const selectedStatus = ref('all')
const sortBy = ref('votes')

const getStatusText = (status) => {
  const statuses = { idea: 'Идея', in_progress: 'В работе', done: 'Сделано', all: 'Все' }
  return statuses[status] || status
}

const filteredIdeas = computed(() => {
  let result = [...ideas.value]

  if (selectedStatus.value !== 'all') {
    result = result.filter(idea => idea.status === selectedStatus.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(idea =>
      idea.title.toLowerCase().includes(query) || idea.description.toLowerCase().includes(query)
    )
  }
  
  if (sortBy.value === 'votes') {
    result.sort((a, b) => b.votes - a.votes)
  } else if (sortBy.value === 'name_asc') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'name_desc') {
    result.sort((a, b) => b.title.localeCompare(a.title))
  }
  
  return result
})

// Логика облака слов
const stopWords = ['и', 'в', 'во', 'на', 'с', 'по', 'а', 'но', 'как', 'то', 'что', 'это', 'для', 'из', 'к', 'за', 'от', 'о', 'у', 'при', 'же', 'бы', 'сделать', 'нужно', 'также', 'ещё', 'или']

const cloudWords = computed(() => {
  const counts = {}
  
  // Берем идеи в зависимости от выбранного статуса (без учета поиска)
  let targetIdeas = []
  if (selectedStatus.value === 'all') {
    targetIdeas = ideas.value
  } else {
    targetIdeas = ideas.value.filter(idea => idea.status === selectedStatus.value)
  }
  
  targetIdeas.forEach(idea => {
    const fullText = `${idea.title} ${idea.description}`.toLowerCase()
    const words = fullText.match(/[a-zа-яё0-9]+/g) || []
    
    words.forEach(word => {
      if (word.length > 2 && !stopWords.includes(word)) {
        counts[word] = (counts[word] || 0) + 1
      }
    })
  })
  
  return Object.entries(counts)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
})
const minSize = 16
const maxSize = 36

const maxCount = computed(() => {
  const counts = cloudWords.value.map(w => w.count)
  return counts.length ? Math.max(...counts) : 1
})

const minCount = computed(() => {
  const counts = cloudWords.value.map(w => w.count)
  return counts.length ? Math.min(...counts) : 1
})

const calculateFontSize = (count) => {
  if (maxCount.value === minCount.value) return minSize
  return minSize + ((count - minCount.value) / (maxCount.value - minCount.value)) * (maxSize - minSize)
}

const isIntersecting = (box1, box2) => {
  const padding = 2
  return !(
    box1.x + box1.w + padding < box2.x ||
    box2.x + box2.w + padding < box1.x ||
    box1.y + box1.h + padding < box2.y ||
    box2.y + box2.h + padding < box1.y
  )
}

const calculatePositions = async () => {
  if (cloudWords.value.length === 0) return
  await nextTick()

  const placedBoxes = []
  const computedPositions = []
  
  const colors = ['#ff9a44', '#ff6b6b', '#c44569', '#e84393', '#6c5ce7', '#00cec9', '#fdcb6e', '#a29bfe', '#55efc4', '#00b894', '#0984e3', '#74b9ff']
  
  cloudWords.value.forEach((word, index) => {
    const measureEl = document.getElementById(`measure-${word.text}`)
    if (!measureEl) return

    const shouldRotate = index > 2 && Math.random() < 0.3
    const rotateAngle = shouldRotate ? 90 : 0

    const originalW = measureEl.offsetWidth
    const originalH = measureEl.offsetHeight
    const w = shouldRotate ? originalH : originalW
    const h = shouldRotate ? originalW : originalH

    let x = 0
    let y = 0
    let angle = 0
    let spiralStep = 0.8
    let foundPosition = false

    while (!foundPosition) {
      const radius = spiralStep * angle
      x = radius * Math.cos(angle) * 1.2
      y = radius * Math.sin(angle) * 0.65

      const currentBox = {
        x: x - w / 2,
        y: y - h / 2,
        w: w,
        h: h
      }

      const hasCollision = placedBoxes.some(placedBox => isIntersecting(currentBox, placedBox))

      if (!hasCollision) {
        placedBoxes.push(currentBox)
        computedPositions.push({
          x: Math.round(x),
          y: Math.round(y),
          color: colors[index % colors.length],
          rotate: rotateAngle
        })
        foundPosition = true
      }

      angle += 0.05
    }
  })

  wordPositions.value = computedPositions
}

watch(cloudWords, () => {
  calculatePositions()
}, { deep: true })

const searchByTag = (tag) => {
  searchQuery.value = tag
}

const clearSearch = () => {
  searchQuery.value = ''
}

watch(selectedStatus, () => {
  searchQuery.value = ''
})

const vote = async (id) => {
  if (!currentUser.value) return
  if (userVotes.value.includes(id)) {
    showMessage('Вы уже голосовали за эту идею', 'warning')
    return
  }
  try {
    await axios.post(`${API_URL}/votes`, { ideaId: id }, getAuthHeaders())
    const idea = ideas.value.find(i => i.id === id)
    if (idea) {
      idea.votes++
      userVotes.value.push(id)
      showMessage('Голос учтён', 'success')
    }
  } catch (error) {
    showMessage(error.response?.data?.error || 'Ошибка голосования', 'error')
  }
}

const unvote = async (id) => {
  const idea = ideas.value.find(i => i.id === id)
  if (!idea || !userVotes.value.includes(id)) return
  try {
    await axios.delete(`${API_URL}/votes`, { data: { ideaId: id }, ...getAuthHeaders() })
    idea.votes--
    userVotes.value = userVotes.value.filter(v => v !== id)
    showMessage('Голос отменён', 'success')
  } catch (error) {
    showMessage(error.response?.data?.error || 'Ошибка отмены голоса', 'error')
  }
}

onMounted(async () => {
  loadCurrentUser()
  await loadIdeas()
  await loadUserVotes()
  loading.value = false
  calculatePositions()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  text-align: center;
  padding: 60px 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  background: white;
  color: #ff9a44;
  padding: 12px 32px;
  border-radius: 40px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.ideas-section {
  padding: 20px 20px 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.section-header p {
  color: rgba(255,255,255,0.9);
  font-size: 1.2rem;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.05);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  width: 100%;
  font-size: 14px;
  background: #fafafa;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  background: #f0f0f0;
  color: #5a4a3a;
  font-weight: 500;
}

.filter-btn.active {
  background: #ff9a44;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5a4a3a;
  font-weight: 500;
}

.sort-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  color: #5a4a3a;
}

.cloud-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  margin-top: 10px;
}

.cloud-measure-container {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
}

.tag-item-measure {
  display: inline-block;
  font-weight: 800;
  padding: 1px 4px;
}

.collision-free-cloud {
  position: relative;
  width: 100%;
  max-width: 580px;
  height: 250px;
  background: transparent;
}

.tag-item {
  position: absolute;
  cursor: pointer;
  font-weight: 800;
  user-select: none;
  white-space: nowrap;
  transition: filter 0.2s ease, color 0.2s ease;
  padding: 1px 4px;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.95),
               1px 1px 2px rgba(0, 0, 0, 0.95),
               -1px -1px 2px rgba(0, 0, 0, 0.95),
               -1px 1px 2px rgba(0, 0, 0, 0.95),
               1px -1px 2px rgba(0, 0, 0, 0.95);
}

.tag-item:hover {
  filter: brightness(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.3));
  color: #ff9a44 !important;
  z-index: 99;
}

.active-tag {
  background: rgba(255, 255, 255, 0.15);
  padding: 1px 8px;
  border-radius: 12px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 50px;
}

.stat-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  padding: 30px 40px;
  border-radius: 20px;
  text-align: center;
  min-width: 150px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.5);
}

.stat-number {
  display: block;
  font-size: 3rem;
  font-weight: bold;
  color: #ff9a44;
}

.stat-label {
  color: #5a4a3a;
  font-size: 1rem;
  font-weight: 500;
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
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  color: #666;
  margin-top: 20px;
}

.loading-state {
  background: rgba(255,255,255,0.8);
}

@media (max-width: 768px) {
  .collision-free-cloud {
    height: 190px;
    transform: scale(0.7);
  }
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1rem; }
  .hero-buttons { flex-direction: column; align-items: center; }
  .section-header h2 { font-size: 1.8rem; }
  .filters { flex-direction: column; align-items: stretch; }
  .ideas-grid { grid-template-columns: 1fr; }
  .stats-row { gap: 15px; }
  .stat-card { padding: 20px 25px; min-width: 100px; }
  .stat-number { font-size: 2rem; }
}
</style>