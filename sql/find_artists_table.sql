-- Поиск таблицы с данными артистов
-- Выполните этот запрос, чтобы найти правильное имя таблицы

-- Вариант 1: Поиск по ключевым словам
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%artist%' 
   OR table_name LIKE '%author%'
   OR table_name LIKE '%profile%'
   OR table_name LIKE '%user%'
ORDER BY table_schema, table_name;

-- Вариант 2: Показать все таблицы в схеме public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Вариант 3: Поиск таблицы с полями slug, display_name (характерные для артистов)
SELECT 
    t.table_schema,
    t.table_name,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
    AND c.column_name IN ('slug', 'display_name', 'user_id')
GROUP BY t.table_schema, t.table_name
HAVING COUNT(DISTINCT c.column_name) >= 2
ORDER BY t.table_name;

