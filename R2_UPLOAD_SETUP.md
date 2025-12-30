# Настройка безопасной загрузки обложек в Cloudflare R2

## Обзор

Реализована безопасная загрузка обложек в Cloudflare R2 через presigned URLs. Секреты хранятся только на сервере (в Cloudflare Pages Functions), не передаются на фронт.

## Структура

### Pages Function: `functions/api/r2/presign.js`

Endpoint: `POST /api/r2/presign`

**Входные параметры:**
```json
{
  "type": "artist_cover" | "artist_avatar" | "track_cover",
  "id": "string (UUID артиста или трека)",
  "mime": "image/jpeg" | "image/png"
}
```

**Выходные данные:**
```json
{
  "uploadUrl": "https://... (presigned PUT URL)",
  "key": "artists/{id}/cover.jpg",
  "publicUrl": "https://cdn.toqibox.win/artists/{id}/cover.jpg"
}
```

**Фиксированные ключи:**
- `artist_cover` → `artists/{id}/cover.{jpg|png}`
- `artist_avatar` → `artists/{id}/avatar.{jpg|png}`
- `track_cover` → `tracks/{id}/cover.{jpg|png}`

### Утилита: `src/utils/r2Upload.js`

**Функция `uploadCover({ type, id, file })`:**
1. Проверяет тип файла (jpeg/png)
2. Запрашивает presigned URL через `/api/r2/presign`
3. Загружает файл напрямую в R2 через PUT запрос
4. Возвращает `{ key, publicUrl }`

**Функция `getR2Url(key)`:**
- Строит публичный CDN URL: `https://cdn.toqibox.win/{key}`

## Переменные окружения (Cloudflare Pages)

Убедитесь, что в настройках Pages установлены:

- `R2_ACCOUNT_ID` - ID аккаунта Cloudflare
- `R2_BUCKET` - Имя bucket (например, `toqibox-covers`)
- `R2_ACCESS_KEY_ID` - Access Key ID (secret)
- `R2_SECRET_ACCESS_KEY` - Secret Access Key (secret)
- `R2_PUBLIC_BASE` - Публичный CDN URL (например, `https://cdn.toqibox.win`)

## Использование

### Загрузка обложки трека

```javascript
import { uploadCover } from '../utils/r2Upload.js';

const result = await uploadCover({
  type: 'track_cover',
  id: track.id,
  file: selectedFile
});

// result.key - сохранить в Supabase (cover_key)
// result.publicUrl - использовать для отображения
```

### Отображение обложки

```javascript
import { getR2Url } from '../utils/r2Upload.js';

const coverUrl = track.cover_key 
  ? getR2Url(track.cover_key) 
  : defaultCoverUrl;
```

## Интеграция

### TrackCard.jsx
- Использует `uploadCover` при редактировании обложки трека
- Сохраняет `key` в Supabase (`cover_key`)

### ArtistHeader.jsx (будущее)
- Можно добавить загрузку `artist_cover` и `artist_avatar`

## Важные моменты

1. **Фиксированные ключи**: При повторной загрузке для того же `id` файл автоматически перезаписывается (тот же key)
2. **Безопасность**: Секреты R2 никогда не передаются на фронт
3. **CDN**: Все файлы доступны через `https://cdn.toqibox.win/{key}`
4. **Валидация**: Только JPEG и PNG, только разрешенные типы (`artist_cover`, `artist_avatar`, `track_cover`)

## Проверка

После деплоя проверьте:

1. Presigned URL генерируется: `POST /api/r2/presign`
2. Файл загружается в R2 через presigned URL
3. Файл доступен через CDN: `https://cdn.toqibox.win/tracks/{id}/cover.jpg`
4. При повторной загрузке файл перезаписывается (тот же URL)

