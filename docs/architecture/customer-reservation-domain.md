# F8 — Customer & Reservation Domain Architecture

**Issue:** #61
**Status:** Architecture Design
**Scope:** Documentation only

## 1. Amaç ve Kapsam

Bu doküman, RentACar multi-tenant SaaS platformunun hesapsız müşteri rezervasyon sistemi için veri modelini ve temel domain kurallarını tanımlar.

Her tenant bağımsız bir araç kiralama işletmesidir. Tenant; araçlarını, müşterilerini, teslim/iade lokasyonlarını, ek hizmetlerini ve rezervasyonlarını kendi yönetim panelinden yönetir.

Müşterilerin rezervasyon oluşturmak veya rezervasyon durumlarını sorgulamak için hesap açması gerekmez.

Bu görevde yalnızca mimari tasarlanır. Prisma şeması, migration, backend endpoint'leri ve frontend sayfaları değiştirilmez.

### MVP kapsamı

- Hesapsız rezervasyon oluşturma
- Tenant'a ait müşteri kayıtları
- Araç, teslim/iade lokasyonu ve tarih-saat seçimi
- Ek hizmet seçimi
- Rezervasyon fiyatlandırması
- Güvenli rezervasyon takip kodu
- Tenant tarafından manuel onay veya ret
- Müşteri ve tenant için e-posta bildirimleri
- Tarihsel rezervasyon verilerinin korunması
- Tenant izolasyonu
- Tenant'ın kayıtları yönetebilmesi ve silebilmesi

### MVP dışında

- Müşteri hesabı ve giriş sistemi
- SMS doğrulama veya bildirimi
- Online ödeme
- Otomatik rezervasyon onayı
- Promosyon kodları ve dinamik fiyatlandırma
- Gelişmiş fiziksel ek hizmet stok yönetimi

Rezervasyon yaşam döngüsü, takip API'leri, e-posta teslim mekanizması ve eşzamanlı müsaitlik kontrolünün ayrıntıları F9 kapsamında ele alınır.

---

## 2. Mevcut Sistemle Entegrasyon

Mevcut Prisma şemasında `Tenant` ve `Vehicle` modelleri bulunmaktadır.

`Vehicle` modeli, `tenantId` ile bir tenant'a bağlıdır. Günlük kiralama ücreti `dailyPrice`, para birimi `currency` ve isteğe bağlı depozito `depositAmount` alanları zaten mevcuttur.

Mevcut `FleetStatus`, aracın filo durumunu ifade eder. Rezervasyon tarihleri arasındaki müsaitliğin yerine geçmez.

Bu tasarım mevcut `Tenant` ve `Vehicle` modellerini koruyarak yeni domain modelleri eklenmesini öngörür.

### Domain modelleri

| Model            | Sorumluluğu                                         |
| ---------------- | --------------------------------------------------- |
| Tenant           | Araç kiralama şirketi                               |
| Vehicle          | Şirkete ait araç                                    |
| Customer         | Hesapsız müşteri iletişim kaydı                     |
| Reservation      | Araç kiralama talebi                                |
| Location         | Teslim alma ve iade noktası                         |
| ExtraService     | Tenant'ın ek hizmet kataloğu                        |
| ReservationExtra | Rezervasyonda seçilen ek hizmet ve fiyat snapshot'ı |

---

## 3. Customer Domain

### 3.1. Temel kararlar

Müşteriler hesap oluşturmaz ve sisteme giriş yapmaz.

İlk sürümde her rezervasyon oluşturulduğunda yeni bir `Customer` kaydı oluşturulur.

Aynı telefon veya e-posta adresine sahip kayıtlar otomatik birleştirilmez.

Bunun nedeni, doğrulanmamış iletişim bilgilerine dayanarak farklı kişilerin rezervasyon geçmişlerini yanlışlıkla ilişkilendirmemektir.

Her `Customer` kaydı belirli bir tenant'a aittir.

### 3.2. Alanlar

| Alan        | Tip      | Zorunlu | Açıklama                     |
| ----------- | -------- | ------- | ---------------------------- |
| id          | String   | Evet    | Benzersiz müşteri ID'si      |
| tenantId    | String   | Evet    | Müşterinin ait olduğu tenant |
| firstName   | String   | Evet    | Ad                           |
| lastName    | String   | Evet    | Soyad                        |
| phone       | String   | Evet    | Telefon                      |
| email       | String   | Evet    | E-posta                      |
| dateOfBirth | Date     | Evet    | Doğum tarihi                 |
| createdAt   | DateTime | Evet    | Oluşturulma zamanı           |
| updatedAt   | DateTime | Evet    | Güncellenme zamanı           |

Telefon ve e-posta adresi benzersiz olmak zorunda değildir.

Telefon numaraları normalize edilmiş biçimde saklanmalıdır. E-posta için de uygun doğrulama ve normalizasyon uygulanmalıdır.

### 3.3. Prisma taslağı

```prisma
model Customer {
  id        String @id @default(cuid())
  tenantId  String

  firstName   String
  lastName    String
  phone       String
  email       String
  dateOfBirth DateTime @db.Date

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([id, tenantId])
  @@index([tenantId, createdAt])
}
```

Bu, ilişkileri henüz tamamlanmamış kavramsal taslaktır.

### 3.4. Yaş kontrolü

Müşterinin teslim alma tarihinde en az 18 yaşını tamamlamış olması gerekir.

Yaş, doğum tarihi ile teslim alma tarihinin takvimsel karşılaştırılmasıyla hesaplanır.

Kontrol backend tarafından yapılmalıdır.

18 yaş, ilk sürümdeki asgari yaş kuralıdır. Yerel mevzuat, ehliyet süresi, sigorta şartları ve tenant'ın ek kiralama koşulları ayrıca değerlendirilmelidir.

Doğum tarihi public rezervasyon takip ekranında gösterilmez.

---

## 4. Location Domain

Tenant, kendi yönetim panelinden teslim alma ve iade noktalarını oluşturabilir, listeleyebilir, düzenleyebilir, pasife alabilir veya silebilir.

### 4.1. Lokasyon türleri

```prisma
enum LocationType {
  BRANCH
  AIRPORT
  HOTEL
  OTHER
}
```

### 4.2. Alanlar

| Alan         | Tip          | Açıklama                   |
| ------------ | ------------ | -------------------------- |
| id           | String       | Lokasyon ID'si             |
| tenantId     | String       | Sahip tenant               |
| name         | String       | Lokasyon adı               |
| type         | LocationType | Lokasyon türü              |
| address      | String?      | Adres                      |
| isActive     | Boolean      | Kullanıma açık mı?         |
| allowsPickup | Boolean      | Araç teslim alınabilir mi? |
| allowsReturn | Boolean      | Araç iade edilebilir mi?   |
| createdAt    | DateTime     | Oluşturulma zamanı         |
| updatedAt    | DateTime     | Güncellenme zamanı         |

### 4.3. Prisma taslağı

```prisma
model Location {
  id       String @id @default(cuid())
  tenantId String

  name         String
  type         LocationType
  address      String?

  isActive     Boolean @default(true)
  allowsPickup Boolean @default(true)
  allowsReturn Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([id, tenantId])
  @@index([tenantId, isActive])
}
```

### 4.4. İş kuralları

- Müşteri yalnızca ilgili tenant'ın lokasyonlarını kullanabilir.
- Teslim alma seçenekleri için `isActive = true` ve `allowsPickup = true` gerekir.
- İade seçenekleri için `isActive = true` ve `allowsReturn = true` gerekir.
- Alış ve iade lokasyonları farklı olabilir.
- Tenant iki yeteneği de kapatabilir; böyle bir lokasyon public seçimlerde gösterilmez.
- Rezervasyon sırasında lokasyonun adı ve adresi snapshot olarak korunur.

Mevcut `Vehicle.currentLocationLabel`, aracın güncel konumunu açıklayan ayrı bir alandır. `Location` domain'inin yerini almaz.

---

## 5. ExtraService Domain

Tenant, kendi ek hizmet kataloğunu oluşturur ve yönetir.

Örnekler:

- Bebek koltuğu
- Ek sürücü
- Navigasyon
- Diğer kiralama hizmetleri

### 5.1. Fiyatlandırma türleri

```prisma
enum ExtraServicePricingType {
  PER_DAY
  FIXED
}
```

`PER_DAY`: Kiralamanın ücretlendirilen gün sayısına göre hesaplanır.

`FIXED`: Rezervasyon başına, seçilen adet üzerinden sabit tutar uygulanır.

### 5.2. ExtraService alanları

| Alan        | Tip             | Açıklama                               |
| ----------- | --------------- | -------------------------------------- |
| id          | String          | Hizmet ID'si                           |
| tenantId    | String          | Sahip tenant                           |
| name        | String          | Hizmet adı                             |
| description | String?         | Açıklama                               |
| pricingType | Enum            | Günlük veya sabit                      |
| price       | Decimal(12,2)   | Birim fiyat                            |
| currency    | VehicleCurrency | Para birimi                            |
| maxQuantity | Int             | Rezervasyonda seçilebilecek azami adet |
| isActive    | Boolean         | Kullanım durumu                        |
| createdAt   | DateTime        | Oluşturulma zamanı                     |
| updatedAt   | DateTime        | Güncellenme zamanı                     |

### 5.3. Prisma taslağı

```prisma
model ExtraService {
  id       String @id @default(cuid())
  tenantId String

  name        String
  description String?

  pricingType ExtraServicePricingType
  price       Decimal @db.Decimal(12, 2)
  currency    VehicleCurrency

  maxQuantity Int     @default(1)
  isActive    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([id, tenantId])
  @@index([tenantId, isActive])
}
```

`maxQuantity` pozitif olmalıdır.

Bu alan gerçek fiziksel stok miktarını ifade etmez.

### 5.4. ReservationExtra

Rezervasyonda seçilen hizmetler ayrı bir modelde tutulur.

Amaç, tenant'ın hizmet adını veya fiyatını değiştirmesinin geçmiş rezervasyonları etkilemesini önlemektir.

Önerilen alanlar:

```prisma
model ReservationExtra {
  id             String @id @default(cuid())
  tenantId       String
  reservationId  String
  extraServiceId String?

  nameSnapshot        String
  pricingTypeSnapshot ExtraServicePricingType
  unitPriceSnapshot   Decimal @db.Decimal(12, 2)
  currencySnapshot    VehicleCurrency

  quantity   Int
  totalPrice Decimal @db.Decimal(12, 2)

  createdAt DateTime @default(now())

  @@index([tenantId, reservationId])
}
```

`extraServiceId` alanının opsiyonel olması, ileride hizmet kataloğu kaydı fiziksel olarak kaldırıldığında geçmiş rezervasyon bilgisinin snapshot üzerinden korunabilmesi için değerlendirilmiştir.

Gerçek uygulamada foreign key silme davranışı buna uygun tanımlanmalıdır.

Aynı hizmetin aynı rezervasyonda birden fazla satıra bölünmesine gerek yoksa birleşik benzersizlik kısıtı kullanılabilir.

---

## 6. Reservation Domain

### 6.1. Temel kararlar

Her rezervasyonun iki ayrı kimliği olacaktır:

- `id`: Sistem içi benzersiz rezervasyon kimliği.
- `trackingCode`: Müşteriye verilen, tahmin edilmesi zor rezervasyon takip kodu.

Takip kodu müşteri hesabı gerektirmeden rezervasyonun sınırlı durum bilgisini sorgulamak için kullanılır.

Veritabanında düz metin takip kodu yerine `trackingCodeHash` saklanması hedeflenir.

Kodun üretimi, normalizasyonu, arama yöntemi ve güvenliği F9 kapsamında netleştirilecektir.

### 6.2. Rezervasyon durumları

```prisma
enum ReservationStatus {
  PENDING
  CONFIRMED
  REJECTED
  CANCELLED
}
```

- `PENDING`: Tenant'ın kararını bekleyen rezervasyon talebi.
- `CONFIRMED`: Tenant tarafından onaylanan rezervasyon.
- `REJECTED`: Tenant tarafından reddedilen rezervasyon.
- `CANCELLED`: İptal edilen rezervasyon.

İptal ile kayıt silme farklı işlemlerdir.

Durum geçişlerinin ayrıntılı kuralları F9'da belirlenecektir.

### 6.3. Temel alanlar

| Alan             | Tip               | Açıklama                      |
| ---------------- | ----------------- | ----------------------------- |
| id               | String            | Rezervasyon ID'si             |
| tenantId         | String            | Sahip tenant                  |
| customerId       | String            | Müşteri kaydı                 |
| vehicleId        | String            | Seçilen araç                  |
| trackingCodeHash | String            | Takip kodunun doğrulama özeti |
| pickupLocationId | String            | Teslim alma noktası           |
| returnLocationId | String            | İade noktası                  |
| pickupAt         | DateTime          | Alış tarihi ve saati          |
| returnAt         | DateTime          | İade tarihi ve saati          |
| flightNumber     | String?           | Opsiyonel uçuş kodu           |
| status           | ReservationStatus | Rezervasyon durumu            |
| createdAt        | DateTime          | Oluşturulma zamanı            |
| updatedAt        | DateTime          | Güncellenme zamanı            |
| confirmedAt      | DateTime?         | Onay zamanı                   |
| rejectedAt       | DateTime?         | Ret zamanı                    |
| cancelledAt      | DateTime?         | İptal zamanı                  |

Alış ve iade için tarih ile saat birlikte `DateTime` olarak saklanır.

Kullanıcı arayüzünde tarih ve saat ayrı ayrı seçilebilir.

İade zamanı alış zamanından sonra olmalıdır.

Geçmiş bir tarih için yeni rezervasyon oluşturulamaz.

### 6.4. Zaman dilimi

Rezervasyon anları veritabanında UTC temelli saklanmalıdır.

Müşterinin seçtiği yerel tarih ve saat, ilgili teslimat lokasyonunun veya tenant'ın tanımlanmış saat dilimine göre yorumlanmalıdır.

Yalnızca UTC ofseti değil, IANA zaman dilimi kimliği kullanılmalıdır; örneğin `Europe/Istanbul`.

Yaz saati geçişlerindeki geçersiz veya tekrarlanan yerel saatler için açık doğrulama kuralları gerekir.

Bu ayrıntılar ve gün hesabının kesin zaman semantiği F9'da belirlenir.

---

## 7. Rezervasyon Snapshot Verileri

Rezervasyon oluşturulduktan sonra geçmiş bilgiler güncel katalog değişikliklerinden bağımsız kalmalıdır.

### 7.1. Müşteri snapshot'ı

- `customerFirstNameSnapshot`
- `customerLastNameSnapshot`
- `customerPhoneSnapshot`
- `customerEmailSnapshot`

Doğum tarihi `Customer` modelinde saklanır. Rezervasyonda ayrıca doğum tarihi snapshot'ı tutulması, veri minimizasyonu ve hukuki saklama gereksinimleri değerlendirilmeden zorunlu kabul edilmez.

### 7.2. Araç snapshot'ı

- `vehicleMakeSnapshot`
- `vehicleModelSnapshot`
- `vehiclePlateSnapshot`
- `vehicleCategorySnapshot`

### 7.3. Lokasyon snapshot'ı

- `pickupLocationNameSnapshot`
- `pickupLocationAddressSnapshot`
- `returnLocationNameSnapshot`
- `returnLocationAddressSnapshot`

### 7.4. Fiyat snapshot'ı

- `rentalDays`
- `dailyPriceSnapshot`
- `vehicleTotal`
- `extrasTotal`
- `rentalTotal`
- `depositAmountSnapshot`
- `currency`

Gerekli durumlarda fiyatın oluşturulma anındaki koşullarını açıklayan ek alanlar tasarlanabilir.

Snapshot verileri, ilgili kayıtlar güncellendiğinde kendiliğinden değiştirilmez.

Kişisel veri silme veya anonimleştirme işlemleri bu kuralın istisnasıdır.

---

## 8. Pricing Domain

### 8.1. Temel fiyatlandırma

İlk sürüm için başlayan her 24 saatlik kiralama süresi bir gün olarak ücretlendirilir.

```text
rentalDays = ceil(durationHours / 24)
vehicleTotal = rentalDays * dailyPrice
```

Pozitif kiralama süresi zorunludur.

### 8.2. Ek hizmet hesaplamaları

Günlük hizmet:

```text
extraTotal = quantity * unitPrice * rentalDays
```

Sabit hizmet:

```text
extraTotal = quantity * unitPrice
```

Tüm seçili hizmetlerin toplamı `extrasTotal` değerini oluşturur.

### 8.3. Toplam kiralama bedeli

```text
rentalTotal = vehicleTotal + extrasTotal
```

Depozito, kiralama toplamından ayrı tutulur.

Depozito talep edilmesi, tahsil edildiği anlamına gelmez.

İlk sürümde online ödeme bulunmaz.

### 8.4. Güvenlik kuralları

- Fiyat hesaplaması backend tarafından yapılır.
- Client tarafından gönderilen toplam fiyatlara güvenilmez.
- Güncel fiyatlar yetkili tenant kayıtlarından okunur.
- Parasal hesaplamalarda `Decimal` kullanılır.
- Negatif fiyatlara izin verilmez.
- Ek hizmet para birimi ile rezervasyon para birimi uyumlu olmalıdır.
- Rezervasyon oluşturulurken hesaplanan değerler snapshot olarak korunur.

Vergi, ek teslimat ücreti, indirim, kampanya ve dinamik fiyatlandırma kuralları bu ilk tasarımın dışında tutulmuştur; canlı satış öncesinde tenant'ın gerçek fiyat sunumuna göre ayrıca kararlaştırılmalıdır.

---

## 9. Tenant İzolasyonu ve Veri Bütünlüğü

Her `Customer`, `Reservation`, `Location`, `ExtraService` ve `ReservationExtra` belirli bir tenant'a aittir.

Bir tenant'ın rezervasyonu başka tenant'a ait araç, müşteri, lokasyon veya ek hizmetle ilişkilendirilemez.

### 9.1. Birleşik foreign key yaklaşımı

Önerilen yaklaşım, tenant kapsamındaki ilişkilerde hem kayıt kimliğini hem tenant kimliğini doğrulamaktır.

Örneğin `Vehicle` tarafında:

```prisma
@@unique([id, tenantId])
```

Reservation tarafında:

```prisma
vehicle Vehicle @relation(
  fields: [vehicleId, tenantId],
  references: [id, tenantId],
  onDelete: Restrict
)
```

Aynı strateji Customer, Location ve ExtraService ilişkilerine uygulanmalıdır.

Reservation'ın alış ve iade lokasyonları aynı `Location` modeline iki farklı isimli ilişkiyle bağlanmalıdır.

Bunlar tasarım örnekleridir; nihai Prisma modellerindeki tüm karşılıklı relation alanları ve ilişki isimleri implementasyon sırasında tamamlanacaktır.

### 9.2. Yetkilendirme

Veritabanı ilişkileri tenant izolasyonunun tek güvenlik katmanı değildir.

Backend, her tenant admin işleminde kimliği doğrulanmış yöneticinin tenant kapsamını uygulamalıdır.

Public rezervasyon isteklerinde tenant, doğrulanmış site/uygulama bağlamından belirlenmelidir.

Client'ın rastgele gönderdiği `tenantId` değeri tek başına güvenilir değildir.

### 9.3. İndeks ve kısıtlar

Önerilen indeks alanları:

- `Reservation(tenantId, status)`
- `Reservation(tenantId, pickupAt)`
- `Reservation(tenantId, customerId)`
- `Reservation(tenantId, vehicleId, pickupAt)`
- `Customer(tenantId, createdAt)`
- `Location(tenantId, isActive)`
- `ExtraService(tenantId, isActive)`

Takip kodu doğrulama özeti benzersiz olmalıdır.

İade zamanının alış zamanından büyük olması, pozitif miktar ve negatif olmayan ücretler uygun backend doğrulaması ve veritabanı kısıtlarıyla korunmalıdır.

Prisma'nın doğrudan ifade edemediği PostgreSQL kısıtları için SQL migration gerekebilir.

---

## 10. Rezervasyon Müsaitliği

`Vehicle.fleetStatus`, rezervasyon müsaitliğinden farklıdır.

Bir aracın aktif olması, seçilen tarih aralığında kesin müsait olduğu anlamına gelmez.

MVP kararları:

- `PENDING` rezervasyonlar aracı kesin olarak bloke etmez.
- Bir araca aynı tarih aralığında birden fazla talep gelebilir.
- `CONFIRMED` rezervasyonların zaman aralıkları çakışamaz.
- Tenant onay verirken müsaitlik yeniden doğrulanmalıdır.

Çakışma kontrolü yalnızca uygulama seviyesindeki basit sorguya dayanmamalıdır.

Eşzamanlı onaylar için transaction ve PostgreSQL seviyesinde güvenli koruma stratejisi F9'da tasarlanacaktır.

Zaman aralıkları için başlangıç dahil, bitiş hariç `[pickupAt, returnAt)` yaklaşımı değerlendirilecektir.

---

## 11. Veri Yaşam Döngüsü ve Silme

Tenant Admin, yönettiği araç, lokasyon, ek hizmet ve müşteri kayıtlarını silebilmelidir.

Ancak silme işlemi geçmiş rezervasyonların bütünlüğünü bozmamalıdır.

### 11.1. Pasife alma

Pasife alma, kaydın yeni rezervasyonlarda kullanılmasını engeller.

Kayıt tenant yönetiminde tutulabilir ve gerektiğinde yeniden aktifleştirilebilir.

### 11.2. Fiziksel silme

Geçmiş rezervasyonlarla ilişkili olmayan ve başka saklama zorunluluğu bulunmayan kayıtlar fiziksel olarak silinebilir.

### 11.3. Mantıksal silme

Geçmiş veya devam eden rezervasyonlarda referans verilen kayıtlar için `deletedAt` benzeri bir alanla mantıksal silme uygulanabilir.

Mantıksal olarak silinen kayıt normal yönetim listelerinde gösterilmez.

Gerekli tarihsel ilişkiler korunur.

### 11.4. Rezervasyon iptali ile silme

Aktif bir rezervasyonu iptal etmek, kaydı silmekle aynı işlem değildir.

Rezervasyon iptal edildiğinde uygun durum değişikliği yapılır ve takip ekranının bu durumu yansıtması sağlanır.

Rezervasyon geçmişinin silinmesi veya anonimleştirilmesi farklı bir süreç olarak tasarlanır.

### 11.5. Kişisel veri koruması

Ad, soyad, telefon, e-posta ve doğum tarihi kişisel veridir.

Veri minimizasyonu, erişim yetkileri, saklama süreleri ve silme/anonimleştirme talepleri dikkate alınmalıdır.

Türkiye'deki KVKK gereksinimleri ve uygulanabilir diğer yükümlülükler ayrıca değerlendirilmelidir.

Snapshot tutulması kişisel verinin süresiz saklanması için gerekçe oluşturmaz.

Silme sürecinde müşteri kaydı ile rezervasyon snapshot'larındaki kişisel veriler birlikte ele alınmalıdır.

---

## 12. Müşteri Rezervasyon Deneyimi

MVP rezervasyon akışı:

1. Müşteri tenant'ın web sitesi veya mobil uygulamasını açar.
2. Teslim alma ve iade lokasyonlarını seçer.
3. Teslim alma ve iade tarih/saatlerini belirler.
4. Uygun aracı seçer.
5. İstediği ek hizmetleri ekler.
6. Ad, soyad, telefon, e-posta ve doğum tarihini girer.
7. Gerekiyorsa uçuş kodunu ekler.
8. Sistem bilgileri ve fiyatı backend'de doğrular.
9. Rezervasyon `PENDING` durumunda oluşturulur.
10. Müşteriye takip kodu ve rezervasyon özeti gösterilir.
11. Takip kodu ve rezervasyon özeti müşterinin e-posta adresine gönderilmek üzere işleme alınır.
12. Tenant Admin yeni rezervasyon talebi hakkında bilgilendirilir.
13. Tenant Admin rezervasyonu inceler, onaylar veya reddeder.
14. Müşteri takip koduyla güncel rezervasyon durumunu görüntüler.

Müşteri hesabı, şifre, JWT veya OTP gerektirilmez.

İlk sürümde SMS bildirimi bulunmaz.

E-posta adresinin zorunlu olması, adresin doğrulandığı anlamına gelmez.

Müşterinin takip koduyla erişebileceği public bilgiler sınırlandırılmalı; doğum tarihi, açık iletişim bilgileri ve diğer hassas alanlar ifşa edilmemelidir.

---

## 13. Bildirim Mimarisine İlişkin Gereksinimler

Rezervasyon oluşturulduğunda:

**Müşteriye gönderilecek e-posta:**

- Rezervasyon takip kodu
- Seçilen araç özeti
- Alış ve iade lokasyonları
- Alış ve iade tarih/saatleri
- Seçilen ek hizmetler
- Rezervasyon tutarı
- Rezervasyon durumu
- Takip sayfasına erişim bilgileri

**Tenant'a gönderilecek e-posta:**

- Yeni rezervasyon talebi bilgisi
- Araç ve kiralama tarihleri
- Müşteri iletişim bilgileri
- Yönetim panelinde ilgili rezervasyona erişim bağlantısı

Rezervasyonun veritabanına kaydedilmesi ile e-posta teslimi birbirinden bağımsız ele alınmalıdır.

E-posta gönderilemese bile oluşturulmuş rezervasyon kaybolmamalıdır.

Sistemdeki transactional outbox yaklaşımından yararlanılması planlanır.

Ancak mevcut davet teslim modelinin rezervasyon bildirimleri için doğrudan yeniden kullanılması varsayılmaz.

Bildirim event'leri, gönderim, tekrar deneme ve teslim hata yönetimi F9 kapsamında tanımlanacaktır.

---

## 14. F9'a Devredilen Konular

F9 — Reservation Lifecycle, Secure Tracking & API Contracts kapsamında aşağıdaki konular tasarlanacaktır:

1. Rezervasyon durum makinesi ve izin verilen geçişler
2. Tenant Admin onay, ret ve iptal işlemleri
3. Güvenli, yüksek entropili takip kodu üretimi
4. Takip kodu hash doğrulaması ve public sorgulama
5. Public endpoint'lerde rate limiting ve veri minimizasyonu
6. Public rezervasyon oluşturma API sözleşmesi
7. Tenant Admin rezervasyon yönetimi API sözleşmeleri
8. Location ve ExtraService yönetim API sözleşmeleri
9. Rezervasyon fiyat teklifi ve doğrulama akışı
10. Kesinleşen rezervasyonlarda tarih çakışması kontrolü
11. Eşzamanlı onaylara karşı transaction/veritabanı koruması
12. E-posta bildirim event'leri ve transactional outbox akışı
13. UTC, saat dilimi ve rezervasyon süre hesaplama ayrıntıları
14. Başarı ekranı ve public takip ekranı response sözleşmeleri
15. Hata kodları, yetkilendirme ve test senaryoları

---

## 15. Mimari Test Gereksinimleri

İleride uygulanacak backend için en az aşağıdaki senaryolar test edilmelidir:

- Müşteri hesabı olmadan rezervasyon oluşturulabilmesi
- Zorunlu müşteri alanlarının doğrulanması
- Teslim tarihinde 18 yaşından küçük müşterinin reddedilmesi
- Yanlış tenant'a ait aracın kullanılamaması
- Yanlış tenant'a ait teslim/iade lokasyonlarının kullanılamaması
- Pasif lokasyonların public seçimlerde görünmemesi
- İade zamanının alış zamanından önce olamaması
- Ek hizmet fiyatının backend'de hesaplanması
- Fiyat değişikliğinin eski rezervasyonu etkilememesi
- Silinen katalog kayıtlarının geçmiş snapshot'ları bozmaması
- Birden fazla `PENDING` talebin aynı araca gelebilmesi
- Çakışan iki rezervasyonun aynı anda `CONFIRMED` olamaması
- Takip koduyla yalnızca izin verilen bilgilerin görüntülenmesi
- E-posta gönderim hatasının rezervasyonu kaybettirmemesi

Bu senaryolar F8 kapsamında yalnızca gereksinimdir; test kodu yazılmaz.

---

## 16. Sonuç

F8 ile hesapsız rezervasyon sisteminin veri modeli ve temel iş kuralları tanımlanmıştır.

Temel mimari ilkeler:

- Tenant izolasyonu
- Hesapsız müşteri deneyimi
- Güvenli rezervasyon takibi
- Esnek lokasyon ve ek hizmet yönetimi
- Geçmiş fiyat ve rezervasyon verilerinin korunması
- Kontrollü silme ve kişisel veri yönetimi
- Backend merkezli fiyatlandırma
- Rezervasyon onayında güvenilir müsaitlik kontrolü

Bu doküman bir mimari tasarımdır. Burada açıklanan yeni modeller ve işlemler henüz uygulanmış özellikler olarak değerlendirilmemelidir.

F9 tamamlandığında bu domain tasarımı, rezervasyon yaşam döngüsü ve API sözleşmeleriyle birlikte sonraki backend ve frontend geliştirme görevlerinin temelini oluşturacaktır.
