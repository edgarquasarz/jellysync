#!/bin/bash
# run-bdd-tests.sh - Ejecutar tests BDD con configuración de display automática
# Uso: ./run-bdd-tests.sh [dev|ci|profile]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Cargar configuración de display si existe
if [ -f "$SCRIPT_DIR/setup-display.sh" ]; then
    source "$SCRIPT_DIR/setup-display.sh" status > /dev/null 2>&1 || true
fi

# Detectar si hay display disponible
has_display() {
    if [[ -n "$DISPLAY" ]]; then
        return 0
    fi
    
    # macOS: verificar displays
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if system_profiler SPDisplaysDataType 2>/dev/null | grep -q "Display Type"; then
            return 0
        fi
        if pgrep -x "BetterDummy" > /dev/null; then
            return 0
        fi
    fi
    
    # Linux: verificar Xvfb
    if pgrep -x "Xvfb" > /dev/null; then
        return 0
    fi
    
    return 1
}

# Configurar display virtual si es necesario
setup_display_if_needed() {
    if has_display; then
        echo "✓ Display disponible"
        return 0
    fi
    
    echo "⚠ No hay display disponible. Intentando configurar..."
    
    # Intentar iniciar display virtual
    if [ -f "$SCRIPT_DIR/setup-display.sh" ]; then
        "$SCRIPT_DIR/setup-display.sh" start || {
            echo ""
            echo "ERROR: No se pudo configurar display virtual"
            echo ""
            echo "Soluciones:"
            echo "  Linux: sudo apt-get install xvfb && ./scripts/setup-display.sh start"
            echo "  macOS: Instala BetterDummy o conecta un dummy plug HDMI"
            exit 1
        }
        export DISPLAY=:99
    fi
}

# Ejecutar tests en modo desarrollo (con UI)
run_dev() {
    echo "=== Ejecutando tests en modo DESARROLLO ==="
    echo ""
    
    # En modo dev debe haber display físico
    if ! has_display; then
        echo "ERROR: El modo desarrollo requiere un display físico"
        echo "Usa 'run-bdd-tests.sh ci' para modo headless"
        exit 1
    fi
    
    echo "Construyendo aplicación..."
    pnpm build
    
    echo ""
    echo "Ejecutando tests con UI visible..."
    pnpm test:bdd:dev
}

# Ejecutar tests en modo CI (headless)
run_ci() {
    echo "=== Ejecutando tests en modo CI ==="
    echo ""
    
    setup_display_if_needed
    
    echo "Construyendo aplicación..."
    pnpm build
    
    echo ""
    echo "Ejecutando tests headless..."
    
    # Si estamos en Linux sin display, usar xvfb-run
    if [[ "$OSTYPE" == "linux"* ]] && [[ -z "$DISPLAY" ]]; then
        echo "Usando xvfb-run..."
        xvfb-run -a --server-args="-screen 0 1920x1080x24" pnpm test:bdd:ci
    else
        pnpm test:bdd:ci
    fi
}

# Ejecutar tests con perfil específico
run_profile() {
    local profile="$1"
    echo "=== Ejecutando tests con perfil: $profile ==="
    echo ""
    
    setup_display_if_needed
    
    echo "Construyendo aplicación..."
    pnpm build
    
    echo ""
    echo "Ejecutando tests..."
    
    # Si estamos en Linux sin display, usar xvfb-run
    if [[ "$OSTYPE" == "linux"* ]] && [[ -z "$DISPLAY" ]]; then
        xvfb-run -a --server-args="-screen 0 1920x1080x24" \
            pnpm test:bdd -- --profile "$profile"
    else
        pnpm test:bdd -- --profile "$profile"
    fi
}

# Mostrar uso
usage() {
    echo "Uso: $0 <modo> [opciones]"
    echo ""
    echo "Modos:"
    echo "  dev        Ejecutar tests con UI visible (requiere display)"
    echo "  ci         Ejecutar tests en modo headless (usa Xvfb si es necesario)"
    echo "  profile N  Ejecutar con perfil específico de cucumber.js"
    echo ""
    echo "Opciones:"
    echo "  --build    Forzar rebuild antes de tests"
    echo "  --verbose  Salida detallada"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev                    # Tests con UI"
    echo "  $0 ci                     # Tests CI con display virtual"
    echo "  $0 profile smoke          # Tests con perfil 'smoke'"
    echo ""
    echo "Entorno:"
    echo "  DISPLAY=:99               # Override de display"
    echo "  HEADLESS=true             # Forzar modo headless"
}

# Main
BUILD_FIRST=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        dev|ci)
            MODE="$1"
            shift
            ;;
        profile)
            MODE="profile"
            PROFILE="$2"
            shift 2
            if [[ -z "$PROFILE" ]]; then
                echo "ERROR: Debes especificar un perfil"
                usage
                exit 1
            fi
            ;;
        --build)
            BUILD_FIRST=true
            shift
            ;;
        --verbose|-v)
            set -x
            shift
            ;;
        -h|--help|help)
            usage
            exit 0
            ;;
        *)
            echo "ERROR: Opción desconocida: $1"
            usage
            exit 1
            ;;
    esac
done

# Si no se especificó modo, detectar automáticamente
if [[ -z "$MODE" ]]; then
    if has_display; then
        echo "Display detectado, usando modo 'dev'"
        MODE="dev"
    else
        echo "Sin display, usando modo 'ci'"
        MODE="ci"
    fi
fi

# Ejecutar según el modo
case "$MODE" in
    dev)
        if [[ "$BUILD_FIRST" == "true" ]]; then
            echo "Rebuilding..."
            pnpm build
        fi
        run_dev
        ;;
    ci)
        if [[ "$BUILD_FIRST" == "true" ]]; then
            echo "Rebuilding..."
            pnpm build
        fi
        run_ci
        ;;
    profile)
        if [[ -z "$PROFILE" ]]; then
            echo "ERROR: Perfil no especificado"
            usage
            exit 1
        fi
        if [[ "$BUILD_FIRST" == "true" ]]; then
            echo "Rebuilding..."
            pnpm build
        fi
        run_profile "$PROFILE"
        ;;
    *)
        echo "ERROR: Modo desconocido: $MODE"
        usage
        exit 1
        ;;
esac

echo ""
echo "✓ Tests completados"