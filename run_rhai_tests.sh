#!/usr/bin/env zsh
# Rhai Configuration Test Runner

echo "╔═════════════════════════════════════════════════════════════════════╗"
echo "║     RHAI Configuration Test Suite                                    ║"
echo "╚═════════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")" || exit 1

echo "📁 Current directory: $(pwd)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Loading Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if config file exists
if [ ! -f ".vscode/land-config.json" ]; then
    echo "❌ Configuration file not found: .vscode/land-config.json"
    echo "   Current directory: $(pwd)"
    echo ""
    exit 1
fi

echo "✅ Configuration file found at: .vscode/land-config.json"
echo ""

# Check if cargo is available
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo not found in PATH"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Running Cargo Build for Maintain Package"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd Element/Maintain || exit 1

if cargo build --quiet; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    cd ../..
    exit 1
fi

cd ../..
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Checking Rhai script files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROFILES=("debug" "production" "release" "bundler-preparation" "swc-bundle" "oxc-bundle")
SCRIPTS_OK=true

for profile in "${PROFILES[@]}"; do
    echo "🔍 Profile: $profile"

    # Get script path from config (simplified extraction)
    SCRIPT_PATH=$(cat .vscode/land-config.json | python3 -c "import json, sys; d=json.load(sys.stdin); print(d['profiles'].get('$profile', {}).get('rhai_script','N/A'))" 2>/dev/null || cat .vscode/land-config.json | grep -o "\"rhai_s\?cript\": *\"[^\"]*\"" | head -1 | cut -d'"' -f4)

    if [ "$SCRIPT_PATH" = "N/A" ] || [ -z "$SCRIPT_PATH" ]; then
        echo "  ⚠️  No Rhai script defined for $profile"
    else
        FULL_PATH=".vscode/$SCRIPT_PATH"
        if [ -f "$FULL_PATH" ]; then
            echo "  ✅ Script found: $FULL_PATH"
            SIZE=$(wc -c < "$FULL_PATH")
            echo "     Size: $SIZE bytes"
        else
            echo "  ❌ Script not found: $FULL_PATH"
            SCRIPTS_OK=false
        fi
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Configuration Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Parse config file
if command -v python3 &> /dev/null; then
    python3 - << 'EOF'
import json

try:
    with open('.vscode/land-config.json', 'r') as f:
        config = json.load(f)

    print(f"📁 Configuration version: {config.get('version', 'N/A')}")
    print(f"📊 Total profiles: {len(config.get('profiles', {}))}")

    print()
    print("📋 Profile summary:")
    for profile_name, profile_data in config.get('profiles', {}).items():
        desc = profile_data.get('description', 'No description')
        env_count = len(profile_data.get('env', {}))
        has_script = 'Yes' if profile_data.get('rhai_script') else 'No'
        print(f"  • {profile_name:20} | {env_count:2} env vars | Script: {has_script}")
        if desc != 'No description':
            print(f"    {desc}")

    print()
    print("📦 Template variables:")
    for key, value in config.get('templates', {}).get('env', {}).items():
        print(f"  • {key} = \"{value}\"")

except Exception as e:
    print(f"❌ Error parsing config: {e}")
EOF
else
    echo "⚠️  Python3 not available - skipping detailed config parsing"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SCRIPTS_OK" = true ]; then
    echo "✅ All expected Rhai scripts exist"
else
    echo "⚠️  Some Rhai scripts are missing"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test suite completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
