# Image pipeline

Goal: keep the site fast while supporting 100+ photos.

## Folders
- assets/img/_source: drop original JPG files here (keep large)
- assets/img/optimized: generated web images

Suggested structure:
```
assets/img/_source/
  gallery-01/
    sofa-linho-01.jpg
    sofa-linho-02.jpg
  gallery-02/
    mesa-vidro-01.jpg
```

## Naming rules
- Use lowercase, kebab-case
- No spaces or accents
- One image per file (no stacks)

## Sizes (width)
- 640, 960, 1280, 1600, 1920

## Quality
- WebP: 78
- JPG: 82

## Run the pipeline
Install ImageMagick (magick) or ffmpeg, then run:
```
powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1
```

Output keeps the same subfolders:
```
assets/img/optimized/gallery-01/sofa-linho-01-640.webp
assets/img/optimized/gallery-01/sofa-linho-01-640.jpg
...
```

## HTML usage (example)
```
<picture>
  <source type="image/webp" srcset="
    assets/img/optimized/gallery-01/sofa-linho-01-640.webp 640w,
    assets/img/optimized/gallery-01/sofa-linho-01-960.webp 960w,
    assets/img/optimized/gallery-01/sofa-linho-01-1280.webp 1280w,
    assets/img/optimized/gallery-01/sofa-linho-01-1600.webp 1600w,
    assets/img/optimized/gallery-01/sofa-linho-01-1920.webp 1920w
  " sizes="(max-width: 640px) 100vw, 50vw">
  <img src="assets/img/optimized/gallery-01/sofa-linho-01-1280.jpg" alt="Sofa em linho" loading="lazy">
</picture>
```

## CSS hero backgrounds (example)
```
.hero-slide {
  background-image: url('assets/img/optimized/hero/slide-01-1280.jpg');
  background-image: image-set(
    url('assets/img/optimized/hero/slide-01-640.webp') 1x,
    url('assets/img/optimized/hero/slide-01-1280.webp') 2x
  );
}
```

Note: keep original PSD/RAW outside the site repo. Only web-ready JPG/WebP should be published.
