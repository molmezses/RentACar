# F9 — Reservation Lifecycle, Secure Tracking & API Contracts

**Issue:** #62
**Status:** Architecture Design
**Scope:** Documentation only
**Depends on:** F8 — Customer & Reservation Domain Architecture

## 1. Amaç ve Kapsam

Bu doküman, RentACar multi-tenant SaaS platformundaki hesapsız rezervasyon sisteminin iş akışlarını, API sözleşmelerini, güvenlik kurallarını, müsaitlik kontrolünü ve bildirim mimarisini tanımlar.

F8 kapsamında belirlenen Customer, Reservation, Location, ExtraService, ReservationExtra ve Pricing domain kararları esas alınır.

Bu doküman yeni özelliklerin geliştirildiği anlamına gelmez. Prisma migration, NestJS endpoint, frontend ekranı veya çalışan e-posta sistemi bu görevde oluşturulmaz.

### MVP hedefleri

- Müşterinin hesap açmadan rezervasyon oluşturması
- Rezervasyonun başlangıçta `PENDING` olması
- Tenant Admin tarafından onay, ret ve iptal işlemleri
- Güvenli takip koduyla rezervasyon durumunun sorgulanması
- Rezervasyon özeti ve takip kodunun müşteriye e-postayla gönderilmesi
- Tenant Admin'e yeni rezervasyon bildirimi
- Araç müsaitliğinin güvenli kontrol edilmesi
- Tenant izolasyonu
- Backend kontrollü fiyatlandırma
- Location ve ExtraService yönetim API sözleşmeleri

### MVP dışında

- Müşteri hesabı, şifre ve giriş sistemi
- SMS ve OTP doğrulaması
- Online ödeme
- Otomatik rezervasyon onayı
- Müşteri tarafından doğrudan iptal
- Dinamik fiyatlandırma
- Kampanya ve kupon sistemi
- Gelişmiş filo operasyonları

---

## 2. F8 ile Mimari Bağlantı

F8 aşağıdaki domain kurallarını tanımlar:

- Her rezervasyonda yeni bir Customer kaydı oluşturulur.
- Ad, soyad, telefon, e-posta ve doğum tarihi zorunludur.
- Minimum yaş kontrolü teslim alma tarihine göre yapılır.
- Rezervasyon, Tenant, Customer, Vehicle ve iki Location kaydına bağlanır.
- Tenant kendi Location ve ExtraService kayıtlarını yönetir.
- Alış ve iade tarihleri saatleriyle birlikte saklanır.
- Fiyatlar backend tarafından hesaplanır.
- Rezervasyon anındaki müşteri, araç, lokasyon ve fiyat bilgileri snapshot olarak korunur.
- Depozito, kiralama toplamından ayrı tutulur.
- Tenant izolasyonu hem backend hem veritabanı seviyesinde sağlanır.
- Tenant kayıtlarını pasife alabilir veya silebilir; geçmiş rezervasyonların bütünlüğü korunur.

Bu doküman söz konusu modellerin nasıl kullanılacağını tanımlar.

**Kaynak doküman:** `docs/architecture/customer-reservation-domain.md`

---

## 3. Rezervasyon Yaşam Döngüsü

### 3.1. Durumlar

```prisma
enum ReservationStatus {
  PENDING
  CONFIRMED
  REJECTED
  CANCELLED
}
```

| Durum     | Açıklama                                       |
| --------- | ---------------------------------------------- |
| PENDING   | Tenant Admin'in kararını bekleyen talep        |
| CONFIRMED | Tenant Admin tarafından onaylanmış rezervasyon |
| REJECTED  | Tenant Admin tarafından reddedilmiş talep      |
| CANCELLED | İptal edilmiş rezervasyon                      |

### 3.2. İzin verilen geçişler

| Mevcut durum | İşlem      | Yeni durum | Yetkili        |
| ------------ | ---------- | ---------- | -------------- |
| Yeni talep   | Oluşturma  | PENDING    | Public müşteri |
| PENDING      | Onaylama   | CONFIRMED  | Tenant Admin   |
| PENDING      | Reddetme   | REJECTED   | Tenant Admin   |
| PENDING      | İptal etme | CANCELLED  | Tenant Admin   |
| CONFIRMED    | İptal etme | CANCELLED  | Tenant Admin   |

`REJECTED` ve `CANCELLED` durumları MVP için son durumlardır.

`CONFIRMED` durumundaki rezervasyon doğrudan `REJECTED` durumuna geçirilemez.

Aynı durum geçişi ikinci kez istendiğinde mevcut durumu sessizce değiştirmek yerine uygun bir hata dönülür.

### 3.3. Durum geçişlerinde tutulacak alanlar

- `createdAt`
- `updatedAt`
- `confirmedAt`
- `rejectedAt`
- `cancelledAt`

Ret ve iptal işlemleri için tenant'ın girebileceği opsiyonel açıklama alanları tasarlanabilir.

Müşterinin public takip ekranında gösterilen açıklamalar kişisel veya şirket içi gizli bilgi içermemelidir.

### 3.4. İşlem atomikliği

Rezervasyon durum değişikliği ve ilgili bildirim event'inin oluşturulması aynı veritabanı transaction'ı içinde yapılmalıdır.

Örneğin onay işleminde:

1. Rezervasyonun ilgili tenant'a ait olduğu doğrulanır.
2. Durumunun `PENDING` olduğu kontrol edilir.
3. Araç müsaitliği doğrulanır.
4. Durum `CONFIRMED` yapılır.
5. Bildirim için outbox event'i oluşturulur.
6. Transaction başarılı olursa işlem tamamlanır.

Bildirim e-postasının fiilen gönderilmesi transaction dışında gerçekleşir.

---

## 4. Public Tenant Bağlamı

Platform multi-tenant yapıda olduğu için public rezervasyon istekleri doğru tenant'a yönlendirilmelidir.

Tenant bağlamı doğrulanmış alan adı, tenant'a ait public URL veya uygulama yapılandırması üzerinden çözümlenebilir.

Örnek kavramsal adresler:

- `firma-a.example.com`
- `firma-b.example.com`

Bu adresler gerçek uygulama URL'si değildir.

Public istekte gönderilen rastgele bir `tenantId` değerine güvenilmez.

Backend:

- İsteğin hangi tenant'a ait olduğunu belirler.
- Tenant'ın rezervasyon kabul etmeye uygun durumda olduğunu doğrular.
- Yalnızca o tenant'ın araç, lokasyon ve ek hizmet kayıtlarını kullanır.
- Başka tenant'a ait kayıtları kabul etmez.

Mevcut projedeki tenant çözümleme ve route yapısı implementasyondan önce yeniden incelenmelidir.

---

## 5. Public Rezervasyon Oluşturma Akışı

### 5.1. Genel akış

1. Müşteri tenant'ın web sitesi veya mobil uygulamasını açar.
2. Teslim alma ve iade lokasyonlarını seçer.
3. Teslim alma ve iade tarih/saatlerini belirler.
4. Seçilen aralık için uygun araçları inceler.
5. Araç seçer.
6. İsteğe bağlı ek hizmetleri seçer.
7. Ad, soyad, telefon, e-posta ve doğum tarihini girer.
8. Gerekirse uçuş kodunu ekler.
9. Backend tüm verileri doğrular.
10. Backend güncel fiyatları hesaplar.
11. Customer ve Reservation kayıtları oluşturulur.
12. Seçilen hizmetler ReservationExtra kayıtlarına dönüştürülür.
13. Snapshot alanları kaydedilir.
14. Rezervasyon `PENDING` durumunda oluşturulur.
15. Güvenli takip kodu oluşturulup müşteriye gösterilir.
16. E-posta bildirimleri outbox üzerinden gönderilmek üzere kaydedilir.

Customer, Reservation, ReservationExtra ve outbox kayıtları, uygun transaction sınırında birlikte kalıcılaştırılmalıdır.

### 5.2. Önerilen endpoint

`POST /public/reservations`

Bu URL, F9 kapsamında önerilen sözleşmedir. Nihai yol mevcut NestJS route düzeniyle uyumlandırılacaktır.

### 5.3. Request örneği

```json
{
  "vehicleId": "vehicle_123",
  "pickupLocationId": "location_1",
  "returnLocationId": "location_2",
  "pickupAt": "2026-12-15T07:30:00Z",
  "returnAt": "2026-12-20T15:00:00Z",
  "customer": {
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "phone": "+905551112233",
    "email": "ahmet@example.com",
    "dateOfBirth": "1998-05-10"
  },
  "flightNumber": "TK1234",
  "extras": [
    {
      "extraServiceId": "extra_1",
      "quantity": 2
    }
  ]
}
```

Bu örnekte tarihler UTC gösterimindedir.

Gerçek frontend yerel saatleri gösterebilir; API dönüşüm kuralları aşağıda tanımlanmıştır.

### 5.4. Backend doğrulamaları

- Tenant geçerli ve rezervasyon kabul edebilir durumda olmalıdır.
- Araç ilgili tenant'a ait olmalıdır.
- Araç silinmemiş ve kiralama için uygun filo durumunda olmalıdır.
- Alış ve iade lokasyonları ilgili tenant'a ait olmalıdır.
- Lokasyonlar aktif olmalıdır.
- Alış lokasyonunda `allowsPickup = true` olmalıdır.
- İade lokasyonunda `allowsReturn = true` olmalıdır.
- İade zamanı alış zamanından sonra olmalıdır.
- Geçmiş tarihli yeni rezervasyon engellenmelidir.
- Müşteri teslim tarihinde en az 18 yaşında olmalıdır.
- Ad, soyad, telefon ve e-posta doğrulanmalıdır.
- Ek hizmetler aktif ve ilgili tenant'a ait olmalıdır.
- Ek hizmet miktarları izin verilen sınırda olmalıdır.
- Aynı ek hizmetin yinelenen satırları reddedilmeli veya açık bir normalizasyon kuralıyla birleştirilmelidir.
- Tüm fiyatlar backend üzerinden yeniden hesaplanmalıdır.

### 5.5. Success response örneği

HTTP `201 Created`

```json
{
  "reservation": {
    "id": "reservation_123",
    "trackingCode": "EXAMPLE-TRACKING-CODE",
    "status": "PENDING",
    "vehicle": {
      "make": "Toyota",
      "model": "Corolla"
    },
    "pickup": {
      "locationName": "Havalimanı",
      "at": "2026-12-15T07:30:00Z"
    },
    "return": {
      "locationName": "Merkez Ofis",
      "at": "2026-12-20T15:00:00Z"
    },
    "pricing": {
      "rentalDays": 6,
      "vehicleTotal": "9000.00",
      "extrasTotal": "1800.00",
      "rentalTotal": "10800.00",
      "depositAmount": "3000.00",
      "currency": "TRY"
    }
  },
  "emailNotification": {
    "status": "QUEUED"
  }
}
```

Örnek fiyatlar ve kimlikler temsili değerlerdir.

Takip kodu yalnızca ilk oluşturma yanıtında düz metin olarak gösterilir.

`QUEUED`, e-postanın alıcıya teslim edildiği anlamına gelmez.

Public başarı yanıtı, müşteriye ait gereksiz kişisel verileri tekrar içermemelidir.

### 5.6. Tekrarlanan istekler

Ağ hatası veya çift tıklama nedeniyle aynı rezervasyon isteğinin tekrar gönderilmesi mümkündür.

İmplementasyonda public oluşturma işlemine uygun bir idempotency mekanizması eklenmelidir.

Aynı idempotency anahtarı ve aynı istek için ikinci bir Customer/Reservation oluşturulmamalıdır.

İlk yanıtta verilen takip kodunun geri getirilebilmesi için kodun yalnızca hash olarak saklanması ile tekrar yanıt üretme gereksinimi ayrıca çözümlenmelidir.

Önerilen yaklaşım, kısa süreli ve güvenli bir idempotency yanıt kaydıdır; hassas yanıt verisinin saklama süresi sınırlı olmalıdır.

---

## 6. Güvenli Takip Kodu

### 6.1. Amaç

Müşteri hesap oluşturmadan rezervasyonunun güncel durumunu görüntüleyebilmelidir.

Takip kodu, belirli bir rezervasyona sınırlı erişim sağlayan gizli bir erişim anahtarı gibi değerlendirilmelidir.

### 6.2. Kod üretimi

Takip kodu:

- Kriptografik olarak güvenli rastgele kaynakla üretilir.
- Sıralı veya tahmin edilebilir olmaz.
- Rezervasyon ID'sinden türetilmez.
- En az 128 bit rastgele entropi içerir.
- Kullanıcı tarafından rahat okunabilir bir biçime dönüştürülebilir.
- Benzersizlik çakışmasında güvenli biçimde yeniden üretilir.

Örnek görünüm:

`RC-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`

Biçim yalnızca örnektir; gerçek karakter kümesi ve uzunluğu 128 bit entropiyi koruyacak şekilde seçilmelidir.

### 6.3. Veritabanında saklama

Reservation kaydında:

`trackingCodeHash`

alanı bulunur.

Önerilen yöntem:

`HMAC-SHA-256(serverSecret, normalizedTrackingCode)`

Kodun kendisi düz metin olarak kalıcı Reservation kaydında saklanmaz.

HMAC kullanımı, rastgele kodun özetini veritabanında aramayı mümkün kılar.

Sunucu sırrı kaynak kodda veya veritabanında düz metin yapılandırma olarak tutulmamalıdır.

Anahtar rotasyonu ve eski kodların doğrulanması için anahtar sürümleme stratejisi tasarlanmalıdır.

Takip kodu loglarda, hata mesajlarında veya analitik event'lerinde açık biçimde yazılmamalıdır.

### 6.4. Public takip endpoint'i

`POST /public/reservations/track`

Örnek request:

```json
{
  "trackingCode": "EXAMPLE-TRACKING-CODE"
}
```

Public takip isteği, ilgili tenant bağlamında işlenir.

Yanlış tenant üzerinden başka tenant'ın rezervasyonu görüntülenemez.

Takip kodu aramasında tenant kapsamı korunmalı, bulunamayan ve başka tenant'a ait kodlar arasında bilgi sızdıran farklı hata mesajları kullanılmamalıdır.

### 6.5. Public response örneği

```json
{
  "status": "CONFIRMED",
  "vehicle": {
    "make": "Toyota",
    "model": "Corolla"
  },
  "pickup": {
    "locationName": "Havalimanı",
    "at": "2026-12-15T07:30:00Z"
  },
  "return": {
    "locationName": "Merkez Ofis",
    "at": "2026-12-20T15:00:00Z"
  },
  "pricing": {
    "rentalTotal": "10800.00",
    "currency": "TRY"
  }
}
```

### 6.6. Public verilerin sınırlandırılması

Takip endpoint'inde şu bilgiler açık biçimde döndürülmez:

- Doğum tarihi
- Telefon numarası
- E-posta adresi
- Tenant'ın iç notları
- Müşterinin kimlik veya ehliyet bilgileri
- Yöneticiye özel operasyonel veriler

Müşteri iletişim bilgilerini göstermek gerekirse maskeleme değerlendirilmelidir.

Takip koduyla yalnızca ilgili rezervasyonun sınırlı bilgilerine erişilebilir.

### 6.7. Güvenlik önlemleri

- IP ve uygun tenant kapsamıyla rate limiting
- İstek boyutu sınırı
- Kod biçimi doğrulaması
- Güvenli loglama
- Genel hata mesajları
- Yetkisiz tenant erişiminin engellenmesi
- HTTPS zorunluluğu
- Public yanıtlar için uygun `Cache-Control: no-store`
- Takip kodunun URL query parametresinde taşınmaması

Takip kodu e-postada gönderildiği için e-posta hesabına erişimi olan kişinin kodu da öğrenebileceği kabul edilir.

Bu nedenle takip endpoint'inin döndürdüğü veriler minimum seviyede tutulmalıdır.

---

## 7. Tenant Admin Rezervasyon API'leri

Tenant Admin endpoint'leri mevcut tenant authentication mekanizmasını kullanmalıdır.

Yönetici yalnızca kendi tenant'ına ait rezervasyonları görebilir ve yönetebilir.

### 7.1. Rezervasyon listesi

`GET /tenant/reservations`

Önerilen filtreler:

- `status`
- `vehicleId`
- `pickupFrom`
- `pickupTo`
- `createdFrom`
- `createdTo`
- `page`
- `limit`

Örnek response:

```json
{
  "data": [
    {
      "id": "reservation_123",
      "status": "PENDING",
      "customerName": "Ahmet Yılmaz",
      "vehicleName": "Toyota Corolla",
      "pickupAt": "2026-12-15T07:30:00Z",
      "returnAt": "2026-12-20T15:00:00Z",
      "rentalTotal": "10800.00",
      "currency": "TRY"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

Sıralama ve sayfalama backend'de uygulanır.

### 7.2. Rezervasyon detayı

`GET /tenant/reservations/:id`

Detay yanıtında tenant yetkisine uygun olarak:

- Müşteri iletişim bilgileri
- Seçilen araç
- Alış ve iade lokasyonları
- Alış ve iade tarih/saatleri
- Ek hizmetler
- Fiyat ve depozito
- Rezervasyon durumu
- Oluşturulma ve işlem tarihleri
- Yetkili yöneticiye yönelik operasyonel bilgiler

gösterilebilir.

Takip kodunun düz metni veritabanında saklanmadığı için admin detay yanıtında geri döndürülmez.

### 7.3. Onaylama

`POST /tenant/reservations/:id/confirm`

Kurallar:

- Tenant ownership kontrol edilir.
- Rezervasyon `PENDING` olmalıdır.
- Araç uygun filo durumunda olmalıdır.
- Tarih aralığı müsaitliği yeniden kontrol edilir.
- Eşzamanlı onaylara karşı veritabanı koruması uygulanır.
- `status = CONFIRMED` yapılır.
- `confirmedAt` kaydedilir.
- Müşteri bildirimi için outbox event'i oluşturulur.

### 7.4. Reddetme

`POST /tenant/reservations/:id/reject`

Opsiyonel request:

```json
{
  "reason": "Seçilen tarihler için araç sağlanamıyor."
}
```

Kurallar:

- Rezervasyon `PENDING` olmalıdır.
- `status = REJECTED` yapılır.
- `rejectedAt` kaydedilir.
- Müşteriye durum değişikliği bildirimi planlanır.

### 7.5. İptal

`POST /tenant/reservations/:id/cancel`

Opsiyonel request:

```json
{
  "reason": "Müşteri talebi üzerine iptal edildi."
}
```

Kurallar:

- Rezervasyon `PENDING` veya `CONFIRMED` olmalıdır.
- `status = CANCELLED` yapılır.
- `cancelledAt` kaydedilir.
- Müşteriye iptal bildirimi planlanır.
- Onaylı rezervasyonun müsaitlik blokajı kaldırılır.

İptal, veritabanından silme işlemi değildir.

Teslim zamanı geçmiş rezervasyonların iptaline ilişkin operasyonel kurallar canlı kullanım öncesinde ayrıca değerlendirilmelidir.

---

## 8. Araç Müsaitliği

### 8.1. Temel kural

Bir aracın filo durumunun `ACTIVE` olması, belirli tarih aralığında müsait olduğu anlamına gelmez.

Rezervasyonlar ayrıca kontrol edilir.

### 8.2. PENDING davranışı

MVP kararı:

`PENDING` rezervasyonlar aracı bloke etmez.

Aynı araç ve zaman aralığı için birden fazla müşteri rezervasyon talebi oluşturabilir.

Tenant Admin uygun talebi onaylar.

### 8.3. CONFIRMED davranışı

Aynı aracın birbiriyle çakışan iki `CONFIRMED` rezervasyonu olamaz.

Önerilen zaman aralığı gösterimi:

`[pickupAt, returnAt)`

Başlangıç dahil, bitiş hariçtir.

Bu sayede bir rezervasyonun bittiği anda diğer rezervasyon başlayabilir.

Gerçek operasyonlarda temizlik/hazırlık süresi gerekiyorsa ayrıca ek kural tanımlanmalıdır.

### 8.4. Çakışma koşulu

İki aralık şu koşulla çakışır:

```text
existing.pickupAt < requested.returnAt
AND
existing.returnAt > requested.pickupAt
```

Yalnızca `CONFIRMED` rezervasyonlar blokaj oluşturur.

### 8.5. Eşzamanlılık sorunu

İki Tenant Admin işlemi aynı aracı aynı anda onaylamaya çalışabilir.

Yalnızca önce sorgulama yapıp ardından status güncellemek yeterli değildir.

Her iki işlem de aynı anda aracı müsait görebilir.

### 8.6. Önerilen güvenlik stratejisi

PostgreSQL tarafında aynı araç için çakışan onaylı rezervasyonları engelleyen exclusion constraint yaklaşımı değerlendirilmelidir.

Kavramsal örnek:

```sql
EXCLUDE USING gist (
  "vehicleId" WITH =,
  tstzrange("pickupAt", "returnAt", '[)') WITH &&
)
WHERE ("status" = 'CONFIRMED');
```

Bu ifade doğrudan uygulanacak migration değildir.

Gerçek uygulamada:

- PostgreSQL extension gereksinimleri
- Prisma migration uyumu
- Sütunların gerçek veritabanı tipleri
- Tenant kapsamı
- Silinmiş/iptal edilmiş kayıtlar
- Transaction izolasyonu
- İndeks davranışı

doğrulanmalıdır.

Alternatif olarak aynı araç için serialize edilmiş transaction/lock stratejisi kullanılabilir.

**Hedef değişmez:** İki eşzamanlı onay işlemi çakışan iki `CONFIRMED` kaydı oluşturamamalıdır.

### 8.7. Müsaitlik sorgulama API'si

Önerilen endpoint:

`GET /public/vehicles/availability`

Parametreler:

- `pickupAt`
- `returnAt`
- `pickupLocationId`
- `returnLocationId`

Bu endpoint yalnızca o anda hesaplanan uygunluk bilgisini verir.

Aracın listelenmesi, sonradan kesin onay garantisi değildir.

Tenant onayı sırasında müsaitlik tekrar doğrulanır.

---

## 9. Location Yönetim API'leri

Tenant Admin kendi lokasyonlarını yönetebilir.

Önerilen endpoint'ler:

| Method | Endpoint                | Açıklama                                |
| ------ | ----------------------- | --------------------------------------- |
| GET    | `/tenant/locations`     | Lokasyonları listele                    |
| POST   | `/tenant/locations`     | Lokasyon oluştur                        |
| GET    | `/tenant/locations/:id` | Lokasyon detayı                         |
| PATCH  | `/tenant/locations/:id` | Lokasyon düzenle                        |
| DELETE | `/tenant/locations/:id` | Lokasyonu sil                           |
| GET    | `/public/locations`     | Rezervasyona uygun lokasyonları listele |

### 9.1. Oluşturma örneği

```json
{
  "name": "Esenboğa Havalimanı",
  "type": "AIRPORT",
  "address": "Ankara, Türkiye",
  "isActive": true,
  "allowsPickup": true,
  "allowsReturn": true
}
```

`tenantId`, yönetici oturumundan elde edilir.

Public istekler yalnızca uygun aktif lokasyonları görüntüler.

### 9.2. Silme

- Kullanılmamış kayıt fiziksel olarak silinebilir.
- Geçmiş rezervasyona bağlı kayıt mantıksal olarak silinebilir.
- Geçmiş rezervasyonun lokasyon snapshot bilgileri korunur.
- Silinmiş veya pasif kayıt yeni rezervasyonda seçilemez.

Silme işlemi tenant'ın yönetim deneyiminde gerçek bir kaldırma işlemi gibi çalışmalıdır; her şeyin yalnızca pasif durumda kalması zorunlu değildir.

---

## 10. ExtraService Yönetim API'leri

Önerilen endpoint'ler:

| Method | Endpoint                     | Açıklama                 |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/tenant/extra-services`     | Hizmetleri listele       |
| POST   | `/tenant/extra-services`     | Hizmet oluştur           |
| GET    | `/tenant/extra-services/:id` | Hizmet detayı            |
| PATCH  | `/tenant/extra-services/:id` | Hizmet düzenle           |
| DELETE | `/tenant/extra-services/:id` | Hizmeti sil              |
| GET    | `/public/extra-services`     | Aktif hizmetleri listele |

### 10.1. Oluşturma örneği

```json
{
  "name": "Bebek Koltuğu",
  "description": "Çocuk güvenlik koltuğu",
  "pricingType": "PER_DAY",
  "price": "150.00",
  "currency": "TRY",
  "maxQuantity": 2,
  "isActive": true
}
```

Kurallar:

- Hizmet ilgili tenant'a ait olmalıdır.
- Fiyat negatif olamaz.
- Azami adet pozitif olmalıdır.
- Public tarafta yalnızca aktif hizmetler listelenir.
- Rezervasyonda kullanılacak para birimiyle uyum aranır.
- Güncel katalog değişiklikleri eski rezervasyon fiyatlarını etkilemez.
- Geçmişte kullanılmış hizmetlerin silinmesi snapshot kayıtlarını bozmamalıdır.

---

## 11. Fiyat Teklifi ve Hesaplama API'si

### 11.1. Amaç

Müşteri rezervasyon oluşturmadan önce toplam fiyatı görebilmelidir.

Önerilen endpoint:

`POST /public/reservations/quote`

### 11.2. Request

```json
{
  "vehicleId": "vehicle_123",
  "pickupLocationId": "location_1",
  "returnLocationId": "location_2",
  "pickupAt": "2026-12-15T07:30:00Z",
  "returnAt": "2026-12-20T15:00:00Z",
  "extras": [
    {
      "extraServiceId": "extra_1",
      "quantity": 2
    }
  ]
}
```

### 11.3. Response

```json
{
  "rentalDays": 6,
  "dailyPrice": "1500.00",
  "vehicleTotal": "9000.00",
  "extrasTotal": "1800.00",
  "rentalTotal": "10800.00",
  "depositAmount": "3000.00",
  "currency": "TRY"
}
```

### 11.4. Kurallar

- Fiyat yalnızca backend'de hesaplanır.
- Güncel araç ve ek hizmet bedelleri veritabanından okunur.
- Başlayan her 24 saat için bir günlük ücret uygulanır.
- Ek hizmetlerde `PER_DAY` ve `FIXED` türleri desteklenir.
- Depozito ayrı gösterilir.
- Para alanları Decimal hassasiyetini koruyacak şekilde string olarak döndürülür.
- Fiyat teklifi rezervasyon oluşturmaz.
- Fiyat teklifi kesin rezervasyon garantisi vermez.

Rezervasyon oluşturulurken fiyat yeniden doğrulanır ve snapshot olarak saklanır.

İleride teklifin belirli süre sabit tutulması istenirse quote ID ve geçerlilik süresi ayrı bir özellik olarak tasarlanabilir.

---

## 12. Tarih, Saat ve Zaman Dilimi

### 12.1. Kullanıcı deneyimi

Müşteri tarih ve saati ayrı seçebilir.

Örneğin:

- Alış tarihi: 15 Aralık 2026
- Alış saati: 10.30
- İade tarihi: 20 Aralık 2026
- İade saati: 18.00

### 12.2. API gösterimi

API, gerçek zaman noktalarını ISO 8601 biçiminde ve açık saat dilimi bilgisiyle kabul etmelidir.

Backend, gelen tarih ve saatleri doğrular ve UTC olarak saklar.

### 12.3. Yerel zaman

Saat dilimi tenant veya ilgili lokasyon bağlamında tanımlanmalıdır.

IANA zaman dilimi kimlikleri tercih edilir.

Örnek:

`Europe/Istanbul`

### 12.4. Gün hesaplama

MVP'de başlayan her 24 saatlik süre bir gün ücretlendirilir.

Örneğin:

- 24 saat → 1 gün
- 25 saat → 2 gün
- 48 saat → 2 gün
- 49 saat → 3 gün

Hesaplama, iki gerçek zaman noktası arasındaki geçen süre üzerinden yapılır.

Yaz saati geçişlerinde yerel takvim günü ile 24 saatlik süre aynı olmayabilir.

Bu nedenle arayüzün gösterdiği yerel saat ve backend hesaplaması tutarlı olmalıdır.

### 12.5. Ek doğrulamalar

- Geçersiz saat veya tarih reddedilir.
- İade zamanı alış zamanından sonra olmalıdır.
- Geçmiş tarihli yeni rezervasyon oluşturulamaz.
- Saat dilimi dönüşümü sunucu tarafından güvenilir biçimde yapılır.

---

## 13. E-posta Bildirimleri

### 13.1. Amaç

Rezervasyon oluşturulduğunda müşteri takip kodunu ve rezervasyon özetini e-postasından da bulabilmelidir.

İlk sürümde SMS bulunmaz.

### 13.2. Bildirim olayları

Önerilen event türleri:

- `reservation.created.customer`
- `reservation.created.tenant`
- `reservation.confirmed.customer`
- `reservation.rejected.customer`
- `reservation.cancelled.customer`

Event isimleri kavramsaldır; mevcut projenin event adlandırma standardına göre netleştirilecektir.

### 13.3. Müşteriye rezervasyon oluşturma e-postası

E-postada:

- Takip kodu
- Araç marka/model
- Alış ve iade lokasyonları
- Alış ve iade tarih/saatleri
- Seçilen ek hizmetler
- Kiralama bedeli
- Depozito bilgisi
- `PENDING` durumu
- Rezervasyon takip sayfasına erişim bilgileri

bulunmalıdır.

Müşterinin kişisel bilgileri gereksiz yere tekrar gönderilmemelidir.

### 13.4. Tenant Admin bildirimi

Tenant'ın bildirim için tanımlanmış yetkili e-posta adresine:

- Yeni rezervasyon talebi
- Araç bilgileri
- Tarih ve saatler
- Müşterinin iletişim bilgileri
- Rezervasyon detay sayfası bağlantısı

gönderilebilir.

Admin detay bağlantısı mevcut tenant authentication kontrolünü aşmamalıdır.

### 13.5. Transactional Outbox

Rezervasyon oluşturma transaction'ında gerekli bildirim event'leri outbox tablosuna kaydedilir.

Ayrı bir worker bunları e-posta sağlayıcısına iletir.

Bu sayede e-posta sağlayıcısı geçici olarak çalışmasa bile rezervasyon kaydı kaybolmaz.

### 13.6. Gönderim durumları

Önerilen durumlar:

- `PENDING`
- `PROCESSING`
- `SENT`
- `FAILED`

Başarısız gönderimlerde kontrollü yeniden deneme uygulanmalıdır.

Tekrar gönderimler aynı bildirim olayının sınırsız sayıda e-postaya dönüşmesine neden olmamalıdır.

### 13.7. Takip kodunun e-postaya aktarılması

Takip kodunun veritabanında yalnızca hash olarak saklanması, sonradan e-posta üretimi açısından özel bir tasarım gerektirir.

Kodun gönderim için geçici olarak kullanılabilir olması gerekir.

Önerilen çözüm:

- Kod oluşturma anında plaintext değeri müşteriye gösterilir.
- Bildirim için gereken kod, outbox payload'ında uygulama seviyesinde şifrelenmiş olarak tutulur.
- Şifre çözme anahtarı ayrı ve güvenli biçimde saklanır.
- Gönderim tamamlandığında hassas payload için kısa saklama ve temizleme politikası uygulanır.
- Plaintext takip kodu loglanmaz.

Bu tasarımın güvenlik, operasyon ve yeniden deneme ayrıntıları implementasyon öncesinde doğrulanmalıdır.

Mevcut `InvitationDelivery` modeli rezervasyon bildirimleri için doğrudan yeniden kullanılmaz; genel outbox yapısı ile domain'e özel bildirim kayıtları ayrı değerlendirilir.

### 13.8. E-posta doğrulaması

MVP'de e-posta zorunludur ama OTP veya doğrulama bağlantısı zorunlu değildir.

Dolayısıyla hatalı e-posta adresi girilmiş olabilir.

Başarı ekranındaki takip kodu, e-posta tesliminden bağımsız olarak müşteriye gösterilir.

---

## 14. API Hata Sözleşmesi

Önerilen genel hata biçimi:

```json
{
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "Seçilen araç bu tarih aralığında artık müsait değil."
  }
}
```

Önerilen hata kodları:

| Kod                       | HTTP | Açıklama                         |
| ------------------------- | ---- | -------------------------------- |
| VALIDATION_ERROR          | 400  | Geçersiz alanlar                 |
| INVALID_DATE_RANGE        | 400  | Hatalı tarih aralığı             |
| AGE_REQUIREMENT_NOT_MET   | 400  | Minimum yaş şartı sağlanmıyor    |
| UNAUTHORIZED              | 401  | Kimlik doğrulaması gerekli       |
| FORBIDDEN                 | 403  | İşlem yetkisi yok                |
| RESOURCE_NOT_FOUND        | 404  | Kayıt bulunamadı veya erişilemez |
| INVALID_RESERVATION_STATE | 409  | Durum geçişi geçersiz            |
| RESERVATION_CONFLICT      | 409  | Araç müsaitlik çakışması         |
| RATE_LIMITED              | 429  | İstek limiti aşıldı              |
| INTERNAL_ERROR            | 500  | Beklenmeyen sunucu hatası        |

Public takip sorgusunda bulunamayan kodlar ve başka tenant'a ait kodlar arasında ayrım yapan hata metni kullanılmaz.

Hassas teknik hata ayrıntıları kullanıcıya gösterilmez.

---

## 15. Güvenlik Gereksinimleri

### 15.1. Tenant izolasyonu

- Admin sorgularında authenticated tenant kapsamı zorunludur.
- Public sorgularda güvenilir tenant çözümleme uygulanır.
- Başka tenant'a ait kimlikler kullanılamaz.
- Veritabanında uygun birleşik foreign key kısıtları kullanılır.

### 15.2. Kişisel veriler

- Gerekli olmayan kişisel veriler public yanıtlarla paylaşılmaz.
- Doğum tarihi public takip yanıtında bulunmaz.
- Yönetici erişimleri tenant yetkileriyle sınırlandırılır.
- Hassas bilgiler loglarda maskelenir.
- Veri saklama ve silme kuralları F8'e uygun olur.

### 15.3. Public API güvenliği

- Rate limiting
- İstek boyutu sınırları
- DTO validation
- Girdi normalizasyonu
- Güvenli tenant çözümleme
- HTTPS
- Güvenli hata mesajları
- Gerekli endpoint'lerde idempotency
- Fiyatların yalnızca backend tarafından hesaplanması

### 15.4. Takip kodu güvenliği

- En az 128 bit rastgele entropi
- Güvenli rastgele sayı üretimi
- HMAC tabanlı arama özeti
- Sunucu sırrının güvenli yönetimi
- Brute-force denemelerini sınırlama
- Loglara plaintext kod yazmama
- Public cevaplarda veri minimizasyonu

---

## 16. Test Planı

Bu görevde gerçek test kodu yazılmaz. Aşağıdaki senaryolar sonraki geliştirme görevlerinde test edilmelidir.

### 16.1. Public rezervasyon testleri

- Hesapsız rezervasyon oluşturulabilir.
- Oluşturulan rezervasyon `PENDING` durumundadır.
- Zorunlu e-posta eksikse istek reddedilir.
- Zorunlu doğum tarihi eksikse istek reddedilir.
- Teslim tarihinde 18 yaşını tamamlamamış müşteri reddedilir.
- Geçersiz tarih aralığı reddedilir.
- Başka tenant'a ait araç veya lokasyon reddedilir.
- Pasif lokasyon veya hizmet reddedilir.
- Fiyat backend'de doğru hesaplanır.
- Tekrarlanan idempotent istek ikinci rezervasyon oluşturmaz.

### 16.2. Rezervasyon yaşam döngüsü

- PENDING → CONFIRMED başarılıdır.
- PENDING → REJECTED başarılıdır.
- PENDING → CANCELLED başarılıdır.
- CONFIRMED → CANCELLED başarılıdır.
- REJECTED → CONFIRMED reddedilir.
- CANCELLED → CONFIRMED reddedilir.
- Başka tenant yöneticisinin işlemi reddedilir.

### 16.3. Müsaitlik testleri

- Aynı araca iki PENDING rezervasyon oluşturulabilir.
- Çakışan iki rezervasyon aynı anda CONFIRMED olamaz.
- Bitiş ve başlangıç zamanları eşit olan iki rezervasyon, ek operasyonel tampon yoksa çakışmaz.
- CANCELLED rezervasyon müsaitliği bloke etmez.
- Eşzamanlı onay denemelerinde yalnızca biri başarılı olur.

### 16.4. Takip güvenliği

- Geçerli kod doğru tenant'ta çalışır.
- Geçersiz kod reddedilir.
- Başka tenant'a ait kodla bilgi alınamaz.
- Public yanıt doğum tarihi veya açık iletişim bilgisi içermez.
- İstek limiti uygulanır.
- Takip kodu loglarda yer almaz.

### 16.5. E-posta ve outbox

- Rezervasyon oluşturulduğunda müşteri bildirimi planlanır.
- Tenant Admin bildirimi planlanır.
- Onay/ret/iptal değişiklikleri bildirim oluşturur.
- E-posta sağlayıcısı hata verse bile rezervasyon kaybolmaz.
- Başarısız event yeniden denenebilir.
- Tekrar denemelerde kontrolsüz mükerrer e-posta oluşmaz.
- Hassas takip kodu verisi güvenli işlenir.

---

## 17. Sonraki Geliştirme Görevleri İçin Bağımlılıklar

F8 ve F9 dokümanları tamamlandığında sistemin bütün yeni özellikleri uygulanmış sayılmaz.

Sonraki backend görevleri için aday iş alanları:

- Prisma Customer, Reservation, Location, ExtraService ve ReservationExtra modelleri
- Migration ve tenant bütünlüğü kısıtları
- Tenant Location CRUD
- Tenant ExtraService CRUD
- Public lokasyon ve hizmet katalogları
- Rezervasyon fiyat teklifi servisi
- Public rezervasyon oluşturma servisi
- Güvenli takip kodu ve takip endpoint'i
- Tenant rezervasyon liste/detay API'leri
- Onay/ret/iptal işlemleri
- Veritabanı seviyesinde müsaitlik koruması
- Rezervasyon e-posta bildirimleri ve outbox worker
- Birim ve entegrasyon testleri

Frontend görevleri için aday iş alanları:

- Tenant lokasyon yönetim ekranları
- Tenant ek hizmet yönetim ekranları
- Public rezervasyon tarih/saat ve lokasyon seçimi
- Araç müsaitlik ve seçme ekranı
- Ek hizmet seçimi
- Müşteri bilgileri formu
- Rezervasyon özeti ve başarı ekranı
- Takip koduyla rezervasyon sorgulama ekranı
- Tenant rezervasyon listesi/detayı
- Tenant onay/ret/iptal arayüzleri

Yeni görevler oluşturulurken backend ve frontend işleri API bağımlılıklarına göre sıralanmalıdır.

Aynı özelliğin frontend ve backend uygulamaları bağımsız ve uyumsuz sözleşmelerle geliştirilmemelidir.

---

## 18. Sonuç

F9 ile F8'de tanımlanan rezervasyon domain'inin davranışsal mimarisi ve önerilen API sözleşmeleri belirlenmiştir.

Temel ilkeler:

- Hesapsız müşteri deneyimi
- Tenant tarafından manuel rezervasyon yönetimi
- Güvenli ve sınırlı public takip erişimi
- Tenant izolasyonu
- Backend merkezli fiyat hesaplaması
- Eşzamanlılığa dayanıklı müsaitlik kontrolü
- Transactional outbox ile güvenilir bildirim işleme
- Tarihsel snapshot ve veri bütünlüğü
- İlk sürümde e-posta bildirimi; SMS ve online ödeme olmaması

**Bu doküman tasarım çıktısıdır. Gerçek backend veya frontend implementasyonu değildir.**

F8 ve F9 birlikte, sonraki geliştirme görevlerinin teknik temelini oluşturur.
