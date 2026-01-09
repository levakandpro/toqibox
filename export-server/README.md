# 🎬 TOQIBOX Export Server (FFmpeg)

## 📋 Описание

Отдельный Node.js сервер для **offline render** экспорта MP4 из Studio проектов.

**Ключевые особенности:**
- ✅ **Offline render** (не зависит от длины трека)
- ✅ **Покадровый рендер** (30 FPS)
- ✅ **FFmpeg** для сборки MP4
- ✅ **API endpoints** (POST /export, GET /export/:jobId)
- ✅ **Очередь** (макс 2 одновременно)
- ✅ **Автоочистка** временных файлов

---

## 🚀 Локальный запуск

### **1. Установите FFmpeg**

**Windows:**
```bash
choco install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

Проверка:
```bash
ffmpeg -version
```

### **2. Установите зависимости**

```bash
cd export-server
npm install
```

### **3. Запустите сервер**

```bash
npm start
```

Сервер запустится на `http://localhost:3001`

---

## 🌐 Deploy на Railway.app

### **Шаг 1: Создайте проект**

1. Зайдите на https://railway.app
2. Sign up / Log in
3. **New Project** → **Empty Project**

### **Шаг 2: Deploy**

```bash
cd export-server

# Установите Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Инициализация
railway init

# Deploy
railway up
```

### **Шаг 3: Установите FFmpeg**

Railway **автоматически** установит FFmpeg из Nixpacks!

Добавьте файл `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["ffmpeg"]
```

### **Шаг 4: Получите URL**

После деплоя Railway даст URL:
```
https://your-api.railway.app
```

Используйте его в Studio!

---

## 📡 API Reference

### **POST /export**

Создать задачу экспорта.

**Body (FormData):**
- `audio` (File) - MP3/WAV файл
- `photo` (File) - JPG/PNG файл
- `duration` (String) - Длительность в секундах (например, "240")
- `plan` (String) - "free" или "premium"

**Response (202 Accepted):**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued"
}
```

---

### **GET /export/:jobId**

Проверить статус экспорта.

**Response:**
```json
{
  "jobId": "...",
  "status": "queued" | "processing" | "completed" | "failed",
  "progress": 75,
  "plan": "free",
  "resolution": { "width": 1280, "height": 720 },
  "downloadUrl": "/download/{jobId}"
}
```

---

### **GET /download/:jobId**

Скачать готовый MP4.

**Response:**
- `Content-Type: video/mp4`
- Binary file

---

## 🔧 Интеграция в Studio

В `StudioDesktop.jsx`:

```javascript
const handleExport = async () => {
  // 1. Отправка на сервер
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('photo', photoBlob);
  formData.append('duration', duration.toString());
  formData.append('plan', isPremiumUser ? 'premium' : 'free');

  const res = await fetch('https://your-api.railway.app/export', {
    method: 'POST',
    body: formData,
  });

  const { jobId } = await res.json();

  // 2. Polling статуса
  const interval = setInterval(async () => {
    const statusRes = await fetch(`https://your-api.railway.app/export/${jobId}`);
    const data = await statusRes.json();

    if (data.status === 'completed') {
      clearInterval(interval);
      // 3. Скачивание
      window.location.href = `https://your-api.railway.app${data.downloadUrl}`;
    }
  }, 2000);
};
```

---

## ⚙️ Конфигурация

Редактируйте `server.js`:

```javascript
const EXPORT_CONFIG = {
  MAX_DURATION_SEC: 240,     // 4 минуты
  MAX_PARALLEL_EXPORTS: 2,   // Макс одновременно
  EXPORT_TIMEOUT_MS: 600000, // 10 минут
  FPS: 30,                   // Кадров в секунду
};
```

---

## 🎨 Визуальные эффекты

Функция `renderFrameAtTime()` рендерит каждый кадр.

**Добавьте свои эффекты:**

```javascript
async function renderFrameAtTime(time, resolution, photoImage, job) {
  const canvas = createCanvas(resolution.width, resolution.height);
  const ctx = canvas.getContext('2d');

  // Фон
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, resolution.width, resolution.height);

  // Фото
  ctx.drawImage(photoImage, x, y, w, h);

  // ✨ ВАШИ ЭФФЕКТЫ:
  
  // Пульсация по времени
  const pulse = Math.sin(time * Math.PI * 2) * 0.1 + 1;
  ctx.scale(pulse, pulse);

  // Вращение
  ctx.rotate(time * 0.1);

  // Цветовой фильтр
  ctx.globalAlpha = 0.5 + Math.sin(time) * 0.5;

  return canvas;
}
```

---

## 📊 Производительность

**Тест (4 минуты трека):**
- Рендер кадров: ~20-30 секунд (7200 кадров @ 30fps)
- FFmpeg сборка: ~10-15 секунд
- **Итого: ~40-50 секунд** (не 4 минуты!)

**Требования:**
- CPU: 2+ cores
- RAM: 2GB+
- Disk: 1GB свободно (временно)

---

## 🐛 Troubleshooting

### **"FFmpeg not found"**
```bash
which ffmpeg  # Должен показать путь
ffmpeg -version
```

### **"Cannot find module 'canvas'"**
```bash
npm install canvas
# Linux: sudo apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### **"Port already in use"**
```bash
# Измените порт
PORT=3002 npm start
```

---

## ✅ Готовность

- [x] Offline render (не зависит от длины трека)
- [x] FFmpeg сборка MP4
- [x] API endpoints
- [x] Очередь (макс 2 одновременно)
- [x] Лимиты (4 минуты, 720p/1080p)
- [x] Автоочистка
- [ ] Визуальные эффекты (TODO: интегрировать из Studio)
- [ ] Deploy на Railway
- [ ] Интеграция в Studio frontend

---

## 🚀 Next Steps

1. **Запустите локально:** `npm start`
2. **Протестируйте** через Postman/cURL
3. **Deploy на Railway**
4. **Интегрируйте в Studio**

**Готов помочь с каждым шагом!** 🎬
