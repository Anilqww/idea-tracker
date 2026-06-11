import { createRouter, createWebHistory } from 'vue-router'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const HomePage = () => delay(1000).then(() => import('./views/HomePage.vue'))
const LoginPage = () => delay(1000).then(() => import('./views/LoginPage.vue'))
const RegisterPage = () => delay(1000).then(() => import('./views/RegisterPage.vue'))
const CreateIdeaPage = () => delay(1000).then(() => import('./views/CreateIdeaPage.vue'))
const MyIdeasPage = () => delay(1000).then(() => import('./views/MyIdeasPage.vue'))
const ProfilePage = () => delay(1000).then(() => import('./views/ProfilePage.vue'))
const CompletedIdeasPage = () => delay(1000).then(() => import('./views/CompletedIdeasPage.vue'))

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/create', component: CreateIdeaPage },
  { path: '/my-ideas', component: MyIdeasPage },
  { path: '/profile', component: ProfilePage },
  { path: '/completed', component: CompletedIdeasPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router