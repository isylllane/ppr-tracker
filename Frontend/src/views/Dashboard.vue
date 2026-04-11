<template>
  <v-app>
    <app-bar title="Панель управления" />

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Последние ремонты</v-card-title>
              <v-card-text>
                <v-list v-if="recentRepairs.length">
                  <v-list-item v-for="repair in recentRepairs" :key="repair.id">
                    <v-list-item-title>{{ repair.equipment_name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ repair.failure_date }} - {{ repair.description }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <v-alert v-else type="info">Нет данных о ремонтах</v-alert>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Быстрые действия</v-card-title>
              <v-card-text>
                <v-btn block class="mb-2" @click="$router.push('/scanner')">
                  <v-icon left>mdi-qrcode-scan</v-icon>
                  Сканировать QR
                </v-btn>
                <v-btn block variant="outlined" @click="$router.push('/equipment')">
                  <v-icon left>mdi-factory</v-icon>
                  Всё оборудование
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import api from '../api'
import AppBar from '../components/AppBar.vue'

const recentRepairs = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/repair/dashboard/recent')
    recentRepairs.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки дашборда:', error)
  }
})
</script>