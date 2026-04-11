<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-title>{{ title }}</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn @click="goToDashboard">
      <v-icon>mdi-view-dashboard</v-icon>
    </v-btn>
    <v-btn @click="goToEquipment">
      <v-icon>mdi-factory</v-icon>
    </v-btn>
    <v-btn @click="goToScanner">
      <v-icon>mdi-qrcode-scan</v-icon>
    </v-btn>
    <v-btn @click="logout">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: 'Система ТО'
  }
})

const router = useRouter()

const goToDashboard = () => router.push('/dashboard')
const goToEquipment = () => router.push('/equipment')
const goToScanner = () => router.push('/scanner')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>