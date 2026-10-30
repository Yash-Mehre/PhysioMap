#!/bin/bash

#  stderr  stdout， execute_command  stderr 
exec 2>&1

set -e

# （.zscripts ， workspace-agent/.zscripts）
#  $0 （ sh  bash）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Next.js 
NEXTJS_PROJECT_DIR="/home/z/my-project"

#  Next.js 
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ : Next.js : $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀  Next.js  mini-services..."
echo "📁 Next.js : $NEXTJS_PROJECT_DIR"

#  Next.js 
cd "$NEXTJS_PROJECT_DIR" || exit 1

# 
export NEXT_TELEMETRY_DISABLED=1

BUILD_DIR="/tmp/build_fullstack_${BUILD_ID:-$(date +%s)}"
echo "📁 : $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 
echo "📦 ..."
bun install

#  Next.js 
echo "🔨  Next.js ..."
bun run build

#  standalone （）。
# Next  next.config  output:"standalone"  .next/standalone/server.js。
# /AI ，bun run build （static 
# 、 0）， standalone —— server.js， FC 
# start.sh  next-service-dist/server.js →  Next → Caddy:81 
# 3000 → FC  120s （ warmup_412 / FunctionNotStarted ）。
# ：， next.config  output:"standalone" 。
# （ server.js），。
if [ ! -f ".next/standalone/server.js" ]; then
    echo "⚠️   .next/standalone/server.js， next.config  output ..."
    NEXT_CONFIG_FILE="$(ls next.config.ts next.config.js next.config.mjs next.config.cjs 2>/dev/null | head -1)"

    if [ -z "$NEXT_CONFIG_FILE" ]; then
        echo "❌ ： next.config.*， standalone 。"
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        #  standalone  server.js，（ build 
        # 、 distDir ）。，。
        echo "❌ ：$NEXT_CONFIG_FILE  output:\"standalone\"， .next/standalone/server.js。"
        echo "   。"
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]" "$NEXT_CONFIG_FILE"; then
        #  output（ "export"  / "standalone" ）。
        # "export" （standalone +  server）——
        # output （JS  key ，）。。
        echo "❌ ：$NEXT_CONFIG_FILE  standalone  output（ \"export\" ），。"
        echo "    output:\"standalone\"。 standalone，。"
        exit 1
    fi

    echo "🔧  $NEXT_CONFIG_FILE  output:\"standalone\"，..."
    cp "$NEXT_CONFIG_FILE" "${NEXT_CONFIG_FILE}.zbak"
    #  {  output:"standalone"，
    # ：const nextConfig...= {  /  export default {  /  module.exports = {
    perl -0pi -e 's/((const\s+\w+[^=]*=|export\s+default|module\.exports\s*=)\s*\{)/$1\n  output: "standalone",/' "$NEXT_CONFIG_FILE"

    if ! grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ ，next.config ， output:\"standalone\"。"
        echo "    $NEXT_CONFIG_FILE ："
        cat "$NEXT_CONFIG_FILE"
        mv "${NEXT_CONFIG_FILE}.zbak" "$NEXT_CONFIG_FILE"
        exit 1
    fi

    echo "🔨  output:\"standalone\"，..."
    bun run build

    if [ ! -f ".next/standalone/server.js" ]; then
        echo "❌  output:\"standalone\" ， .next/standalone/server.js。"
        exit 1
    fi
    echo "✅ ：standalone 。"
fi

#  mini-services
#  Next.js  mini-services 
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨  mini-services..."
    #  workspace-agent  mini-services 
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    #  mini-services-start.sh  mini-services-dist 
    echo "  -  mini-services-start.sh  $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  mini-services ，"
fi

# 
echo "📦  $BUILD_DIR..."

#  Next.js standalone 
if [ -d ".next/standalone" ]; then
    echo "  -  .next/standalone"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
fi

#  Next.js 
if [ -d ".next/static" ]; then
    echo "  -  .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

#  public 
if [ -d "public" ]; then
    echo "  -  public"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# Python  workspace-agent  /home/z/.venv。 Python 
# ，， Python 。
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/python-runtime-build.sh"

#  Preview ；。
#  db/custom.db， dev.sh  Deploy 。
PROJECT_DIR="$NEXTJS_PROJECT_DIR" BUILD_DIR="$BUILD_DIR" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

#  Caddyfile（）
if [ -f "Caddyfile" ]; then
    echo "  -  Caddyfile"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile ，"
fi

#  start.sh 
echo "  -  start.sh  $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

#  $BUILD_DIR.tar.gz
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦  $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

# # 
# rm -rf "$BUILD_DIR"

echo ""
echo "✅ ！ $PACKAGE_FILE"
echo "📊 :"
ls -lh "$PACKAGE_FILE"
