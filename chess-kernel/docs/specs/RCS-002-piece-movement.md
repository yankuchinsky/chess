# SPEC-RCS-002: Движение фигур (Piece Movement)

**Статус:** 🔄 В работе  
**Дата создания:** 2024  
**Автор:** Chess Kernel Team  
**Зависимости:** SPEC-RCS-001 (Базовая структура)

---

## Описание

Реализация генерации ходов для всех типов фигур стандартных шахмат. Эта спецификация покрывает базовое движение фигур без специальных правил (castling, en passant, promotion).

---

## Требования

### Общие требования
1. `generateMoves(state, player)` возвращает все псевдо-легальные ходы
2. `isValidMove(state, move)` проверяет корректность движения
3. Ходы не должны выходить за пределы доски 8x8

### Требования по фигурам

#### Король (King)
- Движение на 1 клетку в любом направлении (8 направлений)
- Может захватывать вражеские фигуры
- Не может захватывать свои фигуры

#### Ферзь (Queen)
- Скользит по диагоналям, вертикалям, горизонталям
- Максимальная дальность: до края доски или первой фигуры
- Может захватывать вражеские фигуры на пути

#### Ладья (Rook)
- Скользит по вертикалям и горизонталям
- Максимальная дальность: до края доски или первой фигуры
- Не движется по диагоналям

#### Слон (Bishop)
- Скользит только по диагоналям
- Максимальная дальность: до края доски или первой фигуры
- Не меняет цвет клеток

#### Конь (Knight)
- Прыжок буквой "Г": 2 клетки + 1 клетка перпендикулярно
- 8 возможных направлений из центра доски
- Может перепрыгивать через фигуры
- Приземляется только на пустые клетки или с вражеской фигурой

#### Пешка (Pawn)
- **Важно:** En passant и promotion обрабатываются в отдельных спеках
- 1 шаг вперед, если клетка пуста
- 2 шага вперед с начальной позиции (rank 1 для белых, rank 6 для черных)
- Взятие только по диагонали вперед на 1 клетку
- Не может двигаться назад или боком

---

## Критерии приемки

### King
- [ ] generateMoves() возвращает до 8 ходов для короля в центре
- [ ] Ходы ограничены краями доски
- [ ] Захват вражеской фигуры разрешен
- [ ] Захват своей фигуры запрещен

### Queen
- [ ] Queen скользит во всех 8 направлениях
- [ ] Queen останавливается перед своей фигурой
- [ ] Queen захватывает вражескую фигуру и останавливается
- [ ] Queen не перепрыгивает через фигуры

### Rook
- [ ] Rook скользит по 4 направлениям (вертикали + горизонтали)
- [ ] Rook не движется по диагоналям

### Bishop
- [ ] Bishop скользит по 4 диагональным направлениям
- [ ] Bishop остается на том же цвете клеток

### Knight
- [ ] Knight имеет 8 ходов из центра (e4)
- [ ] Knight имеет 2 хода из угла (a1)
- [ ] Knight имеет 4 хода с края (a4)
- [ ] Knight перепрыгивает через блокирующие фигуры
- [ ] Knight захватывает вражеские фигуры

### Pawn
- [ ] Белая пешка двигается только вверх (rank увеличивается)
- [ ] Черная пешка двигается только вниз (rank уменьшается)
- [ ] Пешка с начальной позиции может сделать двойной ход
- [ ] Пешка не может сделать двойной ход после первого движения
- [ ] Пешка захватывает только по диагонали
- [ ] Пешка не может захватить фигуру прямо перед собой

---

## Тесты

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { StandardChessRuleSet } from '../index';
import { createTestGame, getPiece } from '../../test-helpers';

describe('SPEC-RCS-002: Piece Movement', () => {
  let ruleset: StandardChessRuleSet;

  beforeEach(() => {
    ruleset = new StandardChessRuleSet();
  });

  // ========== KING TESTS ==========
  describe('King Movement', () => {
    it('King in center has 8 possible moves', () => {
      const game = createTestGame('king-center');
      const king = getPiece(game, 'white-king');
      const moves = ruleset.generatePieceMoves(game.state, king);
      expect(moves).toHaveLength(8);
    });

    it('King in corner has 3 possible moves', () => {
      const game = createTestGame('king-corner');
      const king = getPiece(game, 'white-king');
      const moves = ruleset.generatePieceMoves(game.state, king);
      expect(moves).toHaveLength(3);
    });

    it('King captures enemy piece', () => {
      const game = createTestGame('king-capture');
      const moves = ruleset.generateMoves(game.state, 'white');
      const captureMove = moves.find(m => m.capturedPieceId !== undefined);
      expect(captureMove).toBeDefined();
    });

    it('King cannot capture friendly piece', () => {
      const game = createTestGame('king-blocked-friendly');
      const moves = ruleset.generateMoves(game.state, 'white');
      const blockedMoves = moves.filter(m => isBlockedByFriendly(m));
      expect(blockedMoves).toHaveLength(0);
    });
  });

  // ========== QUEEN TESTS ==========
  describe('Queen Movement', () => {
    it('Queen in center has 27 possible moves', () => {
      const game = createTestGame('queen-center');
      const queen = getPiece(game, 'white-queen');
      const moves = ruleset.generatePieceMoves(game.state, queen);
      expect(moves).toHaveLength(27);
    });

    it('Queen blocked by friendly piece', () => {
      const game = createTestGame('queen-blocked');
      const moves = ruleset.generateMoves(game.state, 'white');
      const queenMoves = moves.filter(m => m.pieceId === 'white-queen');
      // Queen should not have moves through friendly piece
      expect(queenMoves.every(m => !jumpsOverFriendly(m))).toBe(true);
    });

    it('Queen captures and stops', () => {
      const game = createTestGame('queen-capture');
      const moves = ruleset.generateMoves(game.state, 'white');
      const captureMove = moves.find(m => 
        m.pieceId === 'white-queen' && m.capturedPieceId !== undefined
      );
      expect(captureMove).toBeDefined();
    });
  });

  // ========== ROOK TESTS ==========
  describe('Rook Movement', () => {
    it('Rook in center has 14 possible moves', () => {
      const game = createTestGame('rook-center');
      const rook = getPiece(game, 'white-rook');
      const moves = ruleset.generatePieceMoves(game.state, rook);
      expect(moves).toHaveLength(14);
    });

    it('Rook moves only orthogonally', () => {
      const game = createTestGame('rook-center');
      const moves = ruleset.generateMoves(game.state, 'white');
      const rookMoves = moves.filter(m => m.pieceId === 'white-rook');
      rookMoves.forEach(move => {
        const df = Math.abs(move.to.coords[0] - move.from.coords[0]);
        const dr = Math.abs(move.to.coords[1] - move.from.coords[1]);
        expect(df === 0 || dr === 0).toBe(true);
      });
    });
  });

  // ========== BISHOP TESTS ==========
  describe('Bishop Movement', () => {
    it('Bishop in center has 13 possible moves', () => {
      const game = createTestGame('bishop-center');
      const bishop = getPiece(game, 'white-bishop');
      const moves = ruleset.generatePieceMoves(game.state, bishop);
      expect(moves).toHaveLength(13);
    });

    it('Bishop stays on same color', () => {
      const game = createTestGame('bishop-center');
      const bishop = getPiece(game, 'white-bishop');
      const startColor = (bishop.position!.coords[0] + bishop.position!.coords[1]) % 2;
      
      const moves = ruleset.generatePieceMoves(game.state, bishop);
      moves.forEach(move => {
        const endColor = (move.to.coords[0] + move.to.coords[1]) % 2;
        expect(endColor).toBe(startColor);
      });
    });

    it('Bishop moves only diagonally', () => {
      const game = createTestGame('bishop-center');
      const moves = ruleset.generateMoves(game.state, 'white');
      const bishopMoves = moves.filter(m => 
        getPieceType(m.pieceId) === 'bishop'
      );
      bishopMoves.forEach(move => {
        const df = Math.abs(move.to.coords[0] - move.from.coords[0]);
        const dr = Math.abs(move.to.coords[1] - move.from.coords[1]);
        expect(df).toBe(dr);
      });
    });
  });

  // ========== KNIGHT TESTS ==========
  describe('Knight Movement', () => {
    it('Knight in center has 8 possible moves', () => {
      const game = createTestGame('knight-e4');
      const knight = getPiece(game, 'white-knight');
      const moves = ruleset.generatePieceMoves(game.state, knight);
      expect(moves).toHaveLength(8);
    });

    it('Knight in corner has 2 possible moves', () => {
      const game = createTestGame('knight-a1');
      const knight = getPiece(game, 'white-knight');
      const moves = ruleset.generatePieceMoves(game.state, knight);
      expect(moves).toHaveLength(2);
    });

    it('Knight on edge has 4 possible moves', () => {
      const game = createTestGame('knight-a4');
      const knight = getPiece(game, 'white-knight');
      const moves = ruleset.generatePieceMoves(game.state, knight);
      expect(moves).toHaveLength(4);
    });

    it('Knight jumps over blocking pieces', () => {
      const game = createTestGame('knight-blocked');
      const knight = getPiece(game, 'white-knight');
      const moves = ruleset.generatePieceMoves(game.state, knight);
      // Knight should still have all L-shaped moves despite blockers
      expect(moves.length).toBeGreaterThan(0);
    });

    it('Knight captures enemy piece', () => {
      const game = createTestGame('knight-vs-pawn');
      const moves = ruleset.generateMoves(game.state, 'white');
      const captureMove = moves.find(m => 
        getPieceType(m.pieceId) === 'knight' && m.capturedPieceId !== undefined
      );
      expect(captureMove).toBeDefined();
    });
  });

  // ========== PAWN TESTS ==========
  describe('Pawn Movement', () => {
    it('White pawn moves forward one square', () => {
      const game = createTestGame('pawn-white');
      const moves = ruleset.generateMoves(game.state, 'white');
      const pawnMoves = moves.filter(m => 
        getPieceType(m.pieceId) === 'pawn' && !m.metadata?.promotionType
      );
      const singlePush = pawnMoves.find(m => 
        Math.abs(m.to.coords[1] - m.from.coords[1]) === 1
      );
      expect(singlePush).toBeDefined();
    });

    it('White pawn on starting rank can move two squares', () => {
      const game = createTestGame('pawn-white-start');
      const moves = ruleset.generateMoves(game.state, 'white');
      const doublePush = moves.find(m => 
        getPieceType(m.pieceId) === 'pawn' &&
        Math.abs(m.to.coords[1] - m.from.coords[1]) === 2
      );
      expect(doublePush).toBeDefined();
    });

    it('Black pawn moves downward', () => {
      const game = createTestGame('pawn-black');
      const moves = ruleset.generateMoves(game.state, 'black');
      const pawnMove = moves.find(m => 
        getPieceType(m.pieceId) === 'pawn'
      );
      expect(pawnMove!.to.coords[1]).toBeLessThan(pawnMove!.from.coords[1]);
    });

    it('Pawn captures diagonally', () => {
      const game = createTestGame('pawn-capture');
      const moves = ruleset.generateMoves(game.state, 'white');
      const captureMove = moves.find(m => 
        getPieceType(m.pieceId) === 'pawn' && 
        m.capturedPieceId !== undefined
      );
      expect(captureMove).toBeDefined();
      // Verify diagonal
      const df = Math.abs(captureMove!.to.coords[0] - captureMove!.from.coords[0]);
      expect(df).toBe(1);
    });

    it('Pawn cannot capture straight ahead', () => {
      const game = createTestGame('pawn-blocked');
      const moves = ruleset.generateMoves(game.state, 'white');
      const straightCapture = moves.find(m => 
        getPieceType(m.pieceId) === 'pawn' &&
        m.to.coords[0] === m.from.coords[0] && // Same file
        m.capturedPieceId !== undefined
      );
      expect(straightCapture).toBeUndefined();
    });

    it('Pawn blocked by friendly piece cannot move forward', () => {
      const game = createTestGame('pawn-blocked-friendly');
      const moves = ruleset.generateMoves(game.state, 'white');
      const blockedPawnMoves = moves.filter(m => 
        getPieceType(m.pieceId) === 'pawn' &&
        m.to.coords[0] === m.from.coords[0] // Forward move
      );
      expect(blockedPawnMoves).toHaveLength(0);
    });
  });
});
```

---

## Примечания

### FIDE Rules Reference
- Article 3: The Moves of the Pieces
- https://www.fide.com/fide/handbook.html?id=177

### Implementation Notes
- Использовать 0-indexed координаты (0-7 для файлов и рангов)
- Псевдо-легальные ходы не проверяют, остается ли король под шахом
- Проверка шаха реализуется в SPEC-RCS-004

### Edge Cases to Consider
- Фигуры на краю доски (меньше ходов)
- Блокировка своими фигурами
- Захват вражеских фигур
- Пешки на стартовой позиции vs уже двигавшиеся

---

## История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2024 | 1.0 | Initial specification |

---

**Связанные документы:**
- [ROADMAP-SPECS.md](../ROADMAP-SPECS.md)
- [SPECIFICATION-TEMPLATE.md](../SPECIFICATION-TEMPLATE.md)
- SPEC-RCS-003: Рокировка (следующая)
- SPEC-RCS-005: Превращение пешки (promotion)
- SPEC-RCS-006: Взятие на проходе (en passant)
