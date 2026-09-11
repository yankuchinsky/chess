# SPEC-RCS-001: Базовая структура пакета rules-chess-standard

**Статус:** ✅ Выполнено  
**Дата создания:** 2024  
**Автор:** Chess Kernel Team  
**Зависимости:** Нет

---

## Описание

Создание базовой структуры пакета `@chess-kernel/rules-chess-standard` с настройкой зависимостей, конфигурации и экспортом основных типов.

---

## Требования

1. Пакет должен быть создан в `packages/rules-chess-standard/`
2. Должен зависеть от `@chess-kernel/core`
3. Должен экспортировать константы типов фигур
4. TypeScript конфигурация должна быть совместима с chess-kernel

---

## Критерии приемки

- [x] `package.json` создан с правильными полями:
  - name: `@chess-kernel/rules-chess-standard`
  - version: `0.1.0`
  - peerDependencies: `@chess-kernel/core`
  - scripts: build, test, dev
- [x] `tsconfig.json` настроен с extends из chess-kernel
- [x] `src/index.ts` экспортирует PIECE_TYPES константы
- [x] Сборка проходит без ошибок (`npm run build`)
- [x] Типы экспортируются корректно

---

## Реализация

### Файловая структура

```
packages/rules-chess-standard/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

### Ключевой код

```typescript
// src/index.ts
export const PIECE_TYPES = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn'
} as const;
```

---

## Тесты

Базовые тесты не требуются для этой спецификации (структурная).

---

## Примечания

- Это foundation spec для всех последующих спецификаций правил
- Следующая спецификация: SPEC-RCS-002 (Движение фигур)

---

## История изменений

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2024 | 1.0 | Initial specification |

---

**Связанные документы:**
- [ROADMAP-SPECS.md](../ROADMAP-SPECS.md)
- [SPECIFICATION-TEMPLATE.md](../SPECIFICATION-TEMPLATE.md)
