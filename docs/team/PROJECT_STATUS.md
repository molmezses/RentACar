
# RentACar — Ortak Proje Durumu

Bu dosya Mustafa, Eda ve kullandıkları geliştirme asistanları için ortak ilerleme özetidir.

**Önemli:** Gerçek uygulama davranışının kaynağı güncel `main` branch'indeki koddur. Bu belge onun yerine geçmez.

## 1. Proje ve Teknolojiler

RentACar, araç kiralama işletmelerine yönelik multi-tenant SaaS uygulamasıdır.

- Backend: NestJS, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js, React, TypeScript
- Authentication: Ayrı Platform Admin ve Tenant Admin oturumları
- API dokümantasyonu: NestJS Swagger
- Backend testleri: Vitest ve HTTP E2E testleri

## 2. Tamamlanan Geliştirmeler

| Görev | Sorumlu | Durum | İçerik |
|---|---|---|---|
| C1–C10 | Mustafa | Merge edildi | Tenant onboarding, authentication, dashboard, izolasyon ve testler |
| D1 | Eda | Kapalı | Vehicle yönetimi ürün araştırması ve mimari |
| D2 | Eda | Kapalı | Vehicle listeleme frontend |
| D3 | Eda | Kapalı | Vehicle create/edit frontend formları |
| D4 | Eda | Kapalı | Ortak Vehicle tipleri, validasyon ve bileşenler |
| E1 | Eda | Kapalı | Tenant Application güvenli silme |

D1–D4 araç ekranları henüz gerçek Vehicle API ile entegre değildir. Bağımsız demo rotaları bulunmaktadır.

## 3. Aktif ve Planlanan Çalışmalar

- Team Sync: Eda tarafından yürütülüyor; son durum GitHub issue üzerinden doğrulanmalı.
- F1: Ortak proje hafızası ve Vehicle API sözleşmesi — Mustafa.
- F2–F9: Backend ağırlıklı yeni görevler.
- G1–G9: Frontend ağırlıklı yeni görevler.

Tüm F/G görevleri tamamlandı anlamına gelmez. Güncel ilerleme için GitHub issue ve PR durumları kontrol edilmelidir.

## 4. Mimari Kurallar

### Tenant izolasyonu

- Tenant kimliği güvenilir, doğrulanmış sunucu oturumundan alınır.
- İstemciden gelen tenantId yetkilendirme amacıyla kullanılmaz.
- Başka Tenant'a ait kaynaklara erişimde bilgi sızdırmayan yanıtlar kullanılır.
- Platform Admin ve Tenant Admin yetkileri birbirinden ayrıdır.

### Vehicle yönetimi

- Kaynak mimari: `docs/architecture/vehicle-management.md`
- Frontend tipleri: `apps/web/types/vehicle.ts`
- Vehicle API henüz uygulanmadı.
- ACTIVE/INACTIVE filo durumu, tarih aralığına bağlı rezervasyon müsaitliğinden farklıdır.
- Para alanları veritabanında Decimal, JSON sözleşmesinde decimal string yaklaşımını izlemelidir.
- Vehicle endpoint'lerinde silme başlangıç MVP kapsamında değildir; durum yönetimi kullanılacaktır.

### Tasarım

- Tenant Admin ana rengi: `#13241f`
- Platform Admin ana rengi: `#19243a`
- Mevcut layout, sidebar ve ortak bileşenler yeniden kullanılmalıdır.
- Yeni araç ekranları Tenant Admin navigasyonuna entegre edilmelidir.
- Demo ekranlarının tasarımı sade, tutarlı ve profesyonel biçimde iyileştirilmelidir.

## 5. Vehicle API — F1 Sözleşme Kararları

Bu bölüm F1 PR'ı ile netleştirilecek ve `vehicle-management.md` ile uyumlu tutulacaktır.

Önerilen endpoint'ler:

- GET /tenant/vehicles
- GET /tenant/vehicles/:id
- POST /tenant/vehicles
- PATCH /tenant/vehicles/:id
- PATCH /tenant/vehicles/:id/status

Önerilen filtreler:

- search
- category
- fleetStatus
- transmission
- fuelType

Önerilen sıralama alanları:

- createdAt
- make
- model
- plate
- dailyPrice

Sıralama yönü: asc veya desc.

"En yeni" seçeneği sisteme eklenme tarihini, yani createdAt desc sıralamasını ifade eder. Mevcut demo kodunda modelYear ile sıralama yapılmaktadır; bu davranış gerçek API entegrasyonunda düzeltilmelidir.

PATCH sözleşmesi:

- Alan gönderilmezse mevcut değer korunur.
- Nullable alan null gönderilirse temizlenir.
- Kimlik, Tenant sahipliği ve sistem alanları değiştirilemez.
- fleetStatus yalnızca ayrı status endpoint'i ile değiştirilir.

## 6. Kritik Dosyalar

- `apps/api/prisma/schema.prisma`
- `apps/api/src/auth/guards/tenant-jwt-auth.guard.ts`
- `apps/api/src/auth/tenant-auth-context.ts`
- `apps/api/src/tenants/tenant-profile.controller.ts`
- `apps/web/types/vehicle.ts`
- `apps/web/components/vehicles/`
- `apps/web/lib/vehicles/`
- `docs/architecture/vehicle-management.md`
- `docs/architecture/tenant-authentication.md`

## 7. PR Sonrası Güncelleme Kuralı

Her PR, merge edilmeden önce bu dosyada ilgili kısa durum güncellemesini içermelidir.

Kayıt biçimi:

### [Görev kodu] — [Kısa başlık]

- Sorumlu:
- PR:
- Durum:
- Yapılan değişiklik:
- Değişen temel dosyalar:
- Yeni veya değişen API:
- Migration:
- Environment/dependency değişiklikleri:
- Test sonuçları:
- Diğer geliştiricinin yapması gerekenler:
- Sonraki bağımlı görev:

Yeni görevlerin mevcut açıklamalarını tekrar tekrar bu dosyaya kopyalamayın. Yalnızca tamamlanan kararları, önemli değişiklikleri ve diğer geliştiriciyi etkileyen bilgileri kaydedin.

Birden fazla PR aynı dosyayı değiştiriyorsa Git conflict çözümünde her iki tarafın geçerli kayıtları korunmalıdır.

## 8. Geliştirme Asistanları İçin Çalışma Yöntemi

Yeni issue'ya başlamadan önce:

1. Güncel `main` branch'ini ve Git durumunu kontrol et.
2. Bu dosyayı ve ilgili mimari belgesini oku.
3. GitHub issue içeriğini ve bağımlılıklarını incele.
4. Önceden geliştirilmiş modülleri tekrar yazma.
5. Kodlamadan önce geliştiriciye mimari yaklaşımı açıkla.
6. Küçük, anlaşılır adımlarla ilerle.
7. Kodun neden yazıldığını, alternatiflerini ve testlerini öğret.
8. Test/build sonuçlarını gerçekten çalıştırılmadan başarılı olarak işaretleme.
9. PR'a Local Setup / Team Actions bölümünü ekle.
10. Bu belgeyi güncelle.

Projenin amacı yalnızca hızlı özellik teslimi değil; sürdürülebilir yazılım mimarisi ve iki geliştiricinin mesleki gelişimidir.
