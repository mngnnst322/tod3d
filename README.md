# Splat Starter

Next.js + React Three Fiber + Spark (Gaussian splat) + GSAP ScrollTrigger + Lenis.
Scroll хийхэд камер splat-ийг тойрч хөдөлнө, текст blur-аас гарч ирнэ.

## Ажиллуулах

```bash
npm install
npm run dev
```

Одоогоор Spark-ийн жишээ эрвээхэй splat ачаалагдана.

## Өөрийн splat хийх

1. Утсаараа объект эсвэл модыг **тойруулж аажуухан** бичлэг хий (30–60 сек, гэрэл тогтвортой).
2. **Polycam** эсвэл **Luma** апп-д оруулж Gaussian Splat болгоно. Компьютер дээр **Postshot** хамгийн сайн чанартай.
3. `.ply` эсвэл `.spz` татаж аваад `public/splats/` руу хийнэ.
4. `lib/config.ts` доторх `SPLAT_URL`-ийг `"/splats/minii.spz"` болгож солино.

**Зөвлөгөө:** `.ply` нь 50–200MB болдог. `.spz` формат 5–10 дахин жижиг тул заавал хөрвүүл.

## Тохируулах (бүгд `lib/config.ts` дотор)

- `SPLAT_QUATERNION` – splat доошоо харсан бол `[1,0,0,0]`, хэвийн бол `[0,0,0,1]`.
- `CAMERA_PATH` – камер дамжих цэгүүд. `[x, y, z]`, эхнийх нь хуудасны эхэнд.
- `LOOK_AT` – камер харах цэг.
- `SECTIONS` – текстүүд.

Камерын зөв цэгийг олохдоо `CameraRig.tsx`-д түр зуур `console.log(camera.position)` бичээд, OrbitControls-оор эргүүлж байгаад хуулж ав.

## Бүтэц

- `components/Splat.tsx` – SparkRenderer + SplatMesh
- `components/CameraRig.tsx` – scroll progress-оор curve дагуу камер хөдөлгөнө
- `components/Scene.tsx` – Canvas, Lenis, ScrollTrigger, текст
- `lib/config.ts` – өөрчлөх бүх зүйл энд
