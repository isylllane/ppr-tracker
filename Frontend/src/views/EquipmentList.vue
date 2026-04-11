<template>
  <v-app>
    <app-bar title="Оборудование" />

    <v-main>
      <v-container>
        <!-- Кнопка добавления (только для админа) -->
        <v-row class="mb-4">
          <v-col>
            <v-btn color="primary" @click="openAddDialog" v-if="isAdmin">
              <v-icon left>mdi-plus</v-icon>
              Добавить оборудование
            </v-btn>
          </v-col>
        </v-row>

        <!-- Таблица оборудования -->
        <v-data-table
            :headers="headers"
            :items="equipment"
            :loading="loading"
            :search="search"
            class="elevation-1"
        >
          <template v-slot:top>
            <v-text-field
                v-model="search"
                label="Поиск"
                class="mx-4"
                clearable
            ></v-text-field>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" @click="viewEquipment(item.id)">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn icon size="small" @click="scanQr(item.qr_code)" v-if="isAdmin">
              <v-icon>mdi-qrcode-scan</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-container>
    </v-main>

    <!-- Диалог добавления оборудования -->
    <v-dialog v-model="addDialog" max-width="600px">
      <v-card>
        <v-card-title>Добавить оборудование</v-card-title>
        <v-card-text>
          <v-text-field v-model="newEquipment.name" label="Название" required></v-text-field>
          <v-text-field v-model="newEquipment.model" label="Модель"></v-text-field>
          <v-text-field v-model="newEquipment.serial_number" label="Серийный номер"></v-text-field>
          <v-text-field v-model="newEquipment.location" label="Местоположение"></v-text-field>
          <v-text-field v-model="newEquipment.qr_code" label="QR-код (уникальный)"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="addDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveEquipment">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import AppBar from '../components/AppBar.vue'

const router = useRouter()
const equipment = ref([])
const loading = ref(false)
const search = ref('')
const addDialog = ref(false)
const newEquipment = ref({})

const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = computed(() => user.role === 'admin')

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Название', key: 'name' },
  { title: 'Модель', key: 'model' },
  { title: 'Местоположение', key: 'location' },
  { title: 'QR-код', key: 'qr_code' },
  { title: 'Действия', key: 'actions', sortable: false }
]

const loadEquipment = async () => {
  loading.value = true
  try {
    const response = await api.get('/equipment')
    equipment.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки оборудования:', error)
  } finally {
    loading.value = false
  }
}

const viewEquipment = (id) => {
  router.push(`/equipment/${id}`)
}

const scanQr = (qrCode) => {
  router.push(`/equipment/qr/${qrCode}`)
}

const openAddDialog = () => {
  newEquipment.value = {}
  addDialog.value = true
}

const saveEquipment = async () => {
  try {
    await api.post('/equipment', newEquipment.value)
    addDialog.value = false
    loadEquipment()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert('Ошибка при сохранении оборудования')
  }
}

onMounted(() => {
  loadEquipment()
})
</script>