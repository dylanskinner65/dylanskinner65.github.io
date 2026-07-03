# Raspberry Pi deployment

The site deploys **pull-based**: CI builds a `linux/arm64` image and pushes it to
GHCR (`ghcr.io/dylanskinner65/personal-website`); the Pi polls the registry with
`podman-auto-update` and restarts the container when a new digest lands. No
self-hosted runner, no inbound access — the Pi only makes outbound connections
(GHCR pulls + the Cloudflare tunnel).

```
push to main → Actions builds arm64 image → GHCR
                                              ↑ pull (every 5 min)
Pi: podman-auto-update.timer → website.container (Caddy, healthchecked)
    cloudflared.container ← Cloudflare edge ← visitor
```

The `*.container` / `*.network` files in this directory are
[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)
units — systemd owns the containers, so they survive reboots, restart on crash,
and roll back if a new image fails its healthcheck.

Requires podman ≥ 4.7 (for `Notify=healthy`).

## One-time setup

```bash
# 1. User services must run without a login session
loginctl enable-linger skinner

# 2. Tunnel token as a podman secret (never touches CI or the unit files)
podman secret create cloudflare-token /path/to/token-file
shred -u /path/to/token-file

# 3. Install the units
mkdir -p ~/.config/containers/systemd
cp pi/website.network pi/website.container pi/cloudflared.container ~/.config/containers/systemd/
systemctl --user daemon-reload
systemctl --user start website.service cloudflared.service

# 4. Verify
podman ps                                             # both up, website (healthy)
podman exec cloudflared wget -qO- http://website:8080 | head -5
```

Then in Cloudflare Zero Trust → Networks → Tunnels → public hostname for
dylanskinner.dev, set the service URL to `http://website:8080` (container DNS
name on the shared `website` network — the containers no longer share a pod's
localhost, and no host ports are published).

## Auto-update loop

```bash
systemctl --user edit podman-auto-update.timer
```

```ini
[Timer]
OnCalendar=
OnCalendar=*:0/5
RandomizedDelaySec=0
Persistent=true
```

```bash
systemctl --user enable --now podman-auto-update.timer
podman auto-update --dry-run
```

Deploys land within ~5 minutes of a push to main. If a new image fails its
healthcheck, auto-update rolls back to the previous image; check
`journalctl --user -u podman-auto-update.service`.

Manual rollback to a specific commit:

```bash
podman pull ghcr.io/dylanskinner65/personal-website:<sha>
podman tag ghcr.io/dylanskinner65/personal-website:<sha> ghcr.io/dylanskinner65/personal-website:latest
systemctl --user restart website.service
```

(Or revert the commit on main and let the loop deploy it.)

## Housekeeping

- Superseded image layers accumulate; prune weekly:
  `crontab -e` → `0 3 * * 0 podman image prune -f`
- External uptime monitor (UptimeRobot / healthchecks.io) on
  https://dylanskinner.dev — self-hosting means you are the pager.
