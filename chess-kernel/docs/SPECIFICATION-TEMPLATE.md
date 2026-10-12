# Specification Template для Chess Kernel

## Шаблон спецификации

```markdown
#### Spec [ID]: [Название]
**ID:** SPEC-[DOMAIN]-[NUMBER]  
**Статус:** ⏳ Ожидает / 🔄 В работе / ✅ Выполнено / ❌ Отклонено  
**Описание:** Краткое описание того, что реализует эта спецификация

**Требования:**
- Список конкретных требований к функциональности
- Каждое требование должно быть тестируемым
- Избегать двусмысленных формулировок

**Критерии приемки (Acceptance Criteria):**
- [ ] Конкретный проверяемый критерий 1
- [ ] Конкретный проверяемый критерий 2
- [ ] Критерий должен быть бинарным (pass/fail)

**Тесты:**
```typescript
describe('SPEC-[ID]: [Description]', () => {
  it('[Конкретный тест кейс 1]', () => {
    // Arrange
    const game = createTestGame('start-position');
    
    // Act
    const moves = ruleset.generateMoves(game.state, 'white');
    
    // Assert
    expect(moves).toHaveLength(expectedCount);
  });
  
  it('[Конкретный тест кейс 2]', () => {});
});
```

**Зависимости:**
- SPEC-XXX-YYY: [Название зависимой спецификации]

**Примечания:**
- Дополнительные заметки для разработчиков
- Ссылки на внешние ресурсы (FIDE rules, Wikipedia, etc.)
```

---

## Примеры использования

### Пример 1: Реализация движения коня

```markdown
#### Spec RCS-002-KNIGHT: Движение коня
**ID:** SPEC-RCS-002-KNIGHT  
**Статус:** ✅ Выполнено  
**Описание:** Конь двигается буквой "Г" и может перепрыгивать через фигуры

**Требования:**
- Конь двигается на 2 клетки в одном направлении и 1 в перпендикулярном
- Конь может перепрыгивать через свои и чужие фигуры
- Конь может захватывать вражеские фигуры на целевой клетке
- Конь не может захватывать свои фигуры

**Критерии приемки:**
- [ ] generatePieceMoves() возвращает до 8 ходов для коня в центре доски
- [ ] Ходы корректно ограничены краями доски
- [ ] Захват вражеской фигуры разрешен
- [ ] Захват своей фигуры запрещен
- [ ] Перепрыгивание через фигуры работает

**Тесты:**
```typescript
describe('SPEC-RCS-002-KNIGHT: Knight Movement', () => {
  it('Knight in center has 8 possible moves', () => {
    const game = createTestGame();
    const knight = getPiece(game, 'knight-e4');
    const moves = ruleset.generatePieceMoves(game.state, knight);
    expect(moves).toHaveLength(8);
  });
  
  it('Knight in corner has 2 possible moves', () => {
    const game = createTestGame();
    const knight = getPiece(game, 'knight-a1');
    const moves = ruleset.generatePieceMoves(game.state, knight);
    expect(moves).toHaveLength(2);
  });
  
  it('Knight captures enemy piece', () => {
    const game = createTestGame('knight-vs-pawn');
    const moves = ruleset.generateMoves(game.state, 'white');
    const captureMove = moves.find(m => m.capturedPieceId !== undefined);
    expect(captureMove).toBeDefined();
  });
  
  it('Knight cannot capture friendly piece', () => {
    const game = createTestGame('knight-blocked-friendly');
    const moves = ruleset.generateMoves(game.state, 'white');
    const blockedMoves = moves.filter(m => isBlockedByFriendly(m));
    expect(blockedMoves).toHaveLength(0);
  });
});
```

**Зависимости:**
- SPEC-RCS-001: Базовая структура пакета

**Примечания:**
- FIDE Rules: Article 3 - The Moves of the Pieces
- Координаты: 0-indexed (0-7 для файлов и рангов)
```

---

### Пример 2: Рокировка

```markdown
#### Spec RCS-003: Рокировка (Castling)
**ID:** SPEC-RCS-003  
**Статус:** 🔄 В работе  
**Описание:** Реализация короткой и длинной рокировки для короля и ладей

**Требования:**
- Короткая рокировка (O-O): король e1→g1, ладья h1→f1
- Длинная рокировка (O-O-O): король e1→c1, ладья a1→d1
- Права на рокировку хранятся в metadata.castlingRights ('K', 'Q', 'k', 'q')
- Рокировка невозможна если:
  - Король уже ходил
  - Ладья уже ходила
  - Путь между королем и ладьей не свободен
  - Король под шахом
  - Клетки, которые проходит король, атакованы
  - Клетка назначения короля атакована

**Критерии приемки:**
- [ ] Castling rights инициализируются при setup игры
- [ ] generateCastlingMoves() возвращает доступные рокировки
- [ ] isValidMove() отклоняет рокировку через атакованную клетку
- [ ] executeMove() двигает и короля, и ладью
- [ ] Castling rights удаляются после хода короля
- [ ] Castling rights удаляются после хода соответствующей ладьи

**Тесты:**
```typescript
describe('SPEC-RCS-003: Castling', () => {
  it('Kingside castling available at start', () => {
    const game = createTestGame('start-position');
    const moves = ruleset.generateMoves(game.state, 'white');
    const castleMoves = moves.filter(m => m.metadata?.isCastling);
    expect(castleMoves).toHaveLength(1); // Только kingside на старте
    expect(castleMoves[0].to.coords).toEqual([6, 0]); // g1
  });
  
  it('Castling not allowed through check', () => {
    const game = createTestGame('castle-through-check');
    const moves = ruleset.generateMoves(game.state, 'white');
    const castleMoves = moves.filter(m => m.metadata?.isCastling);
    expect(castleMoves).toHaveLength(0);
  });
  
  it('Castling rights lost after king moves', async () => {
    const game = createTestGame('start-position');
    // Сделать ход королем
    const kingMove = findMove(game.moves, 'Ke2');
    const newState = ruleset.executeMove(game.state, kingMove);
    // Проверить, что права потеряны
    expect(newState.metadata.castlingRights.has('K')).toBe(false);
    expect(newState.metadata.castlingRights.has('Q')).toBe(false);
  });
});
```

**Зависимости:**
- SPEC-RCS-002: Движение фигур
- SPEC-RCS-004: Проверка шаха

**Примечания:**
- FIDE Rules: Article 3.8 - Castling
- В chess-kernel рокировка реализуется через metadata.isCastling и metadata.castlingRookId
```

---

## Статусы спецификаций

| Статус | Значение | Когда использовать |
|--------|----------|-------------------|
| ⏳ Ожидает | Spec еще не начат | Приоритизировано, но нет ресурсов |
| 🔄 В работе | Активная разработка | Разработчик назначен, код пишется |
| ✅ Выполнено | Spec реализован и протестирован | Все критерии приемки выполнены |
| ❌ Отклонено | Spec не будет реализован | Изменение требований, technical debt |

---

## Best Practices

### ✨ Хорошие спецификации

✅ **Конкретные и тестируемые:**
```markdown
- [ ] generateMoves() возвращает массив Move[]
- [ ] isValidMove() возвращает boolean
```

✅ **Атомарные:**
```markdown
Spec RCS-002-PAWN: Движение пешки
Spec RCS-002-KNIGHT: Движение коня
```

✅ **С зависимостями:**
```markdown
**Зависимости:**
- SPEC-RCS-001: Базовая структура
```

### ❌ Плохие спецификации

❌ **Размытые:**
```markdown
- [ ] Сделать работу с фигурами лучше
```

❌ **Слишком большие:**
```markdown
Spec RCS-002: Все правила шахмат (50 критериев)
```

❌ **Без тестов:**
```markdown
// Нет секции Tests
```

---

## Интеграция с Git Flow

```bash
# Создать ветку для спека
git checkout -b feature/SPEC-RCS-002-knight-movement

# Коммиты с ссылками на spec
git commit -m "[SPEC-RCS-002-KNIGHT] Add knight move generation"
git commit -m "[SPEC-RCS-002-KNIGHT] Add tests for edge cases"

# PR title
[SPEC-RCS-002-KNIGHT] Implement knight movement

# В описании PR указать:
## Implements
- SPEC-RCS-002-KNIGHT: Knight Movement

## Acceptance Criteria
- [x] Knight generates L-shaped moves
- [x] Edge cases handled
```

---

**Версия шаблона:** 1.0  
**Обновлено:** 2024  
**Использование:** Все спецификации в проекте Chess Kernel
