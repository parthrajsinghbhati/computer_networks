# Configuration Bundle — Private Network Service Platform (Phase 1)

## Team Members

| #   | Enrollment Number | Name                 | Role                                             | Machine |
| --- | ----------------- | -------------------- | ------------------------------------------------ | ------- |
| 1   | 2401010320        | Parthraj Singh Bhati | DNS Server (dnsmasq)                             | Mac 1   |
| 2   | 2401020095        | Himanshu Pandey      | Edge — reverse proxy, load balancer, TLS (nginx) | Mac 2   |
| 3   | 2401010202        | Jivit Rana           | Backend A (REST API)                             | Mac 3   |
| 4   | 2401010427        | Satya Yadav          | Backend B (REST API)                             | Mac 4   |

## Files

| File                             | Belongs on                       | Purpose                                           |
| -------------------------------- | -------------------------------- | ------------------------------------------------- |
| `dnsmasq.conf`                   | Mac 1                            | Private DNS server config                         |
| `nginx.conf`                     | Mac 2                            | Edge reverse proxy + load balancer + TLS config   |
| `TLS_SETUP_NOTES.md`             | Mac 2 (+ trust step on all Macs) | How the TLS certificate was generated and trusted |
| `backend.js`                     | Mac 3 and Mac 4                  | REST API source (same file, different env vars)   |
| `BACKEND_LAUNCH_INSTRUCTIONS.md` | Mac 3 and Mac 4                  | How to run `backend.js` correctly                 |

Domain: `app.parth.test` / `api.parth.test`. Edge: `10.7.6.108:8443`.
DNS server: `10.7.26.66:53`.

## How to run the backends

**Requirements (Mac 3 and Mac 4):**

```bash
brew install node
```

**Mac 3 — Backend A:**

```bash
cd ~/cn-backend
BACKEND_ID=A PORT=3001 node backend.js
```

Expected output: `Backend A listening on 0.0.0.0:3001`

**Mac 4 — Backend B:**

```bash
cd ~/cn-backend
BACKEND_ID=B PORT=3002 node backend.js
```

Expected output: `Backend B listening on 0.0.0.0:3002`

**Important:** must bind to `0.0.0.0`, not `127.0.0.1`/`localhost` — otherwise nginx on Mac 2 cannot reach it, even though `curl localhost:3001` would appear to work fine locally. Ports are fixed (3001 = A, 3002 = B) and must match the `upstream` block in `nginx.conf`.

**Verify locally before involving the rest of the system:**

```bash
curl -i http://localhost:3001/api/status   # on Mac 3
curl -i http://localhost:3002/api/status   # on Mac 4
```

See the accompanying **Architecture Document** for the topology diagram, machine-role table, and protocol-layer flow diagram.
