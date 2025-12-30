# Настройка Redirect URLs в Supabase

## Текущие настройки (уже есть):
✅ `https://toqibox.win/*` - покрывает все страницы
✅ `http://localhost:5174/*` - для локальной разработки

## Рекомендуется добавить:
Добавьте в Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:

```
https://811182a5.toqibox.pages.dev/auth/callback
```

Или можно использовать wildcard:
```
https://*.toqibox.pages.dev/*
```

Это нужно на случай, если Cloudflare Pages использует свой домен для деплоя.

## Site URL (уже настроено):
✅ `https://toqibox.win`

## Проверка:
После настройки проверьте:
1. Вход через Google на https://toqibox.win
2. Редирект после логина работает
3. Создание страницы артиста работает

