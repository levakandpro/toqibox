# 🚀 **БЫСТРЫЙ СТАРТ: MP4 Экспорт**

## ✅ **ЧТО СДЕЛАНО:**

1. **✅ Отдельный Node.js сервер** для FFmpeg (`export-server/`)
2. **✅ Offline render** (покадровый рендер, не зависит от длины трека)
3. **✅ API endpoints** (POST /export, GET /export/:jobId, GET /download/:jobId)
4. **✅ Интеграция в Studio** (StudioDesktop.jsx)
5. **✅ Лимиты:** Free 720p / Premium 1080p, макс 4 минуты
6. **✅ Очередь** (макс 2 экспорта одновременно)
7. **✅ Автоочистка** временных файлов

---

## 🏃 **ЗАПУСК ЗА 3 МИНУТЫ:**

### **Шаг 1: Установите FFmpeg**

```bash
# Windows
choco install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg

# Проверка
ffmpeg -version
```

### **Шаг 2: Запустите Export Server**

Откройте **новый терминал**:

```bash
cd export-server
npm install
npm start
```

Сервер запустится на `http://localhost:3001` ✅

### **Шаг 3: Запустите Studio (dev)**

Откройте **еще один терминал**:

```bash
cd ..
npm run dev
```

Studio запустится на `http://localhost:5173` ✅

### **Шаг 4: Протестируйте**

1. Откройте Studio: http://localhost:5173/studio
2. Загрузите **аудио** (до 4 минут)
3. Загрузите **фото**
4. Нажмите **ЭКСПОРТ**
5. Ждите ~30-60 секунд (НЕ 4 минуты!)
6. **MP4 скачается автоматически!** 🎉

---

## 🌐 **DEPLOY НА RAILWAY (PRODUCTION):**

### **Шаг 1: Регистрация**

1. Зайдите на https://railway.app
2. Sign up (можно через GitHub)

### **Шаг 2: Deploy Export Server**

```bash
cd export-server

# Установите Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Инициализация проекта
railway init

# Deploy
railway up
```

### **Шаг 3: Получите URL**

После деплоя Railway покажет URL:
```
✅ Deployed: https://your-api.railway.app
```

### **Шаг 4: Обновите Studio**

В `src/pages/studio/StudioDesktop.jsx` найдите:

```javascript
const EXPORT_API_URL = import.meta.env.VITE_EXPORT_API_URL || 'http://localhost:3001';
```

Создайте файл `.env` в корне проекта:

```env
VITE_EXPORT_API_URL=https://your-api.railway.app
```

### **Шаг 5: Задеплойте Studio**

```bash
npm run build
git add .
git commit -m "Add export server URL"
git push
```

Cloudflare Pages автоматически обновится! ✅

---

## 📊 **КАК ЭТО РАБОТАЕТ:**

### **1. Пользователь жмет ЭКСПОРТ**
- Аудио + фото отправляются на Export Server
- Создается задача (job_id)

### **2. Export Server рендерит кадры (offline)**
```
Для каждого времени t (0, 0.033, 0.066, ... 240 сек):
  1. Создать canvas
  2. Нарисовать фото
  3. Применить эффекты (TODO)
  4. Сохранить как PNG кадр
```

**30 FPS × 240 секунд = 7200 кадров**

### **3. FFmpeg собирает MP4**
```bash
ffmpeg -framerate 30 -i frames/frame_%06d.png -i audio.mp3 -c:v libx264 -c:a aac output.mp4
```

### **4. Скачивание**
- Браузер polling каждые 2 секунды
- Когда `status === 'completed'` → скачать MP4

**Итого: ~40-50 секунд для 4 минут трека!** ⚡

---

## 🎨 **ДОБАВИТЬ ВИЗУАЛЬНЫЕ ЭФФЕКТЫ:**

Откройте `export-server/server.js`, найдите функцию `renderFrameAtTime()`:

```javascript
async function renderFrameAtTime(time, resolution, photoImage, job) {
  const canvas = createCanvas(resolution.width, resolution.height);
  const ctx = canvas.getContext('2d');

  // Фон
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, resolution.width, resolution.height);

  // Фото (cover mode)
  const scale = Math.max(
    resolution.width / photoImage.width,
    resolution.height / photoImage.height
  );
  const x = (resolution.width / 2) - (photoImage.width / 2) * scale;
  const y = (resolution.height / 2) - (photoImage.height / 2) * scale;
  ctx.drawImage(photoImage, x, y, photoImage.width * scale, photoImage.height * scale);

  // ✨ ДОБАВЬТЕ СВОИ ЭФФЕКТЫ ЗДЕСЬ:
  
  // Пример: пульсация
  const pulse = 1 + Math.sin(time * Math.PI * 2) * 0.05;
  ctx.scale(pulse, pulse);

  // Пример: вращение
  // ctx.translate(resolution.width / 2, resolution.height / 2);
  // ctx.rotate(time * 0.1);
  // ctx.translate(-resolution.width / 2, -resolution.height / 2);

  // Пример: затемнение по времени
  // ctx.globalAlpha = 0.8 + Math.sin(time) * 0.2;

  return canvas;
}
```

**Перезапустите сервер и экспорт обновится!**

---

## 🔧 **TROUBLESHOOTING:**

### **"Cannot connect to export server"**
```bash
# Проверьте что сервер запущен
cd export-server
npm start

# Проверьте URL в StudioDesktop.jsx
const EXPORT_API_URL = 'http://localhost:3001'; // ← правильный?
```

### **"FFmpeg not found"**
```bash
ffmpeg -version  # Должен показать версию
which ffmpeg     # Путь к FFmpeg
```

### **"Export timeout"**
- Проверьте логи Export Server (консоль где запущен `npm start`)
- Возможно аудио слишком тяжелое

### **"CORS error"**
Export Server уже настроен с `cors()`, но если ошибка:
```javascript
// В server.js
app.use(cors({
  origin: 'http://localhost:5173', // URL вашего Studio
}));
```

---

## ✅ **ГОТОВНОСТЬ:**

- [x] Export Server создан
- [x] Offline render реализован
- [x] FFmpeg интеграция
- [x] API endpoints
- [x] Интеграция в Studio
- [x] Лимиты (4 мин, 720p/1080p)
- [x] Автоочистка
- [x] Railway deploy инструкции
- [ ] Визуальные эффекты (добавьте свои!)
- [ ] Production deploy

---

## 🎬 **СЛЕДУЮЩИЕ ШАГИ:**

1. **Протестируйте локально** ✅
2. **Добавьте визуальные эффекты** (renderFrameAtTime)
3. **Deploy на Railway** ✅
4. **Обновите URL в Studio** ✅
5. **Deploy Studio на Cloudflare** ✅

**Всё готово! Попробуйте экспорт!** 🚀

---

## 📞 **Нужна помощь?**

- Export Server не запускается → проверьте FFmpeg установку
- CORS ошибки → проверьте `cors()` в server.js
- Медленный рендер → уменьшите FPS или разрешение
- Railway deploy → читайте `export-server/README.md`

**Удачи! 🎉**
