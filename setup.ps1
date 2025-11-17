# RAG Chatbot Quick Setup Script for Windows

Write-Host "🚀 RAG Chatbot Setup" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and add your Google Gemini API key" -ForegroundColor Yellow
    Write-Host "   Get your key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after you've added your API key to .env"
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🐳 Building Docker containers..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost"
Write-Host "   Backend:  http://localhost:5000"
Write-Host "   Health:   http://localhost:5000/api/health"
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f"
Write-Host ""
Write-Host "🛑 Stop services:" -ForegroundColor Cyan
Write-Host "   docker-compose down"
Write-Host ""
