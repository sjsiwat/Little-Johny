# Johny Buddy — pose frames

Drop your exported pose images here as PNGs. The companion (`mascot.js`)
loads them automatically. **Any file that's missing falls back to
`../johny-cat.svg`**, so the buddy works even before you add these.

## Required filenames

| File           | Pose used for                                   |
| -------------- | ----------------------------------------------- |
| `idle.png`     | Default resting state (daytime)                 |
| `wave.png`     | Greeting on load, morning, and when clicked     |
| `happy.png`    | Task completed / save success 🎉                |
| `typing.png`   | While you type in the command bar               |
| `thinking.png` | While saving / syncing to cloud                 |
| `sleeping.png` | Idle for 45s, or late night 😴                  |

## Export tips

- **Square canvas** (e.g. 512×512), subject centered, **transparent background**.
- Keep the art style + framing consistent across poses so swaps look seamless.
- PNG with alpha. ~512px is plenty; the buddy renders at ~122px.
- Optional extras (`walk.png`, `run.png`) aren't wired yet — easy to add later.

After adding files, bump the cache version in `index.html`
(`mascot.js?v=1` → `?v=2`) if you don't see them update.
