$ErrorActionPreference = "Continue"

Write-Output "[dev:reset] Stopping stale Next.js dev processes for this workspace..."
$targets = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "node.exe" -and
  $_.CommandLine -match "tgatb-habit-tracker" -and
  (
    $_.CommandLine -match "next\\dist\\bin\\next\" dev" -or
    $_.CommandLine -match "next\\dist\\server\\lib\\start-server\.js" -or
    $_.CommandLine -match "\\.next\\dev\\build"
  )
}

foreach ($p in $targets) {
  try {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
    Write-Output "[dev:reset] Stopped PID $($p.ProcessId)"
  } catch {
    Write-Output "[dev:reset] Failed to stop PID $($p.ProcessId): $($_.Exception.Message)"
  }
}

$lockPath = ".next/dev/lock"
if (Test-Path $lockPath) {
  try {
    Remove-Item $lockPath -Force
    Write-Output "[dev:reset] Removed stale lock: $lockPath"
  } catch {
    Write-Output "[dev:reset] Failed to remove lock: $($_.Exception.Message)"
  }
} else {
  Write-Output "[dev:reset] No lock file found."
}

Write-Output "[dev:reset] Done. You can now run 'npm run dev'."
