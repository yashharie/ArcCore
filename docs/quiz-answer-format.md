# Quiz Question & Answer Format (Draft)

Each question has: `type`, `text`, `options`, `correctAnswer`, `marks`.
The student's submitted answer uses the SAME shape as `correctAnswer`.

## 1. MCQ (one correct answer)
```json
{
  "type": "MCQ",
  "options": [
    { "id": "a", "text": "Paris" },
    { "id": "b", "text": "London" }
  ],
  "correctAnswer": { "optionId": "a" }
}
```
Student answer: `{ "optionId": "b" }`

## 2. TRUE_FALSE
```json
{
  "type": "TRUE_FALSE",
  "options": null,
  "correctAnswer": { "value": true }
}
```
Student answer: `{ "value": false }`

## 3. DROPDOWN
```json
{
  "type": "DROPDOWN",
  "options": [
    { "id": "a", "text": "HTTP" },
    { "id": "b", "text": "FTP" }
  ],
  "correctAnswer": { "optionId": "a" }
}
```
Student answer: `{ "optionId": "b" }`

## 4. FILL_BLANK
Question text uses `___` for each blank.
```json
{
  "type": "FILL_BLANK",
  "text": "The capital of France is ___.",
  "options": { "caseSensitive": false },
  "correctAnswer": { "blanks": [["Paris", "paris"]] }
}
```
Each blank has a list of accepted answers.
Student answer: `{ "blanks": ["Paris"] }`

## 5. MATCHING
```json
{
  "type": "MATCHING",
  "options": {
    "left":  [{ "id": "l1", "text": "HTML" }, { "id": "l2", "text": "CSS" }],
    "right": [{ "id": "r1", "text": "Styling" }, { "id": "r2", "text": "Structure" }]
  },
  "correctAnswer": {
    "pairs": [
      { "left": "l1", "right": "r2" },
      { "left": "l2", "right": "r1" }
    ]
  }
}
```
Student answer: `{ "pairs": [{ "left": "l1", "right": "r1" }, ...] }`

## Open questions for Member 4
- Matching / fill-blank: partial marks or all-or-nothing?
- Fill-blank: trim spaces and ignore case by default?