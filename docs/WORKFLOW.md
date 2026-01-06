## Workflow
- Workflow описывается `WorkflowDefinition`:
  - `version`
  - `initialState`
  - `states[]`
  - `transitions[]`
- Transition — directed edge `from → to`, опционально с `conditions[]` (пока как ключи).

## States
- `new` — вход получен, ещё не структурирован
- `triage` — первичная квалификация (человек)
- `in_progress` — работа по кейсу начата
- `resolved` — решение найдено
- `closed` — зафиксировано и закрыто

## Transitions
- `new -> triage`
- `triage -> in_progress`
- `in_progress -> resolved`
- `resolved -> closed`
- `triage -> closed` (если “не наш кейс / дубликат”)
- `in_progress -> triage` (если требуется переквалификация)

|from|to|who|why|
|---|---|---|---|
|`new`|`triage`|human|???|
|`triage`|`in_progress`|???|???|
|`in_progress`|`resolved`|???|???|
|`resolved`|`closed`|???|???|
|`triage`|`closed`|???|???|
|`in_progress`|`triage`|???|???|