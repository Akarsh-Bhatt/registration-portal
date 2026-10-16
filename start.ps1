Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Starting UPES Club Registration Portal (NEXUS CLUB)" -ForegroundColor Yellow
Write-Host " Backend: Python FastAPI + MongoDB Atlas" -ForegroundColor Green
Write-Host " Frontend: React + Tailwind CSS + Vite" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "[1/2] Starting Python FastAPI backend on http://127.0.0.1:8000..." -ForegroundColor Magenta
$backendJob = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory "$PSScriptRoot\backend" -PassThru

# Start Frontend
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Magenta
Set-Location "$PSScriptRoot\frontend"
npm run dev

# Cleanup on exit
Stop-Process -Id $backendJob.Id -ErrorAction SilentlyContinue
