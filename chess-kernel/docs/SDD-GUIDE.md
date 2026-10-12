# Chess Kernel - Specification-Driven Development Guide

## 📖 Введение

Этот документ описывает процесс разработки через спецификации (Specification-Driven Development) для проекта Chess Kernel.

## 🎯 Что такое Specification-Driven Development?

**SDD** — это методология разработки, при которой:

1. **Сначала пишется спецификация** — детальное описание того, ЧТО должно быть реализовано
2. **Затем пишутся тесты** — основанные на критериях приемки из спецификации
3. **Потом пишется код** — минимально необходимый для прохождения тестов
4. **Рефакторинг** — улучшение кода при сохранении passing tests

### Преимущества для Chess Kernel

✅ **Ясность требований**: Каждый разработчик понимает, что нужно реализовать  
✅ **Тестируемость**: Код изначально проектируется тестируемым  
✅ **Документация**: Спецификации служат живой документацией  
✅ **Traceability**: Легко отследить, какой код реализует какое требование  

---

## 📁 Структура документации

```
chess-kernel/docs/
├── ROADMAP-SPECS.md          # Общий план развития по этапам
├── SPECIFICATION-TEMPLATE.md # Шаблон для написания спецификаций
├── SDD-GUIDE.md              # Этот файл - руководство по процессу
└── specs/                    # Папка с индивидуальными спецификациями
    ├── RCS-001-base-structure.md
    ├── RCS-002-movement.md
    ├── RCS-003-castling.md
    └── ...
```

---

## 🔄 Процесс разработки

### Шаг 1: Создание спецификации

1. Определить функциональность, которую нужно реализовать
2. Создать новую спецификацию в `docs/specs/` используя шаблон
3. Обновить статус в `ROADMAP-SPECS.md`

```bash
# Создать файл спецификации
touch docs/specs/RCS-002-knight-movement.md

# Использовать шаблон из SPECIFICATION-TEMPLATE.md
```

### Шаг 2: Review спецификации

Перед началом реализации:

- [ ] Спецификация следует шаблону
- [ ] Требования конкретны и тестируемы
- [ ] Критерии приемки бинарные (pass/fail)
- [ ] Тесты описывают ключевые сценарии
- [ ] Зависимости указаны

### Шаг 3: Написание тестов (TDD)

```typescript
// packages/rules-chess-standard/src/__tests__/knight-movement.test.ts

import { describe, it, expect } from 'vitest';
import { StandardChessRuleSet } from '../index';
import { createTestGame } from '../../test-helpers';

describe('SPEC-RCS-002-KNIGHT: Knight Movement', () => {
  const ruleset = new StandardChessRuleSet();
  
  it('Knight in center has 8 possible moves', () => {
    // Arrange
    const game = createTestGame('knight-center');
    
    // Act
    const moves = ruleset.generateMoves(game.state, 'white');
    const knightMoves = moves.filter(m => isKnightMove(m));
    
    // Assert
    expect(knightMoves).toHaveLength(8);
  });
});
```

Запустить тесты (должны fail):

```bash
npm test -- --run
```

### Шаг 4: Реализация кода

Писать минимальный код для прохождения тестов:

```typescript
// packages/rules-chess-standard/src/index.ts

private generateKnightMoves(state: GameState, piece: Piece): Move[] {
  const moves: Move[] = [];
  const fromPos = piece.position!;
  const [file, rank] = fromPos.coords;
  
  const knightOffsets = [
    [1, 2], [2, 1], [2, -1], [1, -2],
    [-1, -2], [-2, -1], [-2, 1], [-1, 2]
  ];
  
  for (const [df, dr] of knightOffsets) {
    const newFile = file + df;
    const newRank = rank + dr;
    
    if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) continue;
    
    const toPos = { coords: [newFile, newRank] as const };
    const targetPiece = getPieceAt(state.board, toPos);
    
    if (!targetPiece || targetPiece.owner !== piece.owner) {
      moves.push(createMove(/* ... */));
    }
  }
  
  return moves;
}
```

### Шаг 5: Запуск тестов и verification

```bash
# Запустить конкретный тест
npm test -- knight-movement

# Запустить все тесты с coverage
npm test -- --coverage
```

Проверить:
- [ ] Все тесты проходят ✅
- [ ] Coverage соответствует target (>90%)
- [ ] Нет TypeScript ошибок

### Шаг 6: Commit и PR

```bash
# Commit с ссылкой на spec
git add .
git commit -m "[SPEC-RCS-002-KNIGHT] Implement knight movement

- Add knight move generation logic
- Handle edge cases (board boundaries)
- Add comprehensive test coverage

Implements: SPEC-RCS-002-KNIGHT"

# Push и создать PR
git push origin feature/SPEC-RCS-002-knight-movement
```

### Шаг 7: Update статуса

Обновить `ROADMAP-SPECS.md`:

```markdown
#### Spec 1.2: Движение фигур
**ID:** SPEC-RCS-002  
**Статус:** ✅ Выполнено  # Изменить с 🔄 В работе
```

---

## 🏷️ Naming Convention

### Spec IDs

Формат: `SPEC-[DOMAIN]-[NUMBER][-SUBJECT]`

| Domain | Описание | Пример |
|--------|----------|--------|
| RCS | Rules Chess Standard | SPEC-RCS-001 |
| RC960 | Rules Chess960 | SPEC-RC960-001 |
| RCH | Rules Crazyhouse | SPEC-RCH-001 |
| HT | Hex Topology | SPEC-HT-001 |
| INF | Infrastructure | SPEC-INF-001 |

### Git Branches

```bash
feature/SPEC-RCS-002-knight-movement
fix/SPEC-RCS-003-castling-bug
docs/SPEC-INF-003-api-docs
```

### Commits

```bash
[SPEC-RCS-002-KNIGHT] Add knight move generation
[SPEC-RCS-003] Fix castling rights update
[SPEC-INF-001] Configure vitest
```

---

## 🧪 Testing Guidelines

### Test Structure (AAA Pattern)

```typescript
it('[Description]', () => {
  // Arrange - подготовка данных
  const game = createTestGame('start-position');
  const ruleset = new StandardChessRuleSet();
  
  // Act - выполнение действия
  const moves = ruleset.generateMoves(game.state, 'white');
  
  // Assert - проверка результата
  expect(moves.length).toBeGreaterThan(0);
});
```

### Test Helpers

Создать утилиты для упрощения тестов:

```typescript
// packages/rules-chess-standard/test-helpers/index.ts

export function createTestGame(scenario: string): TestGame {
  // Реализация быстрой настройки позиций
}

export function assertMoveLegal(ruleset: RuleSet, state: GameState, move: Move) {
  expect(ruleset.isValidMove(state, move)).toBe(true);
}

export function assertMoveIllegal(ruleset: RuleSet, state: GameState, move: Move) {
  expect(ruleset.isValidMove(state, move)).toBe(false);
}
```

### Test Categories

1. **Unit Tests**: Тестирование отдельных методов
2. **Integration Tests**: Тестирование взаимодействия компонентов
3. **Property Tests**: Проверка инвариантов (например, "король никогда не может быть съеден")

---

## 📊 Quality Metrics

### Coverage Requirements

| Package | Min Coverage | Critical Files |
|---------|--------------|----------------|
| chess-kernel/core | 95% | Все файлы |
| rules-chess-standard | 90% | index.ts |
| rules-* variants | 85% | index.ts |

### Code Review Checklist

- [ ] Spec ID указан в коде (комментарии)
- [ ] Все критерии приемки покрыты тестами
- [ ] Нет hardcoded values без объяснения
- [ ] TypeScript strict mode соблюдается
- [ ] Документация обновлена

---

## 🚀 Quick Start для нового разработчика

1. **Прочитать документы:**
   - `README.md` - общая архитектура
   - `ROADMAP-SPECS.md` - текущие задачи
   - `SPECIFICATION-TEMPLATE.md` - как писать спеки

2. **Настроить окружение:**
   ```bash
   npm install
   npm run build
   npm test
   ```

3. **Выбрать задачу:**
   - Найти spec со статусом "⏳ Ожидает" в ROADMAP
   - Убедиться, что зависимости выполнены

4. **Следовать процессу:**
   - Spec → Tests → Code → PR

---

## 📚 Additional Resources

- [FIDE Laws of Chess](https://www.fide.com/fide/handbook.html?id=177)
- [Chess Programming Wiki](https://www.chessprogramming.org/Main_Page)
- [TypeScript Best Practices](https://github.com/typescript-cheatsheets/react)
- [Vitest Documentation](https://vitest.dev/)

---

**Версия:** 1.0  
**Обновлено:** 2024  
**Поддерживается:** Chess Kernel Team
