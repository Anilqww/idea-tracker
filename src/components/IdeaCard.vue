<script setup>
const props = defineProps({
  idea: Object,
  statusText: String,
  currentUser: Object,
  hasVoted: {
    type: Boolean,
    default: false
  },
  canVote: {
    type: Boolean,
    default: true
  },
  manageMode: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['vote', 'unvote', 'edit', 'delete'])

const canEdit = () => {
  if (!props.currentUser) return false
  if (props.currentUser.role === 'admin') return true
  return props.currentUser.id === props.idea.user_id
}
</script>

<template>
  <div 
    class="idea-card" 
    :class="[
      idea.status, 
      { 
        'top-1': index === 0, 
        'top-2': index === 1, 
        'top-3': index === 2 
      }
    ]"
  >
    <div class="card-votes">
      <span class="vote-count">{{ idea.votes }}</span>
      <span class="vote-label">голосов</span>
    </div>
    <div class="card-content">
      <div class="card-header">
        <h3>{{ idea.title }}</h3>
        <span class="status-badge" :class="idea.status">{{ statusText }}</span>
      </div>
      <p class="description">{{ idea.description }}</p>
      <div class="card-footer">
        <button 
          v-if="currentUser && !manageMode && canVote" 
          class="vote-btn" 
          :class="{ 'voted': hasVoted }"
          @click="hasVoted ? emit('unvote', idea.id) : emit('vote', idea.id)"
        >
          {{ hasVoted ? 'Отменить голос' : 'Голосовать' }}
        </button>
        
        <div v-if="manageMode && canEdit()" class="action-buttons">
          <button class="edit-btn" @click="emit('edit', idea)">Изменить</button>
          <button class="delete-btn" @click="emit('delete', idea.id)">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.idea-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  
  /* ИСПРАВЛЕНИЕ: Переводим на жесткую двухколоночную сетку */
  display: grid !important;
  grid-template-columns: auto 1fr; 
  
  /* Принудительно заставляем её занять всю высоту, которую дала сетка top-grid */
  height: 100% !important; 
  min-height: 220px;
  box-sizing: border-box;
}

.idea-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 35px rgba(0,0,0,0.15);
}

.card-votes {
  background: white;
  padding: 20px 15px;
  text-align: center;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 2px solid #e0e0e0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
}

.vote-count {
  font-size: 2rem;
  font-weight: bold;
  color: #ff9a44;
}

.vote-label {
  font-size: 0.8rem;
  color: #5a4a3a;
  font-weight: 500;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Заставляет контентную часть полностью заполнять высоту рамки карточки */
  flex-grow: 1; 
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: nowrap;
  gap: 12px;
  min-height: 52px; 
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.15rem; /* Аккуратный одинаковый шрифт для всех заголовков */
  line-height: 1.4;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  align-self: flex-start;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.idea { background: #007bff; color: white; }
.status-badge.in_progress { background: #fd7e14; color: white; }
.status-badge.done { background: #28a745; color: white; }

.description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
  font-size: 0.9rem; /* Одинаковый аккуратный шрифт для всех описаний */
  text-align: justify;
  text-justify: inter-word;
  /* Описание растягивается и выталкивает футер на дно карточки */
  flex-grow: 1; 
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto; /* Намертво прижимает футер к нижней части карточки */
}

.vote-btn {
  background: #ff9a44;
  border: none;
  padding: 6px 16px;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.vote-btn:hover {
  background: #fc6076;
  transform: scale(1.02);
}

.vote-btn.voted {
  background: #f0f0f0;
  color: #666;
}

.vote-btn.voted:hover {
  background: #ffe0e0;
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.edit-btn {
  color: #ff9a44;
  background: #fff0e6;
}

.edit-btn:hover {
  background: #ffe0cc;
}

.delete-btn {
  color: #e74c3c;
  background: #ffe0e0;
}

.delete-btn:hover {
  background: #ffc0c0;
}

/* СТИЛИ РАМОК ДЛЯ ТОП-3 (ОТЛИЧАЮТСЯ ЦВЕТОМ, НО НЕ ВЫСОТОЙ) */
.idea-card.top-1 {
  border: 3px solid #ffd700;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
}
.idea-card.top-2 {
  border: 3px solid #aab7b8;
  box-shadow: 0 10px 25px rgba(170, 183, 184, 0.15);
}
.idea-card.top-3 {
  border: 3px solid #cd7f32;
  box-shadow: 0 10px 20px rgba(205, 127, 50, 0.12);
}

@media (max-width: 768px) {
  .card-header h3 { font-size: 1rem; }
  .card-votes { min-width: 60px; padding: 15px 10px; }
  .vote-count { font-size: 1.5rem; }
}
</style>