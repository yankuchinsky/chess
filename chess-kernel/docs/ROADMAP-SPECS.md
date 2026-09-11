# План развития проекта Chess Kernel
## Specification-Driven Development Roadmap

---

## 📋 Обзор архитектуры

```
┌─────────────────────────────────────────┐
│           Приложения (UI/AI)            │
│   vue-chess, html-chess, server         │
│   + рендереры (Canvas/SVG/DOM/React)    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Пакеты правил (RuleSets)         │
│  @chess-kernel/rules-chess-standard     │
│  @chess-kernel/rules-chess960           │
│  @chess-kernel/rules-crazyhouse         │
│  @chess-kernel/rules-capablanca         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         chess-kernel (Core)             │
│  - topology (Board, Position)           │
│  - state (GameState, Move)              │
│  - core (Piece, RuleSet interface)      │
│  - online (sync, websocket, matchmaking)│
│  - utils (FEN, PGN, serialization)      │
└─────────────────────────────────────────┘
```

---

## 🎯 Этап 1: Завершение rules-chess-standard (Текущий)

### Цель
Полная реализация правил стандартных шахмат FIDE для chess-kernel.

### Спеки (Specifications)

#### Spec 1.1: Базовая структура пакета
**ID:** SPEC-RCS-001  
**Статус:** ✅ Выполнено  
**Описание:** 
- Создан пакет `@chess-kernel/rules-chess-standard`
- Настроены зависимости от `@chess-kernel/core`
- Определены типы фигур: king, queen, rook, bishop, knight, pawn

**Критерии приемки:**
- [x] package.json с правильными dependencies
- [x] tsconfig.json настроен
- [x] Экспортируются константы PIECE_TYPES

---

#### Spec 1.2: Движение фигур
**ID:** SPEC-RCS-002  
**Статус:** 🔄 В работе  
**Описание:** Реализация генерации ходов для всех типов фигур

**Требования:**
- Король: 1 клетка в любом направлении
- Ферзь: скользит по диагоналям, вертикалям, горизонталям
- Ладья: скользит по вертикалям и горизонталям
- Слон: скользит по диагоналям
- Конь: прыжок буквой "Г"
- Пешка: 
  - 1 шаг вперед (если пусто)
  - 2 шага вперед с начальной позиции
  - взятие по диагонали
  - взятие на проходе (en passant)
  - превращение (promotion)

**Критерии приемки:**
- [ ] generateMoves() возвращает все псевдо-легальные ходы
- [ ] isValidMove() проверяет корректность движения
- [ ] Обработаны краевые случаи (доска 8x8)

**Тесты:**
```typescript
describe('SPEC-RCS-002: Movement', () => {
  it('Knight generates L-shaped moves', () => {});
  it('Bishop slides diagonally until blocked', () => {});
  it('Pawn captures diagonally only', () => {});
  it('En passant is available after enemy pawn double-push', () => {});
});
```

---

#### Spec 1.3: Рокировка
**ID:** SPEC-RCS-003  
**Статус:** ⏳ Ожидает  
**Описание:** Реализация короткой и длинной рокировки

**Требования:**
- Права на рокировку отслеживаются в metadata.castlingRights
- Короткая рокировка (O-O): король на 2 клетки к ладье
- Длинная рокировка (O-O-O): король на 2 клетки к другой ладье
- Условия:
  - Король и ладья не ходили
  - Путь свободен
  - Клетки под атакой врага (для короля)

**Критерии приемки:**
- [ ] Castling rights обновляются после хода короля/ладьи
- [ ] generateCastlingMoves() возвращает доступные рокировки
- [ ] isValidMove() проверяет путь на атакованность

**Тесты:**
```typescript
describe('SPEC-RCS-003: Castling', () => {
  it('Kingside castling available when path clear', () => {});
  it('Castling not allowed through check', () => {});
  it('Castling rights lost after king moves', () => {});
});
```

---

#### Spec 1.4: Проверка шаха и мата
**ID:** SPEC-RCS-004  
**Статус:** ⏳ Ожидает  
**Описание:** Detection check, checkmate, stalemate

**Требования:**
- getAttackedPositions() возвращает все атакованные клетки
- isKingInCheck() проверяет, под шахом ли король
- checkGameOver() определяет:
  - Checkmate (король под шахом + нет ходов)
  - Stalemate (король не под шахом + нет ходов)
  - Draw by insufficient material

**Критерии приемки:**
- [ ] isValidMove() отклоняет ходы, оставляющие короля под шахом
- [ ] checkGameOver() возвращает правильный результат
- [ ] isCheck флаг в metadata

**Тесты:**
```typescript
describe('SPEC-RCS-004: Check & Mate', () => {
  it('Detects check position', () => {});
  it('Identifies checkmate', () => {});
  it('Identifies stalemate', () => {});
  it('No legal moves when in check', () => {});
});
```

---

#### Spec 1.5: Превращение пешки (Promotion)
**ID:** SPEC-RCS-005  
**Статус:** ⏳ Ожидает  
**Описание:** Реализация promotion пешки на последней горизонтали

**Требования:**
- При достижении 8-й (для белых) или 1-й (для черных) горизонтали
- Доступные фигуры: queen, rook, bishop, knight
- Ход с promotion должен иметь metadata.promotionType
- executeMove() трансформирует пешку в выбранную фигуру

**Критерии приемки:**
- [ ] generatePawnMoves() включает promotion ходы
- [ ] transformPiece() меняет тип фигуры
- [ ] Promotion обязателен при достижении края

**Тесты:**
```typescript
describe('SPEC-RCS-005: Promotion', () => {
  it('Pawn promotes to queen on 8th rank', () => {});
  it('Promotion capture available', () => {});
  it('Cannot move pawn without promotion on last rank', () => {});
});
```

---

#### Spec 1.6: Специальные правила
**ID:** SPEC-RCS-006  
**Статус:** ⏳ Ожидает  
**Описание:** Взятие на проходе и правило 50 ходов

**Требования:**
- En passant:
  - Доступно только сразу после двойного хода пешки
  - metadata.enPassantTarget указывает целевую клетку
  - Снимается после следующего хода
- Правило 50 ходов:
  - halfmoveClock сбрасывается при взятии/ходе пешки
  - Draw при halfmoveClock >= 100 (50 ходов каждого игрока)

**Критерии приемки:**
- [ ] En passant доступен ровно 1 ход
- [ ] halfmoveClock корректно обновляется
- [ ] checkGameOver() определяет draw by 50-move rule

**Тесты:**
```typescript
describe('SPEC-RCS-006: Special Rules', () => {
  it('En passant available for one move only', () => {});
  it('50-move rule triggers draw', () => {});
  it('Halfmove clock resets on pawn move', () => {});
});
```

---

#### Spec 1.7: Тестирование и документация
**ID:** SPEC-RCS-007  
**Статус:** ⏳ Ожидает  
**Описание:** Полное покрытие тестами и README

**Требования:**
- Покрытие тестами > 90%
- Примеры использования в README
- TypeScript типы экспортированы корректно

**Критерии приемки:**
- [ ] Все spec-тесты проходят
- [ ] npm test проходит без ошибок
- [ ] README с примерами setup, generateMoves, executeMove

---

## 🚀 Этап 2: Варианты шахмат

### Spec 2.1: Chess960 (Fischer Random)
**ID:** SPEC-RC960-001  
**Статус:** ⏳ Ожидает  
**Описание:** Правила Chess960 со случайной начальной позицией

**Требования:**
- Генерация 960 стартовых позиций
- Сохранение правил рокировки (адаптированных для Chess960)
- Наследование от StandardChessRuleSet
- Валидация корректности стартовой позиции

---

### Spec 2.2: Crazyhouse
**ID:** SPEC-RCH-001  
**Статус:** ⏳ Ожидает  
**Описание:** Шахматы с "руками" - можно выставлять съеденные фигуры

**Требования:**
- playerHands в metadata хранит съеденные фигуры
- Drop moves - выставление фигуры из руки
- Пешки не могут быть выставлены на 1/8 горизонтали
- Наследование от StandardChessRuleSet

---

### Spec 2.3: Capablanca Chess (10x8)
**ID:** SPEC-RCC-001  
**Статус:** ⏳ Ожидает  
**Описание:** Шахматы на доске 10x8 с двумя новыми фигурами

**Требования:**
- Topology: rectangular-10x8
- Новые фигуры: Chancellor (R+N), Archbishop (B+N)
- Initial setup на 10-клеточной горизонтали

---

## 🌐 Этап 3: Онлайн и мультиплеер

### Spec 3.1: Синхронизация состояния (State Sync)
**ID:** SPEC-ONL-001  
**Статус:** ⏳ Ожидает  
**Описание:** Механизмы синхронизации состояния игры между клиентами

**Требования:**
- Serializable GameState для передачи по сети
- Дельта-компрессия ходов (только изменения)
- Conflict resolution при рассинхронизации
- Replay system для воспроизведения игр

**Критерии приемки:**
- [ ] serializeState()/deserializeState() работают корректно
- [ ] Delta encoding уменьшает размер данных >50%
- [ ] Воспроизведение игры из серии ходов

---

### Spec 3.2: WebSocket Protocol
**ID:** SPEC-ONL-002  
**Статус:** ⏳ Ожидает  
**Описание:** Протокол обмена сообщениями для онлайн-игры

**Требования:**
- Типы сообщений: join, move, resign, draw-offer, chat
- Room management (лобби, spectating)
- Turn timer synchronization
- Reconnection handling с восстановлением состояния

**Критерии приемки:**
- [ ] Клиент может подключиться к комнате
- [ ] Ходы передаются и применяются у всех игроков
- [ ] Обработка разрыва соединения

---

### Spec 3.3: Matchmaking System
**ID:** SPEC-ONL-003  
**Статус:** ⏳ Ожидает  
**Описание:** Система подбора соперников

**Требования:**
- Rating-based matchmaking (Elo/Glicko)
- Queue management с приоритетами
- Time control selection (bullet, blitz, rapid, classical)
- Variant selection (Standard, Chess960, Crazyhouse)

---

### Spec 3.4: Tournament System
**ID:** SPEC-ONL-004  
**Статус:** ⏳ Ожидает  
**Описание:** Система турниров

**Требования:**
- Round-robin и knockout форматы
- Auto-pairing после каждого раунда
- Standings table с очками
- Tournament chat и announcements

---

## 🎨 Этап 4: Рендереры и UI компоненты

### Spec 4.1: Canvas Renderer
**ID:** SPEC-REN-001  
**Статус:** ⏳ Ожидает  
**Описание:** Высокопроизводительный рендерер на Canvas API

**Требования:**
- Отрисовка доски и фигур на Canvas
- Animation system для ходов и эффектов
- Responsive scaling под разные экраны
- Support для разных топологий (rectangular, hex)

**Критерии приемки:**
- [ ] 60 FPS при отрисовке анимаций
- [ ] Поддержка touch events для мобильных
- [ ] Темы оформления (светлая, темная, цветная)

---

### Spec 4.2: SVG Renderer
**ID:** SPEC-REN-002  
**Статус:** ⏳ Ожидает  
**Описание:** Векторный рендерер на SVG

**Требования:**
- SVG элементы для каждой клетки и фигуры
- CSS animations для плавных переходов
- Accessibility (ARIA labels, keyboard navigation)
- Экспорт позиции как SVG/PNG

---

### Spec 4.3: DOM Renderer (Lightweight)
**ID:** SPEC-REN-003  
**Статус:** ⏳ Ожидает  
**Описание:** Легковесный рендерер на DOM элементах

**Требования:**
- Div-клетки с CSS grid/flexbox
- Минимальные перерисовки (virtual DOM подход)
- Поддержка для простых приложений и SSR

---

### Spec 4.4: Vue.js Components
**ID:** SPEC-REN-004  
**Статус:** ⏳ Ожидает  
**Описание:** Готовые Vue 3 компоненты для vue-chess

**Требования:**
- <ChessBoard> компонент с пропсами
- <ChessSquare>, <ChessPiece> компоненты
- Slots для кастомизации
- Events: move, select, hover

---

### Spec 4.5: React Components
**ID:** SPEC-REN-005  
**Статус:** ⏳ Ожидает  
**Описание:** Готовые React компоненты

**Требования:**
- Функциональные компоненты с хуками
- TypeScript типы для пропсов
- Поддержка React 18+ features
- Публикация как отдельный npm пакет

---

## ⚡ Этап 5: Оптимизации и производительность

### Spec 5.1: Move Generation Optimization
**ID:** SPEC-OPT-001  
**Статус:** ⏳ Ожидает  
**Описание:** Оптимизация генерации ходов

**Требования:**
- Bitboard representation для позиций
- Lookup tables для псевдолегальных ходов
- Incremental update при выполнении хода
- SIMD инструкции где возможно

**Критерии приемки:**
- [ ] Генерация ходов < 100μs для мидшпиля
- [ ] Memory usage < 10MB для глубокого анализа
- [ ] Benchmarks в CI

---

### Spec 5.2: Transposition Table
**ID:** SPEC-OPT-002  
**Статус:** ⏳ Ожидает  
**Описание:** Таблица транспозиций для AI

**Требования:**
- Zobrist hashing для позиций
- LRU cache для управления памятью
- Store: depth, score, bestMove, flag (exact/lower/upper)
- Serialisation для сохранения между сессиями

---

### Spec 5.3: Web Workers Integration
**ID:** SPEC-OPT-003  
**Статус:** ⏳ Ожидает  
**Описание:** Вынос вычислений в Web Workers

**Требования:**
- Worker pool для параллельных вычислений
- Message protocol для коммуникации
- Progress reporting для долгих операций
- Fallback на main thread если workers недоступны

---

### Spec 5.4: Bundle Size Optimization
**ID:** SPEC-OPT-004  
**Статус:** ⏳ Ожидает  
**Описание:** Минимизация размера бандлов

**Требования:**
- Tree-shaking для всех пакетов
- Code splitting по функциональности
- Lazy loading для тяжелых модулей
- Target bundle sizes: core < 30KB, renderer < 50KB

---

### Spec 5.5: Memory Management
**ID:** SPEC-OPT-005  
**Статус:** ⏳ Ожидает  
**Описание:** Оптимизация использования памяти

**Требования:**
- Object pooling для частых аллокаций (Move, Position)
- Immutable data structures с structural sharing
- Garbage collection friendly patterns
- Memory leak detection в тестах

---

## 🧩 Этап 6: Инфраструктура и инструменты

### Spec 6.1: Тестовый фреймворк
**ID:** SPEC-INF-001  
**Статус:** ⏳ Ожидает  
**Описание:** Настройка Vitest для всех пакетов

**Требования:**
- vitest.config.ts в каждом пакете
- Coverage reports с порогом 90%
- CI integration (GitHub Actions)
- Performance benchmarks в CI

---

### Spec 6.2: Утилиты для тестирования
**ID:** SPEC-INF-002  
**Статус:** ⏳ Ожидает  
**Описание:** Helpers для написания тестов

**Требования:**
- createTestGame() - быстрая настройка позиции
- assertMoveLegal() / assertMoveIllegal()
- FEN parser/exporter для стандартных шахмат
- PGN parser/exporter для записи игр

---

### Spec 6.3: Документация
**ID:** SPEC-INF-003  
**Статус:** ⏳ Ожидает  
**Описание:** API docs и примеры

**Требования:**
- TypeDoc генерация для всех пакетов
- Examples папка с рабочими примерами
- Migration guide от old chess-engine
- Interactive playground (StackBlitz/CodeSandbox)

---

### Spec 6.4: CLI Tools
**ID:** SPEC-INF-004  
**Статус:** ⏳ Ожидает  
**Описание:** Командная строка для работы с ядром

**Требования:**
- chess-kernel analyze <fen> - анализ позиции
- chess-kernel play <fen> <move> - выполнить ход
- chess-kernel validate <pgn> - валидация PGN
- chess-kernel benchmark - тест производительности

---

## 📊 Метрики качества

| Метрика | Target | Current |
|---------|--------|---------|
| Test Coverage | >90% | TBD |
| Build Time | <5s | TBD |
| Bundle Size (core) | <30KB | TBD |
| Bundle Size (renderer) | <50KB | TBD |
| Move Generation | <100μs | TBD |
| FPS (Canvas renderer) | 60 | TBD |
| TypeScript Errors | 0 | TBD |

---

## 🗓️ Timeline (Estimated)

| Этап | Спринты | Приоритет |
|------|---------|-----------|
| Этап 1: rules-chess-standard | 2-3 | 🔴 High |
| Этап 2: Variants (Chess960, Crazyhouse, Capablanca) | 3-4 | 🟡 Medium |
| Этап 3: Online & Multiplayer | 4-5 | 🔴 High |
| Этап 4: Renderers & UI Components | 3-4 | 🟡 Medium |
| Этап 5: Optimizations | 3-4 | 🔴 High |
| Этап 6: Infrastructure | 2-3 | 🟢 Low (параллельно) |

---

## 📝 Notes

- Использовать **Documentation-Driven Development**: сначала спеки, потом код
- Каждый Spec = отдельная ветка Git
- Code review обязателен для каждого Spec
- TDD: тесты пишутся до реализации
- Приоритет на онлайн-функциональность и производительность
- Гексагональные шахматы отложены на будущее (low priority)

---

**Последнее обновление:** 2024  
**Статус:** Активная разработка  
**Владелец:** Chess Kernel Team
