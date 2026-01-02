# Как получить ваш User ID для добавления в админы

## Способ 1: Через консоль браузера (самый простой)

1. **Войдите в приложение** (через Google или почту)
2. **Откройте консоль браузера:**
   - Нажмите `F12` или `Ctrl+Shift+I` (Windows/Linux)
   - Или `Cmd+Option+I` (Mac)
3. **Перейдите на вкладку "Console"**
4. **Выполните команду:**
   ```javascript
   (await supabase.auth.getSession()).data.session.user.id
   ```
5. **Скопируйте полученный UUID** (формат: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Способ 2: Через localStorage

1. Откройте консоль браузера (F12)
2. Выполните:
   ```javascript
   JSON.parse(localStorage.getItem('sb-' + location.hostname.split('.')[0] + '-auth-token'))?.user?.id
   ```
   Или просто:
   ```javascript
   Object.keys(localStorage).filter(k => k.includes('auth')).forEach(k => console.log(k, localStorage.getItem(k)))
   ```

## Способ 3: Через Supabase Dashboard

1. Откройте **Supabase Dashboard** → **Authentication** → **Users**
2. Найдите вашего пользователя по email
3. Скопируйте **User UID** (это и есть ваш user_id)

## Пример правильного UUID:

```
12345678-1234-1234-1234-123456789abc
```

**Важно:** UUID должен быть в формате с дефисами, в кавычках в SQL запросе.

## Пример правильного INSERT:

```sql
INSERT INTO public.admins (user_id, email, is_active)
VALUES (
  '12345678-1234-1234-1234-123456789abc',  -- Ваш реальный UUID
  'your-email@gmail.com',  -- Ваш email
  true
);
```

