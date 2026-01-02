import React, { useRef, useState, useEffect } from "react";

/**
 * Визуальный селектор для выбора 30-секундного фрагмента превью
 */
export default function PreviewRangeSelector({ 
  duration, 
  startSeconds, 
  endSeconds, 
  previewDuration = 30,
  onStartChange,
  onEndChange 
}) {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'start', 'end', 'range'
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const onStartChangeRef = useRef(onStartChange);
  const onEndChangeRef = useRef(onEndChange);

  // Обновляем refs при изменении функций
  useEffect(() => {
    onStartChangeRef.current = onStartChange;
    onEndChangeRef.current = onEndChange;
  }, [onStartChange, onEndChange]);

  // Форматирование времени в MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Преобразование позиции мыши в секунды
  const getSecondsFromPosition = (clientX) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return Math.floor(percentage * duration);
  };

  // Преобразование секунд в процент позиции
  const getPositionFromSeconds = (seconds) => {
    return (seconds / duration) * 100;
  };

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setDragStartX(e.clientX);
    if (type === 'start') {
      setDragStartValue(startSeconds);
    } else if (type === 'end') {
      setDragStartValue(endSeconds);
    } else {
      setDragStartValue(startSeconds);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const seconds = Math.floor(percentage * duration);

      if (dragType === 'start') {
        // Перетаскиваем начало, но ограничиваем чтобы не превысить конец
        let newStart = Math.max(0, Math.min(endSeconds - previewDuration, seconds));
        newStart = Math.floor(newStart);
        if (onStartChangeRef.current) {
          onStartChangeRef.current(newStart);
        }
      } else if (dragType === 'end') {
        // Перетаскиваем конец, но ограничиваем чтобы не быть меньше начала
        let newEnd = Math.max(startSeconds + previewDuration, Math.min(duration, seconds));
        newEnd = Math.floor(newEnd);
        if (onEndChangeRef.current) {
          onEndChangeRef.current(newEnd);
        }
      } else if (dragType === 'range') {
        // Перетаскиваем весь фрагмент
        const deltaX = e.clientX - dragStartX;
        const deltaSeconds = (deltaX / rect.width) * duration;
        let newStart = Math.max(0, Math.min(duration - previewDuration, dragStartValue + deltaSeconds));
        newStart = Math.floor(newStart);
        if (onStartChangeRef.current) {
          onStartChangeRef.current(newStart);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, dragStartX, dragStartValue, duration, previewDuration, startSeconds, endSeconds]);

  // Обработка клика на timeline для перемещения фрагмента
  const handleTimelineClick = (e) => {
    if (isDragging || !timelineRef.current) return;
    
    const seconds = getSecondsFromPosition(e.clientX);
    const newStart = Math.max(0, Math.min(duration - previewDuration, seconds - previewDuration / 2));
    const clampedStart = Math.floor(newStart);
    if (onStartChangeRef.current) {
      onStartChangeRef.current(clampedStart);
    }
  };

  const selectionStart = getPositionFromSeconds(startSeconds);
  const selectionWidth = getPositionFromSeconds(endSeconds - startSeconds);

  return (
    <div style={{
      padding: "16px",
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}>
      {/* Шкала времени */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        style={{
          position: "relative",
          width: "100%",
          height: "60px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {/* Выделенный фрагмент (30 секунд) */}
        <div
          style={{
            position: "absolute",
            left: `${selectionStart}%`,
            width: `${selectionWidth}%`,
            height: "100%",
            background: "rgba(255, 255, 0, 0.3)",
            border: "2px solid #FFD700",
            borderRadius: "6px",
            cursor: "move",
          }}
          onMouseDown={(e) => handleMouseDown(e, 'range')}
        >
          {/* Левая граница с ручкой */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: "#FFD700",
              cursor: "ew-resize",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, 'start');
            }}
          />
          
          {/* Правая граница с ручкой */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: "#FFD700",
              cursor: "ew-resize",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, 'end');
            }}
          >
            {/* Белый квадрат на правой ручке */}
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "12px",
                height: "12px",
                background: "#fff",
                borderRadius: "2px",
                border: "1px solid #FFD700",
              }}
            />
          </div>
        </div>

        {/* Маркеры времени */}
        {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => {
          const time = i * 10;
          const position = getPositionFromSeconds(time);
          if (position > 100) return null;
          
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${position}%`,
                top: 0,
                bottom: 0,
                width: "1px",
                background: time % 30 === 0 ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
              }}
            />
          );
        })}
      </div>

      {/* Информация о выбранном фрагменте */}
      <div style={{
        marginTop: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.7)",
      }}>
        <div>
          Начало: {formatTime(startSeconds)}
        </div>
        <div style={{
          padding: "4px 12px",
          background: "rgba(255, 215, 0, 0.2)",
          borderRadius: "4px",
          color: "#FFD700",
          fontWeight: 600,
        }}>
          {formatTime(endSeconds - startSeconds)}
        </div>
        <div>
          Конец: {formatTime(endSeconds)}
        </div>
      </div>

      {/* Подсказка */}
      <div style={{
        marginTop: "8px",
        fontSize: "10px",
        color: "rgba(255, 255, 255, 0.5)",
        textAlign: "center",
      }}>
        Перетащите желтый фрагмент или кликните на шкале для выбора 30-секундного превью
      </div>
    </div>
  );
}

