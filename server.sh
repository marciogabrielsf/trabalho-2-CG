#!/bin/bash

echo "🚀 Iniciando servidor local para o projeto de Computação Gráfica..."
echo ""
echo "📂 Diretório: $(pwd)"
echo "🌐 Acesse: http://localhost:8000"
echo ""
echo "⚠️  Pressione Ctrl+C para parar o servidor"
echo ""

if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ Erro: Python não encontrado"
    echo "Por favor, instale Python ou use outro método para servir os arquivos"
    exit 1
fi
