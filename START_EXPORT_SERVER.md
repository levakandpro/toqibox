# 🚀 **ЗАПУСК Export Server (ПРОСТОЙ СПОСОБ)**

## ⚠️ **У вас ошибка "Failed to fetch"?**

**Причина:** Export Server не запущен!

---

## ✅ **ЗАПУСК ЗА 1 КОМАНДУ (Windows):**

### **Способ 1: Через .bat файл**

**Шаг 1:** Откройте **новый PowerShell/CMD** (не закрывая Studio!)

**Шаг 2:** Запустите:

```bash
cd D:\toqibox\export-server
start.bat
```

**Готово!** Export Server запустится автоматически! ✅

---

### **Способ 2: Вручную**

**Шаг 1:** Откройте **новый PowerShell/CMD**

```bash
cd D:\toqibox\export-server
```

**Шаг 2:** Установите зависимости (первый раз):

```bash
npm install
```

**Шаг 3:** Проверьте FFmpeg:

```bash
ffmpeg -version
```

**Если ошибка:** установите FFmpeg:
```bash
choco install ffmpeg
```

**Шаг 4:** Запустите сервер:

```bash
npm start
```

**Должно появиться:**
```
╔════════════════════════════════════════╗
║   TOQIBOX Export Server (FFmpeg)       ║
║   http://localhost:3001                ║
╚════════════════════════════════════════╝

Endpoints:
  POST   /export          - Создать экспорт
  GET    /export/:jobId   - Статус экспорта
  GET    /download/:jobId - Скачать MP4
```

**Если появилось - РАБОТАЕТ!** ✅

---

## 🧪 **ПРОВЕРКА что Export Server работает:**

**Способ 1:** Откройте в браузере:
```
http://localhost:3001/export/test
```

Должно показать:
```json
{"error":"Экспорт не найден"}
```

**Это НОРМАЛЬНО!** Значит сервер работает ✅

---

**Способ 2:** Запустите тест-скрипт:

```bash
cd D:\toqibox\export-server
node test-connection.js
```

Должно появиться:
```
✅ Export Server работает! Статус: 404

╔════════════════════════════════════════╗
║   Export Server ДОСТУПЕН!              ║
║   Можно пробовать экспорт в Studio     ║
╚════════════════════════════════════════╝
```

---

## 🎬 **ИТОГОВАЯ СХЕМА:**

```
┌─────────────────────────────────────────┐
│  ТЕРМИНАЛ 1: Studio                     │
│  cd D:\toqibox                          │
│  npm run dev                            │
│  → http://localhost:5173                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ТЕРМИНАЛ 2: Export Server              │
│  cd D:\toqibox\export-server            │
│  start.bat  (или npm start)             │
│  → http://localhost:3001                │
└─────────────────────────────────────────┘
```

**ОБА терминала должны быть ОТКРЫТЫ!**

---

## 🐛 **Troubleshooting:**

### **"npm: command not found"**
Node.js не установлен. Скачайте: https://nodejs.org

### **"ffmpeg: command not found"**
FFmpeg не установлен:
```bash
choco install ffmpeg
```

### **"Cannot find module 'express'"**
Зависимости не установлены:
```bash
cd export-server
npm install
```

### **"Port 3001 already in use"**
Порт занят. Проверьте:
```bash
netstat -ano | findstr :3001
```

Убейте процесс или измените порт в `server.js`:
```javascript
const PORT = 3002; // вместо 3001
```

### **"ECONNREFUSED" в Studio**
Export Server не запущен! Вернитесь к шагам выше.

---

## ✅ **Финальная проверка:**

**1. Export Server запущен?**
```bash
cd export-server
npm start
```
✅ Должен показать "TOQIBOX Export Server"

**2. Studio запущен?**
```bash
npm run dev
```
✅ Должен открыться http://localhost:5173

**3. Можно ли подключиться?**
Откройте: http://localhost:3001/export/test
✅ Должен вернуть JSON с ошибкой (это нормально!)

**Если все 3 пункта ✅ - ПОПРОБУЙТЕ ЭКСПОРТ!** 🎉

---

## 📞 **Все еще не работает?**

Пришлите скриншот **обоих терминалов**:
- Терминал 1 (Studio) - `npm run dev`
- Терминал 2 (Export Server) - `npm start`

И покажите что выдает:
```bash
node export-server/test-connection.js
```

**Помогу разобраться!** 🚀
