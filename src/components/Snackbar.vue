<template>
  <div v-if="visible" class="snackbar" :class="type">
    {{ message }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('info')
let timeout = null

const show = (msg, snackType = 'info') => {
  if (timeout) clearTimeout(timeout)
  message.value = msg
  type.value = snackType
  visible.value = true
  timeout = setTimeout(() => {
    visible.value = false
  }, 2500)
}

defineExpose({ show })
</script>

<style scoped>
.snackbar {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  animation: fadeUp 0.3s ease;
}

.snackbar.success {
  background: #28a745;
}

.snackbar.error {
  background: #dc3545;
}

.snackbar.warning {
  background: #ffc107;
  color: #333;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .snackbar {
    white-space: normal;
    text-align: center;
    max-width: 90%;
    font-size: 0.8rem;
    padding: 10px 20px;
  }
}
</style>