# Инструкция по деплою TOQIBOX

## Деплой через Cloudflare Pages

Проект настроен на автоматический деплой через Cloudflare Pages при push в репозиторий GitHub.

### Настройка переменных окружения

В Cloudflare Pages Dashboard:
1. Откройте проект `toqibox`
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте следующие переменные:
   - `VITE_SUPABASE_URL` - URL вашего Supabase проекта
   - `VITE_SUPABASE_ANON_KEY` - Anon ключ Supabase

### Процесс деплоя

1. **Push изменений в GitHub:**
   ```bash
   git add .
   git commit -m "Описание изменений"
   git push
   ```

2. **Автоматический деплой:**
   - Cloudflare Pages автоматически обнаружит новый коммит
   - Начнется процесс сборки (`npm run build`)
   - После успешной сборки сайт будет задеплоен

3. **Проверка статуса:**
   - Откройте [Cloudflare Pages Dashboard](https://dash.cloudflare.com)
   - Перейдите в раздел **Deployments**
   - Проверьте статус последнего деплоя

### Проверка после деплоя

1. Проверьте, что главная страница открывается
2. Проверьте авторизацию через Google
3. Проверьте создание страницы артиста
4. Проверьте редактирование на странице артиста

### Настройка Supabase

Убедитесь, что в настройках Supabase добавлены правильные URL для редиректов:
- Authentication → URL Configuration
- Site URL: ваш домен (например, `https://toqibox.pages.dev` или `https://toqibox.win`)
- Redirect URLs: добавьте `https://ваш-домен/auth/callback`

### Ручной перезапуск деплоя

Если нужно принудительно перезапустить деплой:
- В Cloudflare Pages Dashboard найдите нужный деплой
- Нажмите на кнопку с тремя точками (⋯)
- Выберите **Retry deployment**
