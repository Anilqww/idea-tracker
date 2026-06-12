<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'

const route = useRoute()
const currentUser = ref(null)
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

watch(() => route.path, () => {
  isMenuOpen.value = false
})

const loadUser = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) {
    currentUser.value = JSON.parse(user)
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentUser.value = null
  window.location.href = '/'
}

onMounted(() => {
  loadUser()
})
</script>

<template>
  <div class="app">
    <div class="animated-bg">
      <div class="gradient-layer"></div>
      <div class="pulse-circle circle-1"></div>
      <div class="pulse-circle circle-2"></div>
    </div>

    <header class="header">
      <div class="header-container">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <img src="/logo.png" alt="IdeaTracker" class="logo-img">
          </router-link>
        </div>

        <button class="burger-btn" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <div class="mobile-menu" :class="{ 'open': isMenuOpen }">
      <div class="mobile-menu-overlay" @click="toggleMenu"></div>
      <div class="mobile-menu-content">
        <div class="menu-links">
          <RouterLink to="/" class="mobile-nav-link" :class="{ active: route.path === '/' }" @click="toggleMenu">Главная</RouterLink>
          <RouterLink v-if="currentUser" to="/create" class="mobile-nav-link" :class="{ active: route.path === '/create' }" @click="toggleMenu">Идея</RouterLink>
          <RouterLink v-if="currentUser" to="/my-ideas" class="mobile-nav-link" :class="{ active: route.path === '/my-ideas' }" @click="toggleMenu">
            {{ currentUser?.role === 'admin' ? 'Все идеи' : 'Мои идеи' }}
          </RouterLink>
          <RouterLink v-if="currentUser" to="/completed" class="mobile-nav-link" :class="{ active: route.path === '/completed' }" @click="toggleMenu">Лучшие идеи</RouterLink>
          <RouterLink v-if="currentUser" to="/profile" class="mobile-nav-link" :class="{ active: route.path === '/profile' }" @click="toggleMenu">Профиль</RouterLink>
          
          <template v-if="!currentUser">
            <RouterLink to="/login" class="mobile-nav-link" :class="{ active: route.path === '/login' }" @click="toggleMenu">Вход</RouterLink>
            <RouterLink to="/register" class="mobile-nav-link" :class="{ active: route.path === '/register' }" @click="toggleMenu">Регистрация</RouterLink>
          </template>
          <button v-else class="mobile-logout-btn" @click="logout">Выйти</button>
        </div>
      </div>
    </div>

    <main class="main">
      <Suspense>
        <RouterView />
      </Suspense>
    </main>

    <footer class="footer">
      <div class="footer-container">
        <div class="footer-logo">IdeaTracker</div>
        <p class="footer-desc">Платформа для генерации и развития проектов</p>
      </div>
    </footer>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #5a4a3a;
  background-color: #faf0e6;
  -webkit-font-smoothing: antialiased;
}
.app { display: flex; flex-direction: column; min-height: 100vh; position: relative; }

.animated-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; pointer-events: none; }
.gradient-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #ff9a44, #ff8c33, #ff9a44); background-size: 400% 400%; animation: gradientMove 6s ease infinite; }
@keyframes gradientMove { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }
.pulse-circle { position: absolute; border-radius: 50%; background: rgba(255, 200, 100, 0.2); animation: pulse 4s ease-in-out infinite; }
.circle-1 { width: 250px; height: 250px; top: 10%; left: -80px; }
.circle-2 { width: 350px; height: 350px; bottom: 10%; right: -120px; animation-delay: 1.5s; }
@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(1.3); opacity: 0.5; } }

.header { position: sticky; top: 0; z-index: 100; background: rgba(250, 240, 230, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(240, 224, 208, 0.5); }
.header-container { max-width: 1200px; margin: 0 auto; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; }

.logo { flex-shrink: 0; display: flex; align-items: center; }
.logo-img { height: 60px; width: auto; }

.burger-btn { 
  display: none;
  flex-direction: column; 
  gap: 5px; 
  background: none; 
  border: none; 
  cursor: pointer; 
  padding: 5px; 
  z-index: 101; 
}
.burger-btn span { 
  width: 30px; 
  height: 3px; 
  background: #5a4a3a; 
  border-radius: 2px; 
  transition: 0.3s; 
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;
  visibility: hidden;
}

.mobile-menu.open {
  visibility: visible;
}

.mobile-menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-menu.open .mobile-menu-overlay {
  opacity: 1;
}

.mobile-menu-content {
  position: relative;
  width: 280px;
  height: 100%;
  background: white;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.mobile-menu.open .mobile-menu-content {
  transform: translateX(0);
}

.menu-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 60px 20px 20px 20px;
  gap: 12px;
}

.mobile-nav-link, .mobile-logout-btn {
  color: #5a4a3a;
  text-decoration: none;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-align: center;
  font-family: inherit;
  width: 100%;
  display: block;
  background: none;
  cursor: pointer;
  border: none;
}

.mobile-nav-link.active {
  background: #ff9a44;
  color: white;
}

.mobile-nav-link:hover {
  background: #ff9a44;
  color: white;
}

.mobile-logout-btn:hover {
  color: #ff9a44;
}

.main { flex: 1; position: relative; z-index: 1; }

.footer { background: rgba(250, 240, 230, 0.9); padding: 1rem 0; text-align: center; position: relative; z-index: 1; border-top: 1px solid rgba(240, 224, 208, 0.5); }
.footer-logo { font-size: 1.5rem; font-weight: 600; color: #ff9a44; margin-bottom: 2px; line-height: 1; }
.footer-desc { color: #5a4a3a; font-size: 0.9rem; font-weight: 700; margin: 0; opacity: 0.8; }

/* ========== МОБИЛЬНАЯ ВЕРСИЯ ========== */
@media (max-width: 768px) {
  .burger-btn {
    display: flex;
  }
  
  .logo-img {
    height: 45px;
  }
  
  .mobile-menu {
    justify-content: flex-end;
  }
  
  .mobile-menu-content {
    width: 70%;
    max-width: 280px;
  }
  
  .menu-links {
    padding: 80px 20px 20px;
  }
  
  .mobile-nav-link, .mobile-logout-btn {
    padding: 12px 16px;
    font-size: 1rem;
  }
}
</style>
