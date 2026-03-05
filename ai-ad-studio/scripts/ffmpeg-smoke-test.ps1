$ErrorActionPreference = "Stop"

Write-Host "Running FFmpeg smoke test..."
ffmpeg -version

Write-Host "Generating 3 second sample video..."
ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d=3 -f lavfi -i anullsrc -shortest -c:v libx264 -c:a aac ..\assets\smoke-test.mp4

Write-Host "Done. Output: assets/smoke-test.mp4"
