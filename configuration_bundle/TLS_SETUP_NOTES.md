# TLS Setup Notes — Mac 2 (edge)

## Tool used
`mkcert` — generates a locally trusted development certificate authority (CA)
and leaf certificates signed by it. Avoids self-signed-certificate browser
warnings without needing a public CA.

## 1. Install and create the local CA
```bash
brew install mkcert nss
mkcert -install
```
This creates a root CA and installs it into Mac 2's system trust store.

## 2. Generate the certificate for the project domain
```bash
mkdir -p /opt/homebrew/etc/nginx/certs
cd /opt/homebrew/etc/nginx/certs
mkcert -cert-file app.pem -key-file app-key.pem app.parth.test api.parth.test
```
Produces `app.pem` (certificate) and `app-key.pem` (private key), valid for
both `app.parth.test` and `api.parth.test`. Referenced directly in
`nginx.conf`'s `ssl_certificate` / `ssl_certificate_key` directives.

## 3. Distribute the CA to every other Mac
TLS verification fails on any machine that hasn't been told to trust this
CA — the certificate itself is correct, but the issuer is unknown to that
machine's OS trust store until this step is done.

```bash
# On Mac 2 — export the CA root
cp "$(mkcert -CAROOT)/rootCA.pem" ~/Desktop/rootCA.pem
```
AirDrop (or otherwise transfer) `rootCA.pem` to Mac 1, Mac 3, and Mac 4.
On each of those machines:
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain ~/Downloads/rootCA.pem
```

**Non-standard curl installs:** if a Mac's `curl` is bundled with something
else (e.g. Anaconda) rather than the system binary, it may read its CA
bundle from its own install path instead of the system Keychain. Check
with `which curl` — if it points outside `/usr/bin`, append the CA to that
tool's own bundle as well, e.g.:
```bash
cat ~/Downloads/rootCA.pem >> /opt/anaconda3/ssl/cacert.pem
```

## 4. Verify
From any trusted client:
```bash
curl -v https://app.parth.test:8443/api/status
```
Look for `SSL certificate verify ok.` in the output. The final
demonstration must not use `-k` / `--insecure` — if that flag is needed,
the CA has not been trusted correctly on that machine.

## Handshake reference (for the viva)
```
ClientHello → ServerHello → Certificate → Key Exchange → Finished
```
nginx terminates TLS at the edge (Mac 2); traffic from nginx to the
backends (Mac 3 / Mac 4) runs as plain HTTP on the private LAN — this is
standard "TLS termination at the edge," the same pattern used by a cloud
load balancer in front of unencrypted internal services.
