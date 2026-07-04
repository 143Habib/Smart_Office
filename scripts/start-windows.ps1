$ErrorActionPreference = "Stop"

Write-Host "Installing root helper packages..."
npm install

Write-Host "Installing backend packages..."
npm install --prefix backend

Write-Host "Installing frontend packages..."
npm install --prefix frontend

if (!(Test-Path "backend/.env")) {
  Copy-Item "backend/.env.example" "backend/.env"
}

if (!(Test-Path "frontend/.env")) {
  Copy-Item "frontend/.env.example" "frontend/.env"
}

Write-Host "Starting backend + frontend..."
npm run dev
