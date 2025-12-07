# ============================================
# PowerShell скрипт для загрузки проекта на GitHub
# Motivational Spanish Mini App
# ============================================

# 1. ОЧИСТКА СТАРЫХ РЕПОЗИТОРИЕВ (если они есть)
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "1️⃣  Инициализация репозитория..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# Удаляем старый .git если существует
if (Test-Path .\.git) {
    Write-Host "⚠️  Найден старый репозиторий, удаляем..." -ForegroundColor Yellow
    Remove-Item .\.git -Recurse -Force
    Write-Host "✓ Удалено" -ForegroundColor Green
}

# 2. ИНИЦИАЛИЗАЦИЯ GIT
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2️⃣  Инициализация git..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

git init
git config user.email "developer@example.com"
git config user.name "Developer"

# 3. ДОБАВЛЕНИЕ ФАЙЛОВ
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "3️⃣  Добавление файлов..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

git add .
Write-Host "✓ Все файлы добавлены (кроме .gitignore исключений)" -ForegroundColor Green

# Проверка статуса
Write-Host ""
git status

# 4. ПЕРВЫЙ КОММИТ
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "4️⃣  Создание первого коммита..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

git commit -m "Initial commit: Telegram Mini App - Motivational Spanish Cards with Backend API"
Write-Host "✓ Коммит создан" -ForegroundColor Green

# 5. ДОБАВЛЕНИЕ УДАЛЁННОГО РЕПОЗИТОРИЯ
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "5️⃣  Добавление удалённого репозитория..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

$githubUser = Read-Host "Введи свой GitHub username"
$repoName = "motivational-spanish-miniapp"

$remoteUrl = "https://github.com/$githubUser/$repoName.git"
Write-Host "URL репозитория: $remoteUrl" -ForegroundColor Cyan

git remote add origin $remoteUrl

# 6. ПЕРЕИМЕНОВАНИЕ ВЕТКИ
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "6️⃣  Переименование ветки main..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

git branch -M main

# 7. ЗАГРУЗКА НА GITHUB
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "7️⃣  Загрузка на GitHub..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⚠️  Вас попросят ввести GitHub credentials..." -ForegroundColor Yellow

git push -u origin main

# 8. УСПЕХ
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ УСПЕШНО!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Репозиторий: $remoteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Что делать дальше:" -ForegroundColor Green
Write-Host "1. Добавь .env переменные на хостинге (Vercel, Railway, Heroku)" -ForegroundColor White
Write-Host "2. Разверни backend (npm install && npm start)" -ForegroundColor White
Write-Host "3. Настрой MongoDB Atlas" -ForegroundColor White
Write-Host "4. Подключи WebApp URL в BotFather" -ForegroundColor White
Write-Host ""
Write-Host "📝 Команда для подключения WebApp в BotFather (через curl):" -ForegroundColor Cyan
Write-Host "curl -X POST https://api.telegram.org/bot8059103322:AAHf8ql_pq1FsQEhL3Xd6Dodku4DkCMIu2Y/setWebAppInfo `" -ForegroundColor Yellow
Write-Host "  -d 'button_text=🇪🇸 Испанский' `" -ForegroundColor Yellow
Write-Host "  -d 'web_app_url=https://your-domain.com/index.html'" -ForegroundColor Yellow
Write-Host ""
