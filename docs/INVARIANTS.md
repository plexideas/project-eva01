1. Source of truth: состояние кейса и значения полей изменяются только через операции engine (создание/обновление/transition), а не напрямую.

2. Audit is mandatory: каждое изменение кейса (files / state) порождает как минимум одно CaseEvent. Нет изменений без события.

3. Immutability of events: события неизменяемы и только добавляются (append-only). Исправления — новыми событиями.

4. Workflow validity: case.state всегда принадлежит workflow.states.

5. Transition validity: смена состояния возможна только по transition, определённому в workflow.transitions.

6. AI is advisory: AI не может менять Case напрямую. AI может создавать только Suggestion и связанные события.

7. Human confirmation: любая “операционная” рекомендация AI (категория, маршрут, извлечение полей) становится фактом только после явного решения человека (accept/reject).

8. Versioned workflow: workflow имеет версию; изменение workflow не должно ломать (например: удаление state/transition, изменение semantics условий) существующие кейсы без миграции/политики совместимости.