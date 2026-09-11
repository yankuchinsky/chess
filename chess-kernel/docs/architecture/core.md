# Архитектура Chess Kernel

Этот документ описывает архитектуру абстрактного ядра шахматного движка, которое не знает о конкретных правилах игры, размерах доски или количестве игроков.

## 🎯 Принципы проектирования

### 1. Разделение ответственности (Separation of Concerns)

```
┌─────────────────────────────────────────────────────────────┐
│                    Адаптеры (Adapters)                       │
│  CLI Renderer │ DOM Renderer │ UCI Protocol │ Network       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Правила (RuleSets)                         │
│  Standard Chess │ Crazyhouse │ Chess960 │ Hex Chess         │
│  (вся логика ходов, валидация, конец игры)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Ядро (Core)                             │
│  Топология │ Состояние │ Фигуры │ Направления │ Движение    │
│  (только математика доски, без правил игры)                 │
└─────────────────────────────────────────────────────────────┘
```

**Ключевое правило:** Ядро НЕ знает о:
- Конкретных правилах игры (шахматы, шашки, го)
- Количестве игроков (2, 3, 4+)
- Размерах доски (8×8, 10×8, гексагональная)
- Целях игры (мат, набор очков, выживание)

### 2. Топология-агностик подход

Ядро работает с абстрактной топологией через интерфейс:

```typescript
interface Topology {
  readonly width: number;
  readonly height: number;
  
  isValid(pos: Position): boolean;
  getNeighbors(pos: Position, direction: Direction): Position[];
  raycast(from: Position, direction: Direction): Position[];
  distance(from: Position, to: Position): number;
  serialize(pos: Position): string;
  deserialize(coord: string): Position | null;
}
```

Реализации:
- `RectangularTopology` — классическая прямоугольная доска
- `HexagonalTopology` — гексагональная сетка (аксиальные координаты)
- `CustomTopology` — произвольная карта с препятствиями

### 3. Неизменяемое состояние (Immutability)

Все операции над состоянием возвращают новые объекты:

```typescript
interface GameState<TMetadata = unknown> {
  readonly board: Board;
  readonly currentPlayer: PlayerId;
  readonly halfmoveClock: number;
  readonly fullmoveNumber: number;
  readonly metadata: TMetadata;
  readonly history: ReadonlyArray<Move>;
  
  // Возвращает НОВОЕ состояние, не модифицирует текущее
  applyMove(move: Move): GameState<TMetadata>;
}
```

Преимущества:
- Легкая реализация undo/redo
- Безопасное хранение истории партий
- Простая сериализация для отладки
- Предсказуемость (нет побочных эффектов)

### 4. Декларативное описание фигур

Фигуры не содержат логику ходов — только профиль движения:

```typescript
interface PieceDefinition {
  readonly type: PieceType;
  readonly owner: PlayerId;
  readonly movementPatterns: MovementPattern[];
}

interface MovementPattern {
  readonly directions: Direction[];
  readonly maxDistance: number | Infinity;
  readonly canCapture: boolean;
  readonly canMoveEmpty: boolean;
  readonly isJump: boolean; // Игнорирует препятствия (конь)
}
```

Пример профиля ладьи:
```typescript
{
  directions: [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST],
  maxDistance: Infinity,
  canCapture: true,
  canMoveEmpty: true,
  isJump: false
}
```

Логика генерации ходов находится в `RuleSet`, а не в фигуре.

## 📦 Структура пакетов

```
chess-kernel/
├── packages/
│   ├── core/              # Абстрактное ядро (этот пакет)
│   ├── rules-standard/    # Стандартные шахматы
│   ├── rules-crazyhouse/  # Crazyhouse
│   ├── rules-chess960/    # Фишеровские шахматы
│   ├── adapter-cli/       # Консольный интерфейс
│   ├── adapter-dom/       # Web интерфейс
│   └── adapter-uci/       # UCI протокол
├── docs/
│   ├── architecture/      # Архитектурные документы
│   └── roadmap/           # План развития
└── tools/
    └── validator/         # Валидатор RuleSet
```

## 🔧 Основные компоненты ядра

### Типы (Types)

```typescript
// Координата: числовое значение (файл или ранг)
type Coordinate = number;

// Позиция на доске
interface Position {
  readonly file: Coordinate;
  readonly rank: Coordinate;
}

// Идентификатор игрока (абстрактный, не "white/black")
type PlayerId = string;

// Тип фигуры (абстрактный, не "pawn/knight")
type PieceType = string;

// Направление движения
enum Direction {
  NORTH = 'N',
  SOUTH = 'S',
  EAST = 'E',
  WEST = 'W',
  NORTH_EAST = 'NE',
  NORTH_WEST = 'NW',
  SOUTH_EAST = 'SE',
  SOUTH_WEST = 'SW'
  // Для гексов добавляются: NE_N, NW_N, и т.д.
}
```

### Доска (Board)

```typescript
class Board {
  constructor(
    private topology: Topology,
    private pieces: Map<string, PieceDefinition>
  ) {}
  
  getPiece(pos: Position): PieceDefinition | null;
  setPiece(pos: Position, piece: PieceDefinition | null): void;
  getAllPieces(): IterableIterator<[Position, PieceDefinition]>;
  isEmpty(pos: Position): boolean;
  isOccupiedBy(pos: Position, playerId: PlayerId): boolean;
}
```

### Ход (Move)

```typescript
interface Move {
  readonly from: Position;
  readonly to: Position;
  readonly piece: PieceType;
  readonly capture?: PieceType | null;
  readonly metadata?: MoveMetadata;
}

interface MoveMetadata {
  readonly promotion?: PieceType;
  readonly enPassant?: boolean;
  readonly castling?: 'kingside' | 'queenside';
  readonly drop?: boolean; // Для Crazyhouse
  readonly [key: string]: any; // Расширяемо
}
```

### Правило (RuleSet)

```typescript
interface RuleSet<TMetadata = unknown> {
  readonly name: string;
  readonly initialSetup: InitialSetup;
  
  // Генерация всех псевдо-легальных ходов
  generatePseudoLegalMoves(state: GameState<TMetadata>): Move[];
  
  // Проверка легальности конкретного хода
  isMoveLegal(state: GameState<TMetadata>, move: Move): boolean;
  
  // Применение хода (возвращает новое состояние)
  executeMove(state: GameState<TMetadata>, move: Move): GameState<TMetadata>;
  
  // Определение статуса игры
  getGameStatus(state: GameState<TMetadata>): GameStatus;
  
  // Валидация начальной расстановки
  validateSetup(setup: InitialSetup): boolean;
}
```

## 🎮 Примеры использования

### Создание доски 8×8

```typescript
import { RectangularTopology, createBoard } from '@chess-kernel/core';

const topology = new RectangularTopology(8, 8);
const board = createBoard(topology);

// Добавление фигуры
board.setPiece({ file: 4, rank: 0 }, {
  type: 'king',
  owner: 'white',
  movementPatterns: [...]
});
```

### Создание гексагональной доски

```typescript
import { HexagonalTopology, createBoard } from '@chess-kernel/core';

// Радиус 3 = 37 клеток
const topology = new HexagonalTopology(3);
const board = createBoard(topology);

// Работа с аксиальными координатами
const pos = { q: 1, r: -2 }; // Аксиальные координаты
```

### Реализация своего RuleSet

```typescript
import { RuleSet, GameState } from '@chess-kernel/core';

interface MyGameMetadata {
  score: Record<string, number>;
  specialAbilityCooldown: number;
}

class MyCustomRuleSet implements RuleSet<MyGameMetadata> {
  readonly name = 'My Custom Game';
  readonly initialSetup = {...};
  
  generatePseudoLegalMoves(state: GameState<MyGameMetadata>) {
    // Используем ядро для генерации ходов на основе профилей фигур
    // Добавляем специальную логику
  }
  
  isMoveLegal(state: GameState<MyGameMetadata>, move: Move) {
    // Проверяем, не нарушает ли ход правила
  }
  
  executeMove(state: GameState<MyGameMetadata>, move: Move) {
    // Применяем ход через ядро
    // Обновляем метаданные (очки, кулдауны)
  }
  
  getGameStatus(state: GameState<MyGameMetadata>) {
    // Проверяем условия победы/поражения/ничьей
  }
}
```

## 🔍 Расширяемость

### Добавление новой топологии

```typescript
class SphericalTopology implements Topology {
  // Реализация интерфейса Topology
  // Например, для игры на сфере с искажением координат
}
```

### Добавление новой фигуры

```typescript
const archbishop: PieceDefinition = {
  type: 'archbishop',
  owner: 'white',
  movementPatterns: [
    // Профиль слона
    { directions: DIAGONALS, maxDistance: Infinity, ... },
    // Профиль коня
    { directions: KNIGHT_MOVES, maxDistance: 1, isJump: true, ... }
  ]
};
```

### Добавление специального правила

Через `MoveMetadata` и расширение `GameStateMetadata`:

```typescript
interface CrazyhouseMetadata {
  pockets: {
    white: PieceType[];
    black: PieceType[];
  };
}

interface CrazyhouseMoveMetadata {
  drop?: {
    pieceType: PieceType;
    fromPocket: true;
  };
}
```

## 📊 Сравнение с другими движками

| Функция | Chess Kernel | Stockfish | Chess.js |
|---------|--------------|-----------|----------|
| Поддержка кастомных правил | ✅ Да | ❌ Нет | ❌ Нет |
| Гексагональные доски | ✅ Да | ❌ Нет | ❌ Нет |
| Неизменяемое состояние | ✅ Да | ❌ Нет | ⚠️ Частично |
| Адаптеры рендеринга | ✅ Любые | ❌ Только UCI | ❌ Нет |
| Производительность | ⚠️ Средняя | ✅ Высокая | ✅ Высокая |
| Простота расширения | ✅ Очень легко | ❌ Очень сложно | ⚠️ Средне |

## 🚀 Следующие шаги

1. **Реализация Standard Chess RuleSet** — полный набор правил классических шахмат
2. **CLI Адаптер** — игра в консоли
3. **Crazyhouse RuleSet** — доказательство расширяемости
4. **PGN/FEN поддержка** — импорт/экспорт партий

---

*См. также:*
- *[Roadmap](../roadmap/ROADMAP.md)*
- *[API Reference](../../dist/index.d.ts)*
