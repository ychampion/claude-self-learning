#!/bin/bash
# Quick validation of plugin structure
# Usage: ./scripts/test-plugin.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "Claude Self-Learning Plugin Validator"
echo "========================================"
echo ""

PASSED=0
FAILED=0

pass() { echo "[PASS] $1"; ((PASSED++)); }
fail() { echo "[FAIL] $1"; ((FAILED++)); }

# Check plugin.json
echo "Checking plugin.json..."
if [ -f "$PLUGIN_DIR/plugin.json" ]; then
    if jq empty "$PLUGIN_DIR/plugin.json" 2>/dev/null; then
        pass "plugin.json is valid JSON"
        NAME=$(jq -r '.name' "$PLUGIN_DIR/plugin.json")
        VERSION=$(jq -r '.version' "$PLUGIN_DIR/plugin.json")
        pass "Plugin: $NAME v$VERSION"
    else
        fail "plugin.json is not valid JSON"
    fi
else
    fail "plugin.json not found"
fi

# Check commands
echo ""
echo "Checking commands..."
for CMD in learn update-skill list-skills; do
    [ -f "$PLUGIN_DIR/commands/$CMD.md" ] && pass "commands/$CMD.md" || fail "commands/$CMD.md missing"
done

# Check agents
echo ""
echo "Checking agents..."
for AGENT in researcher skill-generator; do
    [ -f "$PLUGIN_DIR/agents/$AGENT.md" ] && pass "agents/$AGENT.md" || fail "agents/$AGENT.md missing"
done

# Check skills
echo ""
echo "Checking skills..."
[ -f "$PLUGIN_DIR/skills/self-learning/SKILL.md" ] && pass "skills/self-learning/SKILL.md" || fail "SKILL.md missing"

# Check scripts
echo ""
echo "Checking scripts..."
for SCRIPT in verify-sources.sh update-all.sh generate-skill.sh test-integration.sh; do
    [ -f "$PLUGIN_DIR/scripts/$SCRIPT" ] && pass "scripts/$SCRIPT" || fail "scripts/$SCRIPT missing"
done

# Check docs
echo ""
echo "Checking documentation..."
for DOC in README.md CLAUDE.md CHANGELOG.md LICENSE; do
    [ -f "$PLUGIN_DIR/$DOC" ] && pass "$DOC" || fail "$DOC missing"
done

# Check storage
echo ""
echo "Checking storage..."
[ -d "$PLUGIN_DIR/storage/skills" ] && pass "storage/skills directory" || fail "storage/skills missing"

echo ""
echo "========================================"
echo "Results: $PASSED passed, $FAILED failed"
echo "========================================"

[ $FAILED -eq 0 ] && echo "Plugin validation PASSED" || echo "Plugin validation FAILED"
exit $FAILED
