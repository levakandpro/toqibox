/**
 * Retry механизм для запросов с exponential backoff
 * Используется для надежной загрузки данных
 */

/**
 * Выполняет функцию с повторными попытками при ошибках
 * @param {Function} fn - Асинхронная функция для выполнения
 * @param {Object} options - Опции
 * @param {number} options.maxRetries - Максимальное количество попыток (по умолчанию 3)
 * @param {number} options.initialDelay - Начальная задержка в мс (по умолчанию 300)
 * @param {number} options.maxDelay - Максимальная задержка в мс (по умолчанию 3000)
 * @param {Function} options.shouldRetry - Функция для определения, нужно ли повторять (по умолчанию всегда true)
 * @returns {Promise} Результат выполнения функции
 */
export async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 300,
    maxDelay = 3000,
    shouldRetry = () => true,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Если это последняя попытка или не нужно повторять, выбрасываем ошибку
      if (attempt === maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      // Вычисляем задержку с exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      
      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Проверяет, является ли ошибка сетевой (можно повторить)
 */
export function isRetryableError(error) {
  if (!error) return false;
  
  // Сетевые ошибки
  if (error.message?.includes('network') || 
      error.message?.includes('timeout') ||
      error.message?.includes('fetch')) {
    return true;
  }
  
  // Supabase ошибки, которые можно повторить
  if (error.code === 'PGRST116' || // Connection error
      error.code === 'PGRST301' || // Timeout
      error.status === 0 || // Network error
      error.status >= 500) { // Server errors
    return true;
  }
  
  return false;
}
