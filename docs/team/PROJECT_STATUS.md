# RentACar — Ortak Proje Durumu

Bu dosya Mustafa, Eda ve kullandıkları geliştirme asistanları için ortak ilerleme özetidir.

**Önemli:** Gerçek uygulama davranışının kaynağı güncel `main` branch'indeki koddur. Bu belge onun yerine geçmez. Henüz merge edilmemiş geliştirmeler ayrıca belirtilir.

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

| F1 | Mustafa | Merge edildi (PR #72) | Ortak proje durum belgesi ve Vehicle API sözleşmesi |

| F2 | Mustafa | Merge edildi (PR #73) | Tenant bazlı Vehicle Prisma modeli ve migration |

| G1 | Eda | Merge edildi (PR #74) | Tenant Admin araç listesi ve yeni araç formu entegrasyonu |

D1–D4 kapsamında geliştirilen araç ekranları henüz gerçek Vehicle API ile entegre değildir. Bağımsız demo rotaları bulunmaktadır.

## 3. Aktif ve Planlanan Çalışmalar

- Team Sync: Eda tarafından yürütülüyor; son durum GitHub issue üzerinden doğrulanmalı.

- F1: Tamamlandı, PR #72 ile `main` branch'ine merge edildi.

- F2: Tamamlandı, PR #73 ile `main` branch'ine merge edildi.

- G1: Tamamlandı, PR #74 ile `main` branch'ine merge edildi.

- G2: Tamamlandı, main branch'ine merge edildi.

- F3: Geliştirme ve testler tamamlandı; PR hazırlığında, henüz merge edilmedi.
- F4–F9: Backend ağırlıklı planlanan görevler.

- G3–G9: Frontend ağırlıklı planlanan görevler.

Tüm F/G görevleri tamamlandı anlamına gelmez. Güncel ilerleme için GitHub issue ve PR durumları kontrol edilmelidir.

**Çalışma prensibi:** Mevcut MVP kapsamı ve onaylanan API sözleşmesi esas alınacaktır. Ek özellikler ihtiyaç oluştuğunda ayrı issue'lar üzerinden planlanacaktır. Mevcut issue'ların kapsamı gereksiz yere büyütülmeyecektir.

## 4. Mimari Kurallar

### PR durumlarının takibi

Bu dosya geliştirme kapsamını, teknik kararları ve test sonuçlarını belgeler.

PR'ın açık, incelemede veya merge edilmiş olup olmadığının
güncel kaynağı GitHub'dır.

Bu dosyada PR'ın geçici durumları tutulmaz.
Bir geliştirmenin main branch'inde kullanılabilir olup olmadığı,
GitHub merge durumu ve güncel main kodundan doğrulanmalıdır.

### Tenant izolasyonu

- Tenant kimliği güvenilir, doğrulanmış sunucu oturumundan alınır.

- İstemciden gelen `tenantId` yetkilendirme amacıyla kullanılmaz.

- Başka Tenant'a ait kaynaklara erişimde bilgi sızdırmayan yanıtlar kullanılır.

- Platform Admin ve Tenant Admin yetkileri birbirinden ayrıdır.

- Vehicle veritabanı sorguları ilgili Tenant ile sınırlandırılmalıdır.

### Vehicle yönetimi

- Kaynak mimari: `docs/architecture/vehicle-management.md`

- API sözleşmesi: `docs/architecture/vehicle-api-contract.md`

- Frontend tipleri: `apps/web/types/vehicle.ts`

- Vehicle listeleme ve detay API'si F3 kapsamında geliştirildi; henüz main branch'ine merge edilmedi.

- Vehicle modeli her aracın bir Tenant'a ait olacağı şekilde tasarlanmıştır.

- Aynı Tenant içerisinde aynı plaka ikinci kez kaydedilemez.

- `FleetStatus` yalnızca `ACTIVE` ve `INACTIVE` değerlerini içerir.

- ACTIVE/INACTIVE filo durumu, tarih aralığına bağlı rezervasyon müsaitliğinden farklıdır.

- Para alanları veritabanında `Decimal(12,2)`, JSON sözleşmesinde decimal string yaklaşımını izlemelidir.

- Vehicle endpoint'lerinde silme başlangıç MVP kapsamında değildir; durum yönetimi kullanılacaktır.

- Vehicle fotoğrafları, rezervasyon bazlı müsaitlik ve gelişmiş bakım süreçleri sonraki geliştirmelerin kapsamındadır.

### Tasarım

- Tenant Admin ana rengi: `#13241f`

- Platform Admin ana rengi: `#19243a`

- Mevcut layout, sidebar ve ortak bileşenler yeniden kullanılmalıdır.

- Yeni araç ekranları Tenant Admin navigasyonuna entegre edilmelidir.

- Demo ekranlarının tasarımı sade, tutarlı ve profesyonel biçimde iyileştirilmelidir.

- G1 kapsamında gereksiz frontend yeniden yazımından kaçınılmalıdır.

## 5. Vehicle API — F1 Sözleşme Kararları

F1 kapsamında Vehicle API sözleşmesi oluşturulmuş ve PR #72 ile `main` branch'ine merge edilmiştir.

Referans: `docs/architecture/vehicle-api-contract.md`

### Endpoint'ler

- GET `/tenant/vehicles`

- GET `/tenant/vehicles/:id`

- POST `/tenant/vehicles`

- PATCH `/tenant/vehicles/:id`

- PATCH `/tenant/vehicles/:id/status`

Başlangıç MVP kapsamında DELETE endpoint'i bulunmamaktadır.

### Listeleme ve filtreleme

Desteklenecek filtreler:

- `search`

- `category`

- `fleetStatus`

- `transmission`

- `fuelType`

Desteklenecek sıralama alanları:

- `createdAt`

- `make`

- `model`

- `plate`

- `dailyPrice`

Sıralama yönü: `asc` veya `desc`.

Varsayılan sıralama: `createdAt desc`.

"En yeni" seçeneği sisteme eklenme tarihini, yani `createdAt desc` sıralamasını ifade eder.

Mevcut frontend demo kodunda `modelYear` ile sıralama yapılmaktadır. Bu davranış gerçek API entegrasyonunda düzeltilmelidir.

### Araç oluşturma

- Araç kimliği sunucu tarafından oluşturulur.

- `tenantId`, doğrulanmış Tenant Admin oturumundan elde edilir.

- Yeni aracın `fleetStatus` değeri varsayılan olarak `ACTIVE` olur.

- Sistem tarafından yönetilen alanlar istemciden kabul edilmez.

- Başarılı oluşturma isteği HTTP 201 yanıtı üretir.

### Araç güncelleme

- Alan gönderilmezse mevcut değer korunur.

- Nullable alan `null` gönderilirse temizlenir.

- Zorunlu alanlar `null` yapılamaz.

- Boş güncelleme isteği geçersizdir.

- Kimlik, Tenant sahipliği ve sistem alanları değiştirilemez.

- `fleetStatus` yalnızca ayrı status endpoint'i üzerinden değiştirilir.

### Güvenlik

- Bütün Vehicle endpoint'leri Tenant Admin oturumu gerektirir.

- Tenant kimliği istemciden değil doğrulanmış sunucu oturumundan alınır.

- Başka Tenant'a ait Vehicle kayıtları için bilgi sızdırmayan 404 yanıtı kullanılır.

- Para değerleri API yanıtlarında string olarak döndürülür.

- Prisma ve SQL hata ayrıntıları doğrudan istemciye gösterilmez.

## 6. Kritik Dosyalar

### Backend

- `apps/api/prisma/schema.prisma`

- `apps/api/prisma/migrations/`

- `apps/api/src/auth/guards/tenant-jwt-auth.guard.ts`

- `apps/api/src/auth/tenant-auth-context.ts`

- `apps/api/src/tenants/tenant-profile.controller.ts`

### Frontend

- `apps/web/types/vehicle.ts`

- `apps/web/components/vehicles/`

- `apps/web/lib/vehicles/`

### Mimari ve ekip belgeleri

- `docs/architecture/vehicle-management.md`

- `docs/architecture/vehicle-api-contract.md`

- `docs/architecture/tenant-authentication.md`

- `docs/team/PROJECT_STATUS.md`

## 7. F2 — Vehicle Prisma Modeli ve Migration

- **Sorumlu:** Mustafa

- **Branch:** `feature/f2-vehicle-prisma-model`

- **PR:** #73 — Merge edildi

- **Durum:** Tamamlandı, `main` branch'ine merge edildi

### Yapılan değişiklikler

PostgreSQL veritabanında araç bilgilerinin saklanabilmesi için Prisma `Vehicle` modeli oluşturuldu.

Eklenen temel özellikler:

- Tenant ile Vehicle arasında bire-çok ilişki kuruldu.

- Her aracın bir Tenant'a ait olması zorunlu tutuldu.

- Araç kimlik ve teknik özellik alanları tanımlandı.

- Opsiyonel araç özellikleri eklendi.

- Günlük fiyat, depozito ve ek kilometre ücreti için `Decimal(12,2)` kullanıldı.

- Araç kategorisi, yakıt, vites, para birimi ve filo durumu enum'ları oluşturuldu.

- Varsayılan filo durumu `ACTIVE` olarak belirlendi.

- Aynı Tenant içerisinde aynı plakanın tekrar kaydedilmesini engelleyen birleşik benzersizlik kuralı eklendi.

- Tenant bazlı filo durumu ve oluşturulma tarihi indeksleri tanımlandı.

- Tenant silme işleminde ilişkili araçların korunması için `onDelete: Restrict` kullanıldı.

### Değişen temel dosyalar

- `apps/api/prisma/schema.prisma`

- `apps/api/prisma/migrations/20261119185537_add_vehicle_model/migration.sql`

### Yeni veya değişen API

Yok.

F2 yalnızca veritabanı modelini ve migration yapısını kapsamaktadır.

Vehicle listeleme, detay, oluşturma ve güncelleme endpoint'leri sonraki görevlerde geliştirilecektir.

### Migration

Migration adı:

`20261119185537_add_vehicle_model`

Yerel geliştirme veritabanına başarıyla uygulandı.

Prisma çıktısı:

`Your database is now in sync with your schema.`

Migration içerisinde:

- Vehicle enum türleri

- Vehicle tablosu

- Tenant foreign key ilişkisi

- Tenant bazlı indeksler

- Tenant ve plaka birleşik benzersizlik kuralı

oluşturuldu.

### Prisma Client

Prisma Client 7.10.1 başarıyla oluşturuldu.

Komut:

`npx prisma generate`

### Environment ve dependency değişiklikleri

Yeni environment değişkeni veya bağımlılık eklenmedi.

Mevcut Prisma sürümü korunmuştur.

### Test ve doğrulama sonuçları

- `npx prisma format` — Başarılı

- `npx prisma validate` — Başarılı

- `npx prisma migrate dev --name add_vehicle_model --create-only` — Migration dosyası oluşturuldu

- `npx prisma migrate dev` — Migration yerel veritabanına başarıyla uygulandı

- `npx prisma generate` — Başarılı

- `npm run build` — Başarılı

- `npm test` — 19 test dosyası, 96 test başarılı

Mevcut backend testleri başarılıdır. Vehicle API henüz geliştirilmediği için Vehicle endpoint testleri bu aşamada bulunmamaktadır.

### Diğer geliştiricinin yapması gerekenler

G1 geliştirmesi PR #74 ile tamamlanarak main branch'ine merge edilmiştir.

G2 form UX geliştirmesi tamamlanmış ve PR inceleme sürecindedir.

F2 kapsamında frontend API entegrasyonu gerekmemektedir.

Gerçek Vehicle API entegrasyonu başlamadan önce `vehicle-api-contract.md` ve mevcut frontend tipleri karşılaştırılmalıdır.

### Sonraki bağımlı görev

F3 — Tenant Vehicle listeleme ve detay API geliştirmesi.

## G2 — Vehicle Create/Edit Form UX ve Tenant Tasarım Uyumu

- **Sorumlu:** Eda

- **Branch:** `refactor/g2-vehicle-form-ux`

- **Commit:** `8e2d061`

- **PR:** Merge edildi
- **Durum:** Tamamlandı, main branch'ine merge edildi

### Yapılan değişiklikler

- Araç ekleme/düzenleme formu Tenant Admin tasarımına uygun şekilde yenilendi.

- Form alanları Araç Kimliği, Teknik Bilgiler, Operasyon ve Fiyatlandırma olarak düzenlendi.

- Mobilde tek, masaüstünde iki sütunlu kompakt form tasarımı uygulandı.

- Alanlara örnek placeholder değerleri eklendi.

- Kilometre ve fiyat alanlarına görsel birim etiketleri eklendi.

- Zorunlu alan ve doğrulama hata mesajları iyileştirildi.

- Form gönderiminde ilk hatalı alana otomatik odaklanma sağlandı.

- Kaydedilmemiş değişikliklerde İptal onayı eklendi.

- `hasAirConditioning` alanında `null`, `true` ve `false` değerleri desteklendi.

- Mevcut ortak create/edit form yapısı korundu.

### Değişen temel dosyalar

- `apps/web/app/tenant/(dashboard)/vehicles/new/page.tsx`

- `apps/web/components/vehicles/VehicleForm.tsx`

- `apps/web/components/vehicles/VehicleFormSection.tsx`

- `apps/web/components/vehicles/VehicleForm.test.tsx`

- `apps/web/lib/vehicles/validation.ts`

- `apps/web/types/vehicle.ts`

### Yeni veya değişen API

Yok. Gerçek Vehicle API entegrasyonu G5 kapsamındadır.

### Migration

Yok. F2 Prisma modeli ve migration yapısı değiştirilmedi.

### Environment/dependency değişiklikleri

Yeni bağımlılık veya environment değişkeni eklenmedi.

### Test sonuçları

- `npx tsc --noEmit` — Başarılı

- `npx vitest run` — 4 test dosyası, 37 test başarılı

- `npm run lint` — Başarılı

- `npm run build` — Başarılı

- 375 px mobil görünüm — Manuel kontrol başarılı

- Placeholder, fiyat birimleri ve form davranışları — Manuel kontrol başarılı

### Diğer geliştiricinin yapması gerekenler

- Mevcut Prisma Vehicle modeli ve F1 API sözleşmesi korunmalıdır.

- `tenantId` formdan gönderilmemelidir.

- Decimal fiyat değerleri API sözleşmesine uygun string biçiminde kalmalıdır.

- Vehicle oluşturma ve güncelleme endpoint'leri G2 kapsamında kullanılmamaktadır.

### Sonraki bağımlı görev

G5 — Gerçek Vehicle API entegrasyonu.

## F3 — Tenant Vehicle Read API

- **Sorumlu:** Mustafa
- **Branch:** `feature/f3-tenant-vehicle-read-api`
- **PR:** Güncel durum için GitHub PR kaydına bakılmalı
- **Durum:** Geliştirme ve yerel testler tamamlandı

### Yapılan değişiklikler

- Tenant Admin için araç listeleme ve detay endpoint'leri geliştirildi.
- JWT tabanlı Tenant doğrulaması ve Tenant izolasyonu uygulandı.
- Araç listelemesine pagination, arama, filtreleme ve sıralama eklendi.
- Araç yanıtları için Response Mapper ve Swagger DTO'ları oluşturuldu.
- Para alanları iki ondalıklı string biçimine dönüştürüldü.
- Tenant Admin yanıtlarından `tenantId` çıkarıldı.
- Başka Tenant'a ait araç detayları için 404 davranışı uygulandı.

### Değişen temel dosyalar

- `apps/api/src/app.module.ts`
- `apps/api/src/vehicles/`

### Yeni veya değişen API

- `GET /tenant/vehicles`
- `GET /tenant/vehicles/:id`

Listeleme parametreleri:

- `page`, `limit`, `search`
- `category`, `fleetStatus`, `transmission`, `fuelType`
- `sortBy`, `sortOrder`

Listeleme yanıtı:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Migration

Yok. F2'de oluşturulan Prisma Vehicle modeli kullanıldı.

### Environment/dependency değişiklikleri

Yeni environment değişkeni veya bağımlılık eklenmedi.

### Test sonuçları

- `npm run build` — Başarılı
- `npx vitest run` — 22 dosyada 120 test başarılı
- F3 kapsamında 24 yeni otomatik test eklendi.
- Swagger üzerinden yetkisiz ve yetkili listeleme istekleri kontrol edildi.
- Gerçek veritabanında iki Tenant ile uçtan uca izolasyon testi henüz yapılmadı.

### Diğer geliştiricinin yapması gerekenler

- Frontend entegrasyonunda `docs/architecture/vehicle-api-contract.md` esas alınmalı.
- Listeleme yanıtı `items` ve `pagination` alanlarını içerir.
- Para alanları decimal string biçimindedir.
- Tenant Admin araç yanıtlarında `tenantId` bulunmaz.
- Frontend demo sıralamasındaki `modelYear` yerine API sözleşmesindeki sıralama alanları kullanılmalıdır.
- Araç oluşturma ve güncelleme endpoint'leri F3 kapsamında değildir.

### Sonraki bağımlı görev

F4 — GitHub issue kapsamı doğrulanarak başlanacak.

## 8. PR Sonrası Güncelleme Kuralı

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

## 9. Geliştirme Asistanları İçin Çalışma Yöntemi

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