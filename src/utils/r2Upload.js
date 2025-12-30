/**
 * Утилита для загрузки файлов в Cloudflare R2 через presigned URLs
 * 
 * Использует Pages Function /api/r2/presign для безопасной загрузки
 * Секреты хранятся только на сервере, не передаются на фронт
 */

// Для локальной разработки используем полный URL, для продакшена - относительный
const R2_API_ENDPOINT = import.meta.env.DEV 
  ? `${window.location.origin}/api/r2`
  : '/api/r2';
const R2_PUBLIC_BASE = 'https://cdn.toqibox.win';

/**
 * Загружает обложку в R2 через presigned URL
 * @param {Object} params - Параметры загрузки
 * @param {string} params.type - Тип: "artist_cover" | "artist_avatar" | "track_cover"
 * @param {string} params.id - ID артиста или трека
 * @param {File} params.file - Файл изображения
 * @returns {Promise<{key: string, publicUrl: string}>}
 */
export async function uploadCover({ type, id, file }) {
  if (!file) {
    throw new Error('Файл не указан');
  }

  if (!type || !id) {
    throw new Error('Тип и ID обязательны');
  }

  // Проверяем тип файла
  const validMimes = ['image/jpeg', 'image/png'];
  if (!validMimes.includes(file.type)) {
    throw new Error('Поддерживаются только JPEG и PNG изображения');
  }

  try {
    console.log('📡 Запрос presigned URL...', { endpoint: `${R2_API_ENDPOINT}/presign`, type, id, mime: file.type });
    
    // Запрашиваем presigned URL
    const presignResponse = await fetch(`${R2_API_ENDPOINT}/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        id,
        mime: file.type,
      }),
    });

    console.log('📡 Ответ presign:', { status: presignResponse.status, ok: presignResponse.ok });

    if (!presignResponse.ok) {
      const errorText = await presignResponse.text();
      console.error('❌ Ошибка presign response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${presignResponse.status}` };
      }
      throw new Error(errorData.error || `Ошибка получения presigned URL (${presignResponse.status})`);
    }

    const presignData = await presignResponse.json();
    console.log('✅ Presigned URL получен:', { key: presignData.key, hasUploadUrl: !!presignData.uploadUrl });
    
    const { uploadUrl, key, publicUrl } = presignData;

    if (!uploadUrl) {
      throw new Error('Presigned URL не получен от сервера');
    }

    // Загружаем файл напрямую в R2 через presigned URL
    console.log('📤 Загрузка файла в R2...', { uploadUrl: uploadUrl.substring(0, 100) + '...', fileSize: file.size });
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    console.log('📤 Ответ загрузки:', { status: uploadResponse.status, ok: uploadResponse.ok });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => '');
      console.error('❌ Ошибка загрузки в R2:', { status: uploadResponse.status, errorText });
      throw new Error(`Ошибка загрузки файла в R2 (${uploadResponse.status}): ${errorText || 'Неизвестная ошибка'}`);
    }

    console.log('✅ Файл успешно загружен в R2');

    return {
      key,
      publicUrl,
    };
  } catch (error) {
    console.error('❌ Полная ошибка загрузки обложки:', error);
    throw error;
  }
}

/**
 * Удаляет файл из R2
 * Примечание: R2 автоматически перезаписывает файл при загрузке с тем же key,
 * поэтому явное удаление не требуется. Функция оставлена для обратной совместимости.
 * @param {string} key - Ключ файла в R2
 * @returns {Promise<void>}
 */
export async function deleteFromR2(key) {
  if (!key) {
    return; // Нет ключа - нечего удалять
  }
  
  // При использовании presigned URL с фиксированными ключами
  // файлы автоматически перезаписываются при новой загрузке
  // Явное удаление не требуется
  console.log('Delete from R2 not implemented - files are overwritten on upload');
}

/**
 * Получает публичный URL для доступа к файлу в R2 через CDN
 * @param {string} key - Ключ файла в R2
 * @returns {string}
 */
export function getR2Url(key) {
  if (!key) return null;
  
  // Используем CDN URL
  return `${R2_PUBLIC_BASE}/${key}`;
}

