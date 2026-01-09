/**
 * Утилита для загрузки файлов в Cloudflare R2 через presigned URLs
 * 
 * Использует Pages Function /api/r2/presign для безопасной загрузки
 * Секреты хранятся только на сервере, не передаются на фронт
 */

// Используем относительный путь - Cloudflare Pages Functions работают на том же домене
const R2_API_ENDPOINT = '/api/r2';
const R2_PUBLIC_BASE = 'https://cdn.toqibox.win';

// Проверка конфигурации
if (import.meta.env.DEV) {
  console.log('🔧 R2 Upload Config:', {
    endpoint: R2_API_ENDPOINT,
    publicBase: R2_PUBLIC_BASE,
    isDev: import.meta.env.DEV,
  });
}

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

  if (!type) {
    throw new Error('Тип обязателен');
  }

  // ID не требуется для studio_photo
  if (type !== "studio_photo" && !id) {
    throw new Error('ID обязателен для данного типа');
  }

  // Проверяем тип файла
  const validMimes = ['image/jpeg', 'image/png'];
  if (!validMimes.includes(file.type)) {
    throw new Error('Поддерживаются только JPEG и PNG изображения');
  }

  try {
    const endpoint = `${R2_API_ENDPOINT}/presign`;
    console.log('📡 Запрос presigned URL...', { endpoint, type, id, mime: file.type });
    
    // Запрашиваем presigned URL
    let presignResponse;
    try {
      presignResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id: type === "studio_photo" ? "" : id,
          mime: file.type,
        }),
      });
    } catch (fetchError) {
      console.error('❌ Ошибка сети при запросе presigned URL:', fetchError);
      // Проверяем, не является ли это CORS ошибкой
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS')) {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что функция /api/r2/presign развернута и доступна.');
      }
      throw new Error(`Ошибка сети: ${fetchError.message}`);
    }

    console.log('📡 Ответ presign:', { status: presignResponse.status, ok: presignResponse.ok });

    if (!presignResponse.ok) {
      const errorText = await presignResponse.text().catch(() => 'Не удалось прочитать ответ');
      console.error('❌ Ошибка presign response:', { status: presignResponse.status, errorText });
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${presignResponse.status}` };
      }
      
      // Более понятные сообщения об ошибках
      if (presignResponse.status === 500 && errorData.error?.includes('R2 configuration')) {
        throw new Error('Сервер не настроен для загрузки файлов. Обратитесь к администратору.');
      }
      if (presignResponse.status === 404) {
        throw new Error('Функция загрузки не найдена. Проверьте настройки деплоя.');
      }
      
      throw new Error(errorData.error || `Ошибка получения presigned URL (${presignResponse.status})`);
    }

    const presignData = await presignResponse.json();
    console.log('✅ Presigned URL получен:', { key: presignData.key, hasUploadUrl: !!presignData.uploadUrl });
    
    const { uploadUrl, key, publicUrl } = presignData;

    if (!uploadUrl) {
      throw new Error('Presigned URL не получен от сервера');
    }

    // В локальной разработке пропускаем загрузку в R2 из-за CORS
    // Просто возвращаем key, файл будет виден только локально через превью
    if (import.meta.env.DEV) {
      console.log('⚠️ Локальная разработка: пропускаем загрузку в R2 (CORS), возвращаем key');
      console.log('📝 В продакшене файл будет загружен в R2 автоматически');
      return {
        key,
        publicUrl,
      };
    }

    // Загружаем файл через прокси-функцию (обходит CORS проблемы с R2)
    console.log('📤 Загрузка файла в R2 через прокси...', { fileSize: file.size });
    
    try {
      // Используем прокси-функцию для загрузки, чтобы обойти CORS
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadUrl', uploadUrl);
      formData.append('contentType', file.type);

      const uploadResponse = await fetch(`${R2_API_ENDPOINT}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📤 Ответ загрузки:', { status: uploadResponse.status, ok: uploadResponse.ok });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => '');
        console.error('❌ Ошибка загрузки в R2:', { status: uploadResponse.status, errorText });
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${uploadResponse.status}` };
        }
        throw new Error(errorData.error || `Ошибка загрузки файла в R2 (${uploadResponse.status})`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ Файл успешно загружен в R2:', uploadResult);
    } catch (fetchError) {
      console.error('❌ Ошибка при загрузке файла:', fetchError);
      // Если ошибка сети, пробуем прямую загрузку как fallback
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS')) {
        console.warn('⚠️ Пробуем прямую загрузку как fallback...');
        try {
          const directUploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          });
          
          if (!directUploadResponse.ok) {
            throw new Error(`Прямая загрузка также не удалась: ${directUploadResponse.status}`);
          }
          console.log('✅ Файл загружен напрямую (fallback)');
        } catch (directError) {
          throw new Error(`Не удалось загрузить файл. Проверьте настройки CORS на R2 bucket или используйте прокси-функцию.`);
        }
      } else {
        throw fetchError;
      }
    }

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

