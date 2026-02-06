#!/bin/bash
# Batch update all skills that are outdated
# Usage: update-all.sh [--days N] [--dry-run]

DAYS=30
DRY_RUN=false
PLUGIN_DIR="$(dirname "$(dirname "$0")")"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --days)
            DAYS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "Checking for skills older than $DAYS days..."
echo "============================================"

OUTDATED=()

# Check plugin storage
for META in "$PLUGIN_DIR/storage/skills"/*/.meta.json; do
    if [ -f "$META" ]; then
        SKILL_DIR=$(dirname "$META")
        TOPIC=$(basename "$SKILL_DIR")

        # Get last updated date
        UPDATED=$(grep -oP '"updated":\s*"\K[^"]+' "$META" 2>/dev/null)

        if [ -n "$UPDATED" ]; then
            # Calculate days since update
            UPDATED_TS=$(date -d "$UPDATED" +%s 2>/dev/null || echo 0)
            NOW_TS=$(date +%s)
            DIFF_DAYS=$(( (NOW_TS - UPDATED_TS) / 86400 ))

            if [ "$DIFF_DAYS" -gt "$DAYS" ]; then
                OUTDATED+=("$TOPIC")
                echo "⚠ $TOPIC - last updated $DIFF_DAYS days ago"
            else
                echo "✓ $TOPIC - updated $DIFF_DAYS days ago"
            fi
        else
            echo "? $TOPIC - no update date found"
        fi
    fi
done

# Check global skills
for META in ~/.claude/skills/*/.meta.json; do
    if [ -f "$META" ]; then
        SKILL_DIR=$(dirname "$META")
        TOPIC=$(basename "$SKILL_DIR")

        UPDATED=$(grep -oP '"updated":\s*"\K[^"]+' "$META" 2>/dev/null)

        if [ -n "$UPDATED" ]; then
            UPDATED_TS=$(date -d "$UPDATED" +%s 2>/dev/null || echo 0)
            NOW_TS=$(date +%s)
            DIFF_DAYS=$(( (NOW_TS - UPDATED_TS) / 86400 ))

            if [ "$DIFF_DAYS" -gt "$DAYS" ]; then
                OUTDATED+=("$TOPIC (global)")
                echo "⚠ $TOPIC (global) - last updated $DIFF_DAYS days ago"
            else
                echo "✓ $TOPIC (global) - updated $DIFF_DAYS days ago"
            fi
        fi
    fi
done

echo "============================================"
echo "Found ${#OUTDATED[@]} outdated skill(s)"

if [ ${#OUTDATED[@]} -gt 0 ]; then
    echo ""
    if [ "$DRY_RUN" = true ]; then
        echo "Dry run - would update:"
        for TOPIC in "${OUTDATED[@]}"; do
            echo "  - $TOPIC"
        done
    else
        echo "To update these skills, run:"
        for TOPIC in "${OUTDATED[@]}"; do
            echo "  /update-skill $TOPIC"
        done
    fi
fi
