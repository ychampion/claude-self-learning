#!/bin/bash
# Integration tests for the self-learning plugin
# Usage: ./scripts/test-integration.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "Integration Tests - Claude Self-Learning"
echo "========================================"
echo ""

PASSED=0
FAILED=0

pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Test 1: Verify Tavily scripts exist
echo "Test 1: Checking Tavily integration..."
TAVILY_SEARCH="$HOME/.agents/skills/search/scripts/search.sh"
TAVILY_EXTRACT="$HOME/.agents/skills/extract/scripts/extract.sh"

if [ -f "$TAVILY_SEARCH" ]; then
    pass "Tavily search script found: $TAVILY_SEARCH"
else
    fail "Tavily search script not found: $TAVILY_SEARCH"
    info "Install Tavily skills or configure paths in agents/researcher.md"
fi

if [ -f "$TAVILY_EXTRACT" ]; then
    pass "Tavily extract script found: $TAVILY_EXTRACT"
else
    fail "Tavily extract script not found: $TAVILY_EXTRACT"
    info "Install Tavily skills or configure paths in agents/researcher.md"
fi

echo ""

# Test 2: Check environment variables
echo "Test 2: Checking environment variables..."
if [ -n "$TAVILY_API_KEY" ]; then
    pass "TAVILY_API_KEY is set"
else
    fail "TAVILY_API_KEY not set"
    info "Set TAVILY_API_KEY environment variable"
fi

# Check fallback keys (optional)
if [ -n "$TAVILY_API_KEY_FALLBACK_1" ]; then
    pass "TAVILY_API_KEY_FALLBACK_1 is set (optional)"
else
    info "TAVILY_API_KEY_FALLBACK_1 not set (optional)"
fi

echo ""

# Test 3: Test storage directory creation
echo "Test 3: Testing storage..."
TEST_DIR="$PLUGIN_DIR/storage/skills/_test_skill_$$"
mkdir -p "$TEST_DIR"
if [ -d "$TEST_DIR" ]; then
    pass "Can create skill directories"
    rm -rf "$TEST_DIR"
else
    fail "Cannot create skill directories"
fi

echo ""

# Test 4: Test meta.json creation
echo "Test 4: Testing metadata files..."
TEST_META="$PLUGIN_DIR/storage/skills/_test_meta_$$/test.meta.json"
mkdir -p "$(dirname "$TEST_META")"
cat > "$TEST_META" << 'EOF'
{
  "created": "2026-02-07T00:00:00Z",
  "topic": "test",
  "version": "1.0.0",
  "sources": []
}
EOF

if [ -f "$TEST_META" ] && jq empty "$TEST_META" 2>/dev/null; then
    pass "Can create and validate meta.json"
    rm -rf "$(dirname "$TEST_META")"
else
    fail "Cannot create valid meta.json"
fi

echo ""

# Test 5: Test git integration
echo "Test 5: Testing git integration..."
cd "$PLUGIN_DIR"
if git rev-parse --git-dir > /dev/null 2>&1; then
    pass "Plugin is in a git repository"

    # Check if we can stage files
    touch "$PLUGIN_DIR/storage/.test_$$"
    if git add "$PLUGIN_DIR/storage/.test_$$" 2>/dev/null; then
        pass "Can stage files for commit"
        git reset HEAD "$PLUGIN_DIR/storage/.test_$$" 2>/dev/null || true
    else
        fail "Cannot stage files"
    fi
    rm -f "$PLUGIN_DIR/storage/.test_$$"
else
    fail "Plugin not in a git repository"
fi

echo ""

# Test 6: Validate skill template
echo "Test 6: Validating skill template..."
TEMPLATE="$PLUGIN_DIR/skills/self-learning/references/skill_template.md"
if [ -f "$TEMPLATE" ]; then
    # Check for required sections in template
    SECTIONS=("Quick Reference" "Installation" "Authentication" "Basic Usage" "Best Practices" "Common Errors")
    ALL_FOUND=true

    for SECTION in "${SECTIONS[@]}"; do
        if grep -q "## $SECTION" "$TEMPLATE" || grep -q "## <$SECTION" "$TEMPLATE" || grep -q "$SECTION" "$TEMPLATE"; then
            : # Section found
        else
            fail "Template missing section: $SECTION"
            ALL_FOUND=false
        fi
    done

    if [ "$ALL_FOUND" = true ]; then
        pass "Skill template has all required sections"
    fi
else
    fail "Skill template not found"
fi

echo ""

# Test 7: Check plugin can be loaded
echo "Test 7: Checking plugin loading..."
if jq -e '.name' "$PLUGIN_DIR/plugin.json" > /dev/null 2>&1; then
    NAME=$(jq -r '.name' "$PLUGIN_DIR/plugin.json")
    VERSION=$(jq -r '.version' "$PLUGIN_DIR/plugin.json")
    pass "Plugin loadable: $NAME v$VERSION"
else
    fail "Plugin cannot be loaded"
fi

echo ""
echo "========================================"
echo "Integration Test Results"
echo "========================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Some integration tests failed${NC}"
    echo "Review the failures above and fix before using the plugin."
    exit 1
else
    echo -e "${GREEN}All integration tests passed!${NC}"
    echo "Plugin is ready for use."
    exit 0
fi
