<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title>Панель управления</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn @click="logout">Выйти</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <h1>Добро пожаловать!</h1>
        <p>Здесь будет дашборд с оборудованием и графиками ППР</p>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>