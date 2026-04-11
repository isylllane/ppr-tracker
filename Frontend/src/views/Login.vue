<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <v-card width="400" class="pa-6">
        <v-card-title class="text-center">Вход в систему</v-card-title>
        <v-card-text>
          <v-text-field v-model="username" label="Логин" outlined></v-text-field>
          <v-text-field v-model="password" label="Пароль" type="password" outlined></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="login">Войти</v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'


const username = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    router.push('/dashboard')
  } catch (error) {
    alert('Ошибка входа')
  }
}
</script>