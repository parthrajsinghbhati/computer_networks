# Backend Launch Instructions — Mac 3 (Backend A) and Mac 4 (Backend B)

Both machines run the **same** `backend.js` file; only the environment
variables differ. Source is in `backend.js` alongside this file (and
pushed to GitHub separately — see Backend Source Code deliverable).

## Requirements
```bash
brew install node
```

## Run — Mac 3 (Backend A)
```bash
cd ~/cn-backend
BACKEND_ID=A PORT=3001 node backend.js
```
Expected: `Backend A listening on 0.0.0.0:3001`

## Run — Mac 4 (Backend B)
```bash
cd ~/cn-backend
BACKEND_ID=B PORT=3002 node backend.js
```
Expected: `Backend B listening on 0.0.0.0:3002`

## Important
- Must bind to `0.0.0.0`, not `127.0.0.1` / `localhost` — otherwise nginx
  on Mac 2 cannot reach it, even though local testing (`curl localhost:3001`)
  would appear to work fine.
- Ports are fixed: 3001 for A, 3002 for B. These must match the `upstream`
  block in `nginx.conf`.

## Endpoints implemented
| Endpoint | Behavior |
|---|---|
| `GET /` | `{ "message": "Backend <ID> is running" }` |
| `GET /api/status` | `{ "backend": "<ID>", "status": "ok" }` + `X-Backend: <ID>` header |
| `GET /api/cached` | `Cache-Control: max-age=60`, `ETag: "cn-v1"`; returns `304` on a matching `If-None-Match` |

## Verify locally before involving the rest of the system
```bash
curl -i http://localhost:3001/api/status   # on Mac 3
curl -i http://localhost:3002/api/status   # on Mac 4
```
Both should return `200` with the correct `X-Backend` value.

## Stopping / restarting (used in the failure demos)
`Ctrl+C` in the terminal running the process stops it immediately — this
is exactly how "one backend down" and "both backends down" are simulated.
Restart with the same command used to start it.
