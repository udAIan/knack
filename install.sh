#!/bin/sh
# Links the knack CLI into ~/.local/bin. Plain sh, so it can explain a missing or old Node.
set -eu

KNACK_ROOT=$(cd "$(dirname "$0")" && pwd -P)
CLI="$KNACK_ROOT/src/cli.ts"
BIN_DIR="$HOME/.local/bin"

if ! command -v node >/dev/null 2>&1; then
  echo "knack needs Node 22.18 or newer, and Node isn't installed." >&2
  exit 1
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 18) ? 0 : 1)'; then
  echo "knack needs Node 22.18 or newer, and this shell has $(node --version). Upgrade Node, then run this again." >&2
  exit 1
fi

for name in knack knk; do
  link="$BIN_DIR/$name"
  if [ -L "$link" ] && [ "$(readlink "$link")" = "$CLI" ]; then
    continue
  fi
  if [ -L "$link" ]; then
    echo "$link already exists and points to $(readlink "$link"). Remove it, then run this again." >&2
    exit 1
  fi
  if [ -e "$link" ]; then
    echo "$link already exists. Remove it, then run this again." >&2
    exit 1
  fi
done

mkdir -p "$BIN_DIR"
for name in knack knk; do
  [ -L "$BIN_DIR/$name" ] || ln -s "$CLI" "$BIN_DIR/$name"
done

case ":$PATH:" in
  *":$BIN_DIR:"*)
    echo 'Installed knack. Run "knack help" to see the commands.'
    ;;
  *)
    echo "Installed knack in $BIN_DIR, which isn't on your PATH yet."
    echo "Add this line to your shell profile (~/.zshrc or ~/.bashrc), then open a new terminal:"
    echo '  export PATH="$HOME/.local/bin:$PATH"'
    ;;
esac
