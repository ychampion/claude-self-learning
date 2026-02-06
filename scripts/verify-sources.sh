#!/bin/bash
# Verify that sources in skill metadata are still valid
# Usage: verify-sources.sh <skill-directory>

SKILL_DIR="$1"

if [ -z "$SKILL_DIR" ]; then
    echo "Usage: verify-sources.sh <skill-directory>"
    echo "Example: verify-sources.sh ./storage/skills/anthropic-api"
    exit 1
fi

META_FILE="$SKILL_DIR/.meta.json"

if [ ! -f "$META_FILE" ]; then
    echo "Error: No .meta.json found in $SKILL_DIR"
    exit 1
fi

echo "Checking sources for: $(basename "$SKILL_DIR")"
echo "================================"

# Extract URLs from meta.json
URLS=$(grep -oP '"https?://[^"]+' "$META_FILE" | tr -d '"')

VALID=0
INVALID=0

for URL in $URLS; do
    # Check if URL is reachable
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL")

    if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 400 ]; then
        echo "✓ $URL (HTTP $STATUS)"
        ((VALID++))
    else
        echo "✗ $URL (HTTP $STATUS)"
        ((INVALID++))
    fi
done

echo "================================"
echo "Valid: $VALID | Invalid: $INVALID"

if [ "$INVALID" -gt 0 ]; then
    echo ""
    echo "Some sources are no longer valid."
    echo "Consider running: /update-skill $(basename "$SKILL_DIR")"
    exit 1
fi
