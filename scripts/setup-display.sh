#!/bin/bash
# setup-display.sh - Configuración de display virtual para testing
# Uso: ./setup-display.sh [start|stop|status]

set -e

DISPLAY_NUM=99
SCREEN_SIZE="1920x1080x24"
PID_FILE="/tmp/xvfb-$DISPLAY_NUM.pid"

# Detectar sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux"* ]]; then
        echo "linux"
    else
        echo "unknown"
    fi
}

# Verificar si Xvfb está instalado
check_xvfb() {
    if ! command -v Xvfb &> /dev/null; then
        echo "ERROR: Xvfb no está instalado"
        echo ""
        OS=$(detect_os)
        if [[ "$OS" == "linux" ]]; then
            echo "Instalar con:"
            echo "  sudo apt-get install -y xvfb fluxbox"
        elif [[ "$OS" == "macos" ]]; then
            echo "macOS requiere XQuartz:"
            echo "  brew install --cask xquartz"
            echo "  # Logout y login requerido"
        fi
        exit 1
    fi
}

# Verificar si BetterDummy está disponible (macOS)
check_better_dummy() {
    if [[ "$(detect_os)" == "macos" ]]; then
        if pgrep -x "BetterDummy" > /dev/null; then
            return 0
        fi
        # Verificar si está instalado
        if [ -d "/Applications/BetterDummy.app" ] || [ -d "$HOME/Applications/BetterDummy.app" ]; then
            return 0
        fi
        return 1
    fi
    return 1
}

# Iniciar display virtual
start_display() {
    OS=$(detect_os)
    
    # Verificar si ya está corriendo
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if pgrep -x "Xvfb" | grep -q "^$PID$"; then
            echo "✓ Xvfb ya está corriendo (PID: $PID) en display :$DISPLAY_NUM"
            echo "  DISPLAY=:$DISPLAY_NUM"
            return 0
        fi
        rm -f "$PID_FILE"
    fi
    
    if [[ "$OS" == "macos" ]]; then
        # macOS: Intentar BetterDummy primero
        if check_better_dummy; then
            echo "✓ BetterDummy detectado - Usando dummy display virtual"
            echo "  No se requiere configuración adicional"
            return 0
        fi
        
        # Verificar si hay display físico
        if system_profiler SPDisplaysDataType 2>/dev/null | grep -q "Display Type"; then
            echo "✓ Display físico detectado"
            echo "  No se requiere configuración adicional"
            return 0
        fi
        
        # Intentar Xvfb si está disponible
        if command -v Xvfb &> /dev/null; then
            echo "Iniciando Xvfb en macOS..."
            Xvfb :$DISPLAY_NUM -screen 0 $SCREEN_SIZE &
            echo $! > "$PID_FILE"
            sleep 2
            echo "✓ Xvfb iniciado en display :$DISPLAY_NUM"
            echo "  DISPLAY=:$DISPLAY_NUM"
            export DISPLAY=:$DISPLAY_NUM
            return 0
        fi
        
        echo ""
        echo "⚠ SIN DISPLAY DISPONIBLE"
        echo ""
        echo "Opciones para macOS headless:"
        echo "  1. Instalar BetterDummy: https://github.com/waydabber/BetterDummy/releases"
        echo "  2. Instalar XQuartz: brew install --cask xquartz"
        echo "  3. Conectar dummy plug HDMI"
        return 1
        
    elif [[ "$OS" == "linux" ]]; then
        # Linux: Usar Xvfb
        check_xvfb
        
        echo "Iniciando Xvfb en display :$DISPLAY_NUM..."
        Xvfb :$DISPLAY_NUM -screen 0 $SCREEN_SIZE -ac &
        echo $! > "$PID_FILE"
        sleep 2
        
        # Iniciar fluxbox si está disponible
        if command -v fluxbox &> /dev/null; then
            DISPLAY=:$DISPLAY_NUM fluxbox &
            echo "✓ Fluxbox iniciado"
        fi
        
        echo "✓ Xvfb iniciado en display :$DISPLAY_NUM"
        echo "  DISPLAY=:$DISPLAY_NUM"
        export DISPLAY=:$DISPLAY_NUM
        return 0
        
    else
        echo "ERROR: Sistema operativo no soportado: $OSTYPE"
        return 1
    fi
}

# Detener display virtual
stop_display() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if pgrep -x "Xvfb" | grep -q "^$PID$"; then
            kill $PID
            echo "✓ Xvfb detenido (PID: $PID)"
        fi
        rm -f "$PID_FILE"
    else
        echo "No hay Xvfb corriendo"
    fi
    
    # También matar fluxbox
    if pgrep -x "fluxbox" > /dev/null; then
        pkill -x fluxbox
        echo "✓ Fluxbox detenido"
    fi
}

# Mostrar estado
show_status() {
    OS=$(detect_os)
    echo "=== Estado del Display ==="
    echo "SO: $OS"
    echo ""
    
    if [[ "$OS" == "macos" ]]; then
        echo "Displays detectados:"
        system_profiler SPDisplaysDataType 2>/dev/null | grep -E "(Display Type|Resolution)" | head -10
        
        echo ""
        if check_better_dummy; then
            echo "✓ BetterDummy: Activo"
        else
            echo "○ BetterDummy: No detectado"
        fi
    fi
    
    echo ""
    if command -v Xvfb &> /dev/null; then
        echo "✓ Xvfb: Instalado"
        
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if pgrep -x "Xvfb" | grep -q "^$PID$"; then
                echo "  Estado: Corriendo (PID: $PID)"
                echo "  Display: :$DISPLAY_NUM"
            else
                echo "  Estado: Parado (PID file obsoleto)"
            fi
        else
            echo "  Estado: No iniciado"
        fi
    else
        echo "○ Xvfb: No instalado"
    fi
    
    echo ""
    echo "Variable DISPLAY: ${DISPLAY:-no definida}"
    
    if command -v fluxbox &> /dev/null; then
        echo ""
        if pgrep -x "fluxbox" > /dev/null; then
            echo "✓ Fluxbox: Corriendo"
        else
            echo "○ Fluxbox: No iniciado"
        fi
    fi
}

# Instalar dependencias
install_deps() {
    OS=$(detect_os)
    echo "Instalando dependencias para $OS..."
    
    if [[ "$OS" == "linux" ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y xvfb fluxbox x11-utils
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y xorg-x11-server-Xvfb fluxbox
        elif command -v pacman &> /dev/null; then
            sudo pacman -S xvfb fluxbox
        else
            echo "ERROR: Gestor de paquetes no soportado"
            echo "Instala manualmente: xvfb fluxbox"
            return 1
        fi
        echo "✓ Dependencias instaladas"
        
    elif [[ "$OS" == "macos" ]]; then
        echo "Para macOS, se recomienda una de estas opciones:"
        echo ""
        echo "1. BetterDummy (recomendado):"
        echo "   Descargar de: https://github.com/waydabber/BetterDummy/releases"
        echo ""
        echo "2. XQuartz:"
        echo "   brew install --cask xquartz"
        echo "   # Requiere logout/login"
        echo ""
        echo "3. Dummy Plug HDMI (~$15):"
        echo "   Comprar en Amazon: 'HDMI dummy plug 4K'"
        return 1
        
    else
        echo "ERROR: Sistema no soportado para instalación automática"
        return 1
    fi
}

# Uso
usage() {
    echo "Uso: $0 <comando>"
    echo ""
    echo "Comandos:"
    echo "  start     Iniciar display virtual"
    echo "  stop      Detener display virtual"
    echo "  status    Mostrar estado actual"
    echo "  install   Instalar dependencias"
    echo ""
    echo "Ejemplos:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  export DISPLAY=:99 && $0 start"
}

# Main
case "${1:-}" in
    start)
        start_display
        ;;
    stop)
        stop_display
        ;;
    status)
        show_status
        ;;
    install)
        install_deps
        ;;
    *)
        usage
        exit 1
        ;;
esac