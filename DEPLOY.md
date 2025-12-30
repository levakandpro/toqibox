# Инструкция по деплою TOQIBOX

## Переменные окружения

Для работы приложения нужны следующие переменные окружения:

- `VITE_SUPABASE_URL` - URL вашего Supabase проекта
- `VITE_SUPABASE_ANON_KEY` - Anon ключ Supabase

## Деплой на Vercel

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в Vercel:
```bash
vercel login
```

3. Добавьте переменные окружения в Vercel Dashboard:
   - Settings → Environment Variables
   - Добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`

4. Деплой:
```bash
vercel --prod
```

Или через GitHub:
- Подключите репозиторий к Vercel
- Vercel автоматически определит настройки из `vercel.json`
- Добавьте переменные окружения в настройках проекта

## Деплой на Netlify

1. Создайте файл `netlify.toml` в корне проекта:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Добавьте переменные окружения в Netlify Dashboard:
   - Site settings → Environment variables
   - Добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`

3. Деплой через Netlify CLI:
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

## Проверка после деплоя

1. Проверьте, что главная страница открывается
2. Проверьте авторизацию через Google
3. Проверьте создание страницы артиста
4. Проверьте редактирование на странице артиста

## Настройка Supabase

Убедитесь, что в настройках Supabase добавлены правильные URL для редиректов:
- Authentication → URL Configuration
- Site URL: ваш домен (например, https://toqibox.vercel.app)
- Redirect URLs: добавьте `https://ваш-домен/auth/callback`

