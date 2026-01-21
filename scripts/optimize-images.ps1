param(
  [string]$Source = "assets/img/_source",
  [string]$Dest = "assets/img/optimized",
  [int[]]$Sizes = @(640, 960, 1280, 1600, 1920),
  [int]$WebpQuality = 78,
  [int]$JpegQuality = 82
)

$magick = Get-Command magick -ErrorAction SilentlyContinue
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue

if (-not $magick -and -not $ffmpeg) {
  Write-Host "Missing tool. Install ImageMagick (magick) or ffmpeg." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path $Source)) {
  Write-Host "Source folder not found: $Source" -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path $Dest)) {
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

$sourcePath = (Resolve-Path $Source).Path
$destPath = (Resolve-Path $Dest).Path

$files = Get-ChildItem -Path $sourcePath -Recurse -File
$images = $files | Where-Object { $_.Extension -match '^\.(jpe?g)$' }
$skipped = $files | Where-Object { $_.Extension -notmatch '^\.(jpe?g)$' }

if ($skipped.Count -gt 0) {
  Write-Host "Skipping non-jpg files: $($skipped.Count)" -ForegroundColor DarkYellow
}

foreach ($file in $images) {
  $relative = $file.FullName.Substring($sourcePath.Length).TrimStart('\', '/')
  $relativeDir = Split-Path $relative -Parent
  $outDir = if ($relativeDir) { Join-Path $destPath $relativeDir } else { $destPath }
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

  foreach ($size in $Sizes) {
    $webpOut = Join-Path $outDir "$baseName-$size.webp"
    $jpgOut = Join-Path $outDir "$baseName-$size.jpg"

    if ($magick) {
      & $magick.Path $file.FullName -strip -resize "${size}x>" -quality $WebpQuality $webpOut
      & $magick.Path $file.FullName -strip -resize "${size}x>" -quality $JpegQuality $jpgOut
    } else {
      $q = [Math]::Max(2, [Math]::Min(31, [Math]::Round((100 - $JpegQuality) / 3.2)))
      & $ffmpeg.Path -hide_banner -loglevel error -y -i $file.FullName -vf "scale='min($size,iw)':-2" -c:v libwebp -qscale:v $WebpQuality $webpOut
      & $ffmpeg.Path -hide_banner -loglevel error -y -i $file.FullName -vf "scale='min($size,iw)':-2" -q:v $q $jpgOut
    }
  }
}

Write-Host "Done. Processed $($images.Count) images into $Dest" -ForegroundColor Green
