#!/bin/sh
# Links the knack CLI into ~/.local/bin and the bundled knack skill into the agents' skill folders.
# Plain sh, so it can explain a missing or old Node.
set -eu

KNACK_ROOT=$(cd "$(dirname "$0")" && pwd -P)
CLI="$KNACK_ROOT/src/cli.ts"
SKILL="$KNACK_ROOT/skills/knack"
BIN_DIR="$HOME/.local/bin"

if ! command -v node >/dev/null 2>&1; then
  echo "knack needs Node 22.18 or newer, and Node isn't installed." >&2
  exit 1
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 18) ? 0 : 1)'; then
  echo "knack needs Node 22.18 or newer, and this shell has $(node --version). Upgrade Node, then run this again." >&2
  exit 1
fi

check_link() {
  if [ -L "$1" ] && [ "$(readlink "$1")" = "$2" ]; then
    return 0
  fi
  if [ -L "$1" ]; then
    echo "$1 already exists and points to $(readlink "$1"). Remove it, then run this again." >&2
    exit 1
  fi
  if [ -e "$1" ]; then
    echo "$1 already exists. Remove it, then run this again." >&2
    exit 1
  fi
}

make_link() {
  if [ ! -L "$1" ]; then
    mkdir -p "$(dirname "$1")"
    ln -s "$2" "$1"
  fi
}

check_link "$BIN_DIR/knack" "$CLI"
check_link "$BIN_DIR/knk" "$CLI"
check_link "$HOME/.claude/skills/knack" "$SKILL"
check_link "$HOME/.agents/skills/knack" "$SKILL"

make_link "$BIN_DIR/knack" "$CLI"
make_link "$BIN_DIR/knk" "$CLI"
make_link "$HOME/.claude/skills/knack" "$SKILL"
make_link "$HOME/.agents/skills/knack" "$SKILL"

case ":$PATH:" in
  *":$BIN_DIR:"*)
    echo 'Installed knack and its skill. Run "knack help" to see the commands.'
    ;;
  *)
    echo "Installed knack and its skill. The CLI is in $BIN_DIR, which isn't on your PATH yet."
    echo "Add this line to your shell profile (~/.zshrc or ~/.bashrc), then open a new terminal:"
    echo '  export PATH="$HOME/.local/bin:$PATH"'
    ;;
esac
