# Chess Kernel Documentation

Добро пожаловать в документацию проекта **Chess Kernel** — абстрактного ядра для шахматных движков с поддержкой произвольных топологий.

---

## 📚 Содержание

### Для новых разработчиков

1. **[SDD-GUIDE.md](./SDD-GUIDE.md)** — Руководство по Specification-Driven Development
   - Как работать со спецификациями
   - Процесс разработки от спека до PR
   - Best practices для тестирования

2. **[SPECIFICATION-TEMPLATE.md](./SPECIFICATION-TEMPLATE.md)** — Шаблон спецификаций
   - Формат написания спецификаций
   - Примеры хороших и плохих спеков
   - Интеграция с Git Flow

3. **[ROADMAP-SPECS.md](./ROADMAP-SPECS.md)** — План развития проекта
   - Этапы разработки
   - Приоритеты задач
   - Timeline

### Спецификации

Папка **[specs/](./specs/)** содержит индивидуальные спецификации:

| Spec ID | Название | Статус |
|---------|----------|--------|
| SPEC-RCS-001 | Базовая структура пакета | ✅ Выполнено |
| SPEC-RCS-002 | Движение фигур | 🔄 В работе |
| SPEC-RCS-003 | Рокировка (Castling) | ⏳ Ожидает |
| SPEC-RCS-004 | Проверка шаха и мата | ⏳ Ожидает |
| SPEC-RCS-005 | Превращение пешки (Promotion) | ⏳ Ожидает |
| SPEC-RCS-006 | Взятие на проходе (En Passant) | ⏳ Ожидает |
| SPEC-RCS-007 | Тестирование и документация | ⏳ Ожидает |

### Архитектура

Смотрите основной [README.md](../README.md) для описания архитектуры:

```
┌─────────────────────────────────────────┐
│           Приложения (UI/AI)            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Пакеты правил (RuleSets)         │
│  @chess-kernel/rules-chess-standard     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         chess-kernel (Core)             │
│  - topology (Board, Position)           │
│  - state (GameState, Move)              │
│  - core (Piece, RuleSet interface)      │
└─────────────────────────────────────────┘
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd /workspace
npm install
```

### 2. Сборка проекта

```bash
cd chess-kernel
npm run build
```

### 3. Запуск тестов

```bash
npm test
```

### 4. Выбор задачи для разработки

1. Откройте [ROADMAP-SPECS.md](./ROADMAP-SPECS.md)
2. Найдите спецификацию со статусом "⏳ Ожидает" или "🔄 В работе"
3. Прочитайте спецификацию в папке `specs/`
4. Следуйте процессу из [SDD-GUIDE.md](./SDD-GUIDE.md)

---

## 📖 Ключевые концепции

### Specification-Driven Development (SDD)

Мы используем подход **Spec → Tests → Code**:

1. **Сначала спецификация** — детальное описание требований
2. **Затем тесты** — основанные на критериях приемки
3. **Потом код** — минимальная реализация для прохождения тестов
4. **Рефакторинг** — улучшение кода при passing tests

### Topology Agnostic

Chess Kernel не знает о форме доски:

- Прямоугольные доски (8×8, 10×8)
- Гексагональные доски
- Произвольные топологии

Топология определяется через интерфейс `Topology`.

### Ruleset Separation

Ядро не знает правил игры:

- Правила определяются в пакетах `rules-*`
- Ядро предоставляет только интерфейсы
- Легко добавлять новые варианты шахмат

### Immutable State

Все состояние неизменяемо:

- `GameState` — immutable объект
- Ходы возвращают новый state
- Structural sharing для эффективности

---

## 🔧 Разработка новой функциональности

### Шаг 1: Создание спецификации

```bash
# Создать файл спецификации
touch docs/specs/RCS-XXX-new-feature.md

# Использовать шаблон
# См. SPECIFICATION-TEMPLATE.md
```

### Шаг 2: Review спецификации

Проверить перед реализацией:

- [ ] Требования конкретны и тестируемы
- [ ] Критерии приемки бинарные (pass/fail)
- [ ] Тесты описывают ключевые сценарии
- [ ] Зависимости указаны

### Шаг 3: Написание тестов (TDD)

```typescript
// packages/rules-chess-standard/src/__tests__/new-feature.test.ts

describe('SPEC-RCS-XXX: New Feature', () => {
  it('Should work as expected', () => {
    // Arrange
    const game = createTestGame('scenario');
    
    // Act
    const result = ruleset.someMethod(game.state);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Шаг 4: Реализация

```bash
# Создать ветку
git checkout -b feature/SPEC-RCS-XXX-new-feature

# Писать код, чтобы тесты прошли
npm test -- new-feature
```

### Шаг 5: Commit и PR

```bash
git commit -m "[SPEC-RCS-XXX] Implement new feature"
git push origin feature/SPEC-RCS-XXX-new-feature
```

---

## 📊 Метрики качества

| Метрика | Target | Как проверить |
|---------|--------|---------------|
| Test Coverage | >90% | `npm test -- --coverage` |
| Build Time | <5s | `time npm run build` |
| TypeScript Errors | 0 | `npm run build` |
| Spec Compliance | 100% | Все critical specs ✅ |

---

## 🤝 Contributing

### Вклад в документацию

1. Обновить соответствующий `.md` файл
2. Убедиться, что ссылки работают
3. Создать PR с описанием изменений

### Вклад в код

1. Выбрать spec из ROADMAP
2. Следовать SDD процессу
3. Пройти code review
4. Merge после approval

### Reporting Issues

Создайте issue с:

- Описанием проблемы
- Шагами для воспроизведения
- Ожидаемым vs фактическим результатом
- Версией пакета

---

## 📚 Дополнительные ресурсы

- [FIDE Laws of Chess](https://www.fide.com/fide/handbook.html?id=177)
- [Chess Programming Wiki](https://www.chessprogramming.org/Main_Page)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

---

## 📞 Контакты

- **Project Lead:** Chess Kernel Team
- **Repository:** /workspace/chess-kernel
- **Documentation:** /workspace/chess-kernel/docs

---

**Последнее обновление:** 2024  
**Версия документации:** 1.0  
**Статус:** Активная разработка
