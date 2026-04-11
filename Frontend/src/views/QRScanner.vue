<template>
  <v-app>
    <app-bar title="QR-сканер" />

    <v-main class="d-flex align-center justify-center">
      <v-card width="500" class="pa-4">
        <v-card-title class="text-center">Сканируйте QR-код оборудования</v-card-title>

        <div id="qr-reader" class="qr-reader"></div>

        <v-alert v-if="error" type="error" class="mt-4">
          {{ error }}
        </v-alert>

        <v-btn block color="primary" class="mt-4" @click="startScanner" :disabled="scanning">
          Запустить камеру
        </v-btn>

        <v-btn block variant="outlined" class="mt-2" @click="stopScanner" :disabled="!scanning">
          Остановить
        </v-btn>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import AppBar from '../components/AppBar.vue'

const router = useRouter()
const scanner = ref(null)
const scanning = ref(false)
const error = ref('')

const startScanner = () => {
  error.value = ''
  scanner.value = new Html5Qrcode('qr-reader')

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  }

  scanner.value.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        // Успешно отсканировано
        const qrCode = decodedText
        stopScanner()
        router.push(`/equipment/qr/${qrCode}`)
      },
      (err) => {
        // Ошибка сканирования (игнорируем, это обычные неудачные кадры)
        console.log('Scan error:', err)
      }
  ).then(() => {
    scanning.value = true
  }).catch((err) => {
    error.value = 'Не удалось получить доступ к камере: ' + err.message
  })
}

const stopScanner = () => {
  if (scanner.value && scanning.value) {
    scanner.value.stop().then(() => {
      scanning.value = false
    }).catch((err) => {
      console.error('Stop error:', err)
    })
  }
}

onUnmounted(() => {
  stopScanner()
})
</script>

<style scoped>
.qr-reader {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
</style>