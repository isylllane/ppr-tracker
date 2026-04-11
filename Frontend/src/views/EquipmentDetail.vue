<template>
  <v-app>
    <app-bar :title="equipment?.name || 'Оборудование'" />

    <v-main>
      <v-container v-if="loading">
        <v-progress-circular indeterminate color="primary" class="d-block mx-auto"></v-progress-circular>
      </v-container>

      <v-container v-else-if="equipment">
        <!-- Основная информация -->
        <v-card class="mb-4">
          <v-card-title>Паспорт оборудования</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-subtitle>Название</v-list-item-subtitle>
                    <v-list-item-title class="font-weight-bold">{{ equipment.name }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-subtitle>Модель</v-list-item-subtitle>
                    <v-list-item-title>{{ equipment.model || '-' }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-subtitle>Серийный номер</v-list-item-subtitle>
                    <v-list-item-title>{{ equipment.serial_number || '-' }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-subtitle>Местоположение</v-list-item-subtitle>
                    <v-list-item-title>{{ equipment.location || '-' }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-subtitle>QR-код</v-list-item-subtitle>
                    <v-list-item-title>
                      <code>{{ equipment.qr_code }}</code>
                      <v-btn icon size="small" @click="downloadQr" title="Скачать QR-код">
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                      <v-btn icon size="small" @click="printQr" title="Распечатать">
                        <v-icon>mdi-printer</v-icon>
                      </v-btn>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <!-- Дополнительные параметры -->
            <v-row v-if="params.length">
              <v-col cols="12">
                <v-divider class="my-2"></v-divider>
                <div class="text-subtitle-1 font-weight-bold mb-2">Дополнительные параметры</div>
                <v-chip v-for="param in params" :key="param.param_name" class="mr-2 mb-2">
                  {{ param.param_name }}: {{ param.param_value }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn color="success" @click="openPprDialog">
              <v-icon left>mdi-check</v-icon>
              Выполнить ППР
            </v-btn>
            <v-btn color="warning" @click="openRepairDialog">
              <v-icon left>mdi-wrench</v-icon>
              Внеплановый ремонт
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Табы с историей -->
        <v-card>
          <v-tabs v-model="tab" color="primary">
            <v-tab value="schedule">График ППР</v-tab>
            <v-tab value="ppr">История ППР</v-tab>
            <v-tab value="repairs">Ремонты</v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <!-- График ППР -->
              <v-tabs-window-item value="schedule">
                <v-data-table
                    :headers="scheduleHeaders"
                    :items="schedule"
                    density="compact"
                >
                  <template v-slot:item.next_due_date="{ item }">
                    <span :class="{ 'text-red': isOverdue(item.next_due_date) }">
                      {{ formatDate(item.next_due_date) }}
                    </span>
                  </template>
                </v-data-table>
              </v-tabs-window-item>

              <!-- История ППР -->
              <v-tabs-window-item value="ppr">
                <v-data-table
                    :headers="pprHeaders"
                    :items="pprHistory"
                    density="compact"
                >
                  <template v-slot:item.attachments="{ item }">
                    <v-btn
                        v-if="getAttachments('ppr', item.id).length"
                        icon
                        size="small"
                        @click="showAttachments('ppr', item.id)"
                    >
                      <v-icon>mdi-paperclip</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tabs-window-item>

              <!-- Ремонты -->
              <v-tabs-window-item value="repairs">
                <v-data-table
                    :headers="repairHeaders"
                    :items="repairs"
                    density="compact"
                >
                  <template v-slot:item.attachments="{ item }">
                    <v-btn
                        v-if="getAttachments('repair', item.id).length"
                        icon
                        size="small"
                        @click="showAttachments('repair', item.id)"
                    >
                      <v-icon>mdi-paperclip</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-container>

      <v-container v-else>
        <v-alert type="error">Оборудование не найдено</v-alert>
      </v-container>
    </v-main>

    <!-- Диалог добавления ППР -->
    <v-dialog v-model="pprDialog" max-width="500px">
      <v-card>
        <v-card-title>Выполнение ППР</v-card-title>
        <v-card-text>
          <v-date-input v-model="pprForm.performed_date" label="Дата выполнения" required></v-date-input>
          <v-text-field v-model="pprForm.hours_spent" label="Затрачено часов" type="number"></v-text-field>
          <v-textarea v-model="pprForm.notes" label="Примечание"></v-textarea>
          <v-file-input v-model="pprForm.file" label="Прикрепить фото/документ" accept="image/*,application/pdf"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="pprDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="savePpr" :loading="saving">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог добавления ремонта -->
    <v-dialog v-model="repairDialog" max-width="500px">
      <v-card>
        <v-card-title>Внеплановый ремонт</v-card-title>
        <v-card-text>
          <v-date-input v-model="repairForm.failure_date" label="Дата поломки" required></v-date-input>
          <v-textarea v-model="repairForm.description" label="Описание проблемы" required></v-textarea>
          <v-date-input v-model="repairForm.repair_date" label="Дата ремонта"></v-date-input>
          <v-text-field v-model="repairForm.cost" label="Стоимость" type="number" prefix="₽"></v-text-field>
          <v-text-field v-model="repairForm.downtime_hours" label="Время простоя (часы)" type="number"></v-text-field>
          <v-text-field v-model="repairForm.root_cause" label="Причина поломки"></v-text-field>
          <v-textarea v-model="repairForm.notes" label="Примечание"></v-textarea>
          <v-file-input v-model="repairForm.file" label="Прикрепить фото/документ" accept="image/*,application/pdf"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="repairDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveRepair" :loading="saving">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог просмотра вложений -->
    <v-dialog v-model="attachmentsDialog" max-width="800px">
      <v-card>
        <v-card-title>Прикреплённые файлы</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="file in currentAttachments" :key="file.id">
              <v-list-item-title>
                <a :href="file.file_path" target="_blank">{{ file.file_name }}</a>
              </v-list-item-title>
              <v-list-item-subtitle>
                Загружено: {{ formatDate(file.uploaded_at) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="attachmentsDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, isBefore } from 'date-fns'
import api from '../api'
import AppBar from '../components/AppBar.vue'

const route = useRoute()
const router = useRouter()

// Данные
const loading = ref(true)
const equipment = ref(null)
const params = ref([])
const schedule = ref([])
const pprHistory = ref([])
const repairs = ref([])
const attachments = ref([])

const tab = ref('schedule')

// Диалоги
const pprDialog = ref(false)
const repairDialog = ref(false)
const attachmentsDialog = ref(false)
const saving = ref(false)

const pprForm = ref({ performed_date: new Date().toISOString().split('T')[0], hours_spent: null, notes: '', file: null })
const repairForm = ref({ failure_date: new Date().toISOString().split('T')[0], description: '', repair_date: null, cost: null, downtime_hours: null, root_cause: '', notes: '', file: null })

const currentAttachments = ref([])

// Заголовки таблиц
const scheduleHeaders = [
  { title: 'Тип работ', key: 'work_type' },
  { title: 'Периодичность (дни)', key: 'frequency_days' },
  { title: 'Последнее выполнение', key: 'last_done_date', value: (item) => formatDate(item.last_done_date) },
  { title: 'Следующее ТО', key: 'next_due_date', value: (item) => formatDate(item.next_due_date) }
]

const pprHeaders = [
  { title: 'Дата', key: 'performed_date', value: (item) => formatDate(item.performed_date) },
  { title: 'Тип работ', key: 'work_type' },
  { title: 'Затрачено часов', key: 'hours_spent' },
  { title: 'Кто выполнил', key: 'performed_by_name' },
  { title: 'Примечание', key: 'notes' },
  { title: 'Файлы', key: 'attachments', sortable: false }
]

const repairHeaders = [
  { title: 'Дата поломки', key: 'failure_date', value: (item) => formatDate(item.failure_date) },
  { title: 'Описание', key: 'description' },
  { title: 'Дата ремонта', key: 'repair_date', value: (item) => formatDate(item.repair_date) },
  { title: 'Стоимость', key: 'cost' },
  { title: 'Причина', key: 'root_cause' },
  { title: 'Файлы', key: 'attachments', sortable: false }
]

// Методы
const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'dd.MM.yyyy')
}

const isOverdue = (date) => {
  if (!date) return false
  return isBefore(new Date(date), new Date())
}

const getAttachments = (type, id) => {
  return attachments.value.filter(a =>
      type === 'ppr' ? a.ppr_history_id === id : a.repair_log_id === id
  )
}

const showAttachments = (type, id) => {
  currentAttachments.value = getAttachments(type, id)
  attachmentsDialog.value = true
}

const loadData = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const qrCode = route.params.qrCode

    let url = '/equipment/'
    if (id) url += id
    else if (qrCode) url += `qr/${qrCode}`
    else {
      router.push('/equipment')
      return
    }

    const response = await api.get(url)
    equipment.value = response.data.equipment
    params.value = response.data.params || []
    schedule.value = response.data.schedule || []
    pprHistory.value = response.data.pprHistory || []
    repairs.value = response.data.repairs || []

    // Загружаем вложения (можно отдельным запросом)
    // Для простоты пока оставим пустым, при желании можно реализовать
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    equipment.value = null
  } finally {
    loading.value = false
  }
}

const uploadFile = async (file, pprId = null, repairId = null) => {
  if (!file) return null

  const formData = new FormData()
  formData.append('file', file)
  if (pprId) formData.append('ppr_history_id', pprId)
  if (repairId) formData.append('repair_log_id', repairId)

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

const savePpr = async () => {
  saving.value = true
  try {
    // Сначала создаём запись ППР
    const response = await api.post('/ppr/history', {
      equipment_id: equipment.value.id,
      schedule_id: null,
      performed_date: pprForm.value.performed_date,
      hours_spent: pprForm.value.hours_spent,
      notes: pprForm.value.notes
    })

    // Если есть файл, загружаем его
    if (pprForm.value.file) {
      await uploadFile(pprForm.value.file, response.data.id, null)
    }

    pprDialog.value = false
    pprForm.value = { performed_date: new Date().toISOString().split('T')[0], hours_spent: null, notes: '', file: null }
    loadData()
  } catch (error) {
    console.error('Ошибка сохранения ППР:', error)
    alert('Ошибка при сохранении ППР')
  } finally {
    saving.value = false
  }
}

const saveRepair = async () => {
  saving.value = true
  try {
    const response = await api.post('/repair', {
      equipment_id: equipment.value.id,
      failure_date: repairForm.value.failure_date,
      description: repairForm.value.description,
      repair_date: repairForm.value.repair_date,
      cost: repairForm.value.cost,
      downtime_hours: repairForm.value.downtime_hours,
      root_cause: repairForm.value.root_cause,
      notes: repairForm.value.notes
    })

    if (repairForm.value.file) {
      await uploadFile(repairForm.value.file, null, response.data.id)
    }

    repairDialog.value = false
    repairForm.value = { failure_date: new Date().toISOString().split('T')[0], description: '', repair_date: null, cost: null, downtime_hours: null, root_cause: '', notes: '', file: null }
    loadData()
  } catch (error) {
    console.error('Ошибка сохранения ремонта:', error)
    alert('Ошибка при сохранении ремонта')
  } finally {
    saving.value = false
  }
}

const openPprDialog = () => {
  pprForm.value = { performed_date: new Date().toISOString().split('T')[0], hours_spent: null, notes: '', file: null }
  pprDialog.value = true
}

const openRepairDialog = () => {
  repairForm.value = { failure_date: new Date().toISOString().split('T')[0], description: '', repair_date: null, cost: null, downtime_hours: null, root_cause: '', notes: '', file: null }
  repairDialog.value = true
}
const downloadQr = async () => {
  try {
    const response = await api.get(`/equipment/${equipment.value.id}/qrcode`, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `qr-${equipment.value.qr_code}.png`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка загрузки QR:', error)
    alert('Не удалось сгенерировать QR-код')
  }
}
const printQr = () => {
  // Просто выводим QR-код в консоль, можно реализовать печать этикетки
  alert(`QR-код: ${equipment.value.qr_code}\nСсылка: ${window.location.origin}/equipment/qr/${equipment.value.qr_code}`)
}

onMounted(() => {
  loadData()
})
</script>