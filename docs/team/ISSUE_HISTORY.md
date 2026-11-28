# RentACar — Issue History

Gönderilen 44 issue, GitHub numarası sırasıyla arşivlenmiştir. Başlıkları açarak orijinal açıklamaları okuyabilirsiniz. İçerik tarihsel görev kapsamıdır; güncel durum için [PROJECT_STATUS](PROJECT_STATUS.md) dosyasına bakın. Yalnız yeni görev grubu planlandığında yeni issue metinlerini ekleyin.

<details>
<summary>#4 — security: audit npm dependencies and plan safe updates</summary>

```text
security: audit npm dependencies and plan safe updates #4
Amaç
RentACar projesindeki backend ve frontend npm bağımlılıklarını güvenlik açısından incelemek, mevcut uyarıların nedenlerini belirlemek ve güvenli güncelleme planı hazırlamak.

Mevcut durum
Eda'nın Windows geliştirme ortamında npm ci sonrasında:

Backend: 19 güvenlik uyarısı (9 yüksek)
Frontend: 9 güvenlik uyarısı (1 kritik)
Next.js sürümü: 16.4.0
Daha güncel bir güvenlik sürümü bulunduğu raporlandı.
Bu sonuçlar ilk kurulum sırasında elde edildi. Güncel durum yeniden doğrulanmalıdır.

Yapılacaklar

Backend için npm audit çıktısını incele.

Frontend için npm audit çıktısını incele.

Doğrudan ve dolaylı bağımlılıkları ayırt et.

Güvenlik açıklarının etkisini ve önem derecelerini değerlendir.

Güvenli sürüm güncellemelerini belirle.

Gerekli değişiklikleri ayrı feature branch üzerinde uygula.

TypeScript, lint, build ve ilgili testleri çalıştır.

Değişiklikleri Pull Request ile incelemeye gönder.
Kabul kriterleri
Güvenlik uyarıları ve etkileri belgelenmiş olmalı.
Kritik ve yüksek önem dereceli bulgular için çözüm veya gerekçeli takip kararı bulunmalı.
Uygulanan güncellemeler mevcut işlevleri bozmamalı.
package-lock.json değişiklikleri incelenmeli.
PR açıklamasında test sonuçları ve kalan riskler belirtilmeli.
Güvenlik notları
npm audit fix --force komutu değerlendirme yapılmadan kullanılmayacak.

Mevcut veritabanı verileri, .env dosyaları ve gizli anahtarlar korunacak.
```

</details>

<details>
<summary>#5 — docs: add team contribution guide and development setup</summary>

```text
docs: add team contribution guide and development setup #5
Amaç
RentACar projesinde Mustafa ve Eda'nın ortak geliştirme süreçlerini belgelemek.

Yapılacaklar

CONTRIBUTING.md oluştur.

SETUP.md oluştur.

.github/pull_request_template.md oluştur.

Branch isimlendirme kurallarını tanımla.

Commit mesajı kurallarını belirle.

Pull Request inceleme ve merge sürecini belgele.

macOS ve Windows geliştirme ortamı kurulum adımlarını yaz.

.env dosyalarının ve gizli bilgilerin GitHub'a gönderilmemesi gerektiğini açıkla.
Kabul kriterleri
Her iki geliştirici de belgeleri takip ederek geliştirme ortamını hazırlayabilmeli.
PR şablonu özet, testler, güvenlik ve API değişikliklerini içermeli.
Değişiklikler ayrı bir feature branch'ten PR ile birleştirilmeli.
```

</details>

<details>
<summary>#6 — docs(api): document and verify existing API contracts with OpenAPI</summary>

```text
docs(api): document and verify existing API contracts with OpenAPI #6
Amaç
Mevcut NestJS API endpoint'lerini incelemek, Swagger/OpenAPI altyapısının durumunu doğrulamak ve frontend geliştirme için güvenilir bir API sözleşmesi oluşturmak.

Mevcut durum
Super Admin authentication endpoint'leri hazır.
Tenant başvurusu oluşturma, listeleme, onaylama ve reddetme endpoint'leri hazır.
Bu endpoint'lerin yeniden geliştirilmesi gerekmiyor.
Swagger/OpenAPI'nin mevcut durumu kod üzerinden doğrulanacak.
Yapılacaklar

apps/api içindeki mevcut Swagger/OpenAPI kurulumunu kontrol et.

Eksikse uygun şekilde yapılandır.

Auth endpoint'lerini belgele.

Tenant başvuru endpoint'lerini belgele.

Request/response modellerini ve hata durumlarını açıkla.

JWT gerektiren endpoint'leri belirt.

Swagger dokümantasyonunun yerel geliştirme ortamında çalıştığını doğrula.

Gerekli test ve build kontrollerini yap.
Kabul kriterleri
Mevcut API'ler anlaşılır ve doğru şekilde belgelenmiş olmalı.
Frontend geliştiricisi endpoint'lerin giriş ve çıkışlarını inceleyebilmeli.
Mevcut API davranışları gereksiz yere değişmemeli.
PR açıklamasında yapılan değişiklikler ve doğrulama sonuçları bulunmalı.
İş bölümü
Ana sorumlu: Eda
Reviewer: Mustafa
Öncelik: Normal
Bağımlılık: Mevcut backend API altyapısı
```

</details>

<details>
<summary>#9 — security: review remaining development dependency vulnerabilities</summary>

```text
security: review remaining development dependency vulnerabilities #9
Amaç
Production bağımlılıklarındaki güvenlik güncellemeleri tamamlandıktan sonra geliştirme araçlarında kalan npm audit uyarılarını değerlendirmek ve güvenli çözüm planı hazırlamak.

Mevcut durum
İlgili çalışmalar:

Issue security: audit npm dependencies and plan safe updates #4
PR fix(deps): patch vulnerable backend and frontend dependencies #8
Son doğrulanan sonuçlar:

Backend production audit: 0 uyarı
Frontend production audit: 0 uyarı
Backend tüm bağımlılıklar: 10 uyarı (2 yüksek, 6 orta, 2 düşük)
Frontend tüm bağımlılıklar: 8 orta seviye uyarı
Backend 28 test başarılı
Backend ve frontend build başarılı
Admin login/logout manuel regresyon testleri başarılı
Bu sayılar güncel npm audit çıktılarıyla yeniden kontrol edilmelidir.

Yapılacaklar

@nestjs/mau ve ilişkili tmp, undici risklerini değerlendir.

@nestjs/cli üzerinden gelen minimatch uyarısını incele.

Vitest ve @vitest/mocker güncelleme seçeneklerini araştır.

Frontend ESLint bağımlılık zincirindeki minimatch sorununu değerlendir.

Kullanılmayan geliştirme bağımlılıklarını belirle.

npm install-script uyarılarını incele.

Güvenli güncelleme veya gerekçeli risk kabulü kararlarını belgele.

Gerekli değişiklikler için ayrı PR oluştur.
Kabul kriterleri
Kalan her bulgu için çözüm, geçici önlem veya belgelenmiş takip kararı bulunmalı.
Kırıcı sürüm düşürmeleri kontrolsüz uygulanmamalı.
İlgili güncellemelerde lint, build ve test kontrolleri başarılı olmalı.
Production bağımlılıklarına yeni kritik/yüksek risk eklenmemeli.
Not
npm audit fix --force değerlendirme yapılmadan kullanılmayacak.
```

</details>

<details>
<summary>#10 — feat(web): build Super Admin dashboard layout and shared UI components</summary>

```text
feat(web): build Super Admin dashboard layout and shared UI components #10
Amaç
RentACar Super Admin panelinin ortak arayüz altyapısını oluşturmak.

Mevcut authentication ve korumalı admin sayfası üzerine, sonraki başvuru yönetimi ekranlarında kullanılabilecek modern, responsive ve yeniden kullanılabilir bir dashboard yapısı geliştirilecek.

Mevcut durum
Aşağıdaki özellikler zaten geliştirilmiştir:

/admin/login giriş sayfası
/admin korumalı sayfası
/api/auth/login ve /api/auth/logout
HttpOnly cookie üzerinden admin oturum yönetimi
Backend POST /auth/login ve GET /auth/me
Login/logout manuel testleri
Bu özellikler sıfırdan yeniden yazılmayacak.

Yapılacaklar

Mevcut apps/web/app/admin yapısını incele.

Admin paneli için ortak layout oluştur.

Sidebar veya uygun navigasyon bileşeni ekle.

Üst başlık ve ana içerik alanını tasarla.

Mobil ve masaüstü ekranlara uyum sağla.

Mevcut logout işlevini dashboard arayüzüne entegre et.

Tekrar kullanılabilir loading bileşeni oluştur.

Tekrar kullanılabilir error-state bileşeni oluştur.

Tekrar kullanılabilir empty-state bileşeni oluştur.

Gerekli yerlerde erişilebilirlik kurallarını uygula.

Mevcut korumalı admin sayfasının oturum kontrolünü koru.
Kapsam dışı
Bu Issue kapsamında:

Tenant başvurularını listeleme
Başvuru onaylama/reddetme
Yeni backend endpoint'leri
Tenant Admin paneli
Authentication sisteminin yeniden yazılması
yapılmayacak.

Bu özellikler sonraki Issue'larda geliştirilecek.

Teknik kurallar
Next.js App Router ve React yapısı korunacak.
Mevcut server-side authentication kontrolü bozulmayacak.
Auth kontrolünü yalnızca istemci tarafında yapmaya geçilmeyecek.
Gerekmedikçe yeni UI kütüphaneleri eklenmeyecek.
Mevcut logout işlemi yeniden kullanılacak.
Next.js 16 Cache Components / Partial Prefetching davranışı dikkate alınacak.
Yerel Next.js dokümantasyonu ve mevcut proje kuralları takip edilecek.
Kabul kriterleri

/admin sayfası yeni dashboard arayüzünde çalışıyor.

Giriş yapmamış kullanıcı korunmuş içeriğe erişemiyor.

Logout işlemi çalışmaya devam ediyor.

Mobil ve masaüstü görünümleri kullanılabilir.

Ortak loading, error ve empty-state bileşenleri sonraki sayfalarda kullanılabilecek durumda.

TypeScript, lint ve production build kontrolleri başarılı.

Login/logout regresyon testi başarılı.

PR açılmış ve inceleme tamamlanmış.
İş bölümü
Ana sorumlu: Eda

Reviewer: Mustafa

Bağımlılık: Mevcut Super Admin authentication altyapısı

İlgili geliştirmeler: PR #1 ve güvenlik güncellemesi PR #8
```

</details>

<details>
<summary>#12 — feat(web): implement Super Admin tenant application listing</summary>

```text
feat(web): implement Super Admin tenant application listing #12
Amaç
Super Admin'in sisteme yapılan şirket başvurularını görüntüleyebileceği ve durumlarına göre filtreleyebileceği ekranı geliştirmek.

Mevcut altyapı
Super Admin login/logout ve korumalı /admin sayfası hazır.
Backend GET /admin/tenant-applications endpoint'i hazır.
Backend'de durum filtresi desteği bulunuyor.
Dashboard ortak UI altyapısı Issue feat(web): build Super Admin dashboard layout and shared UI components #10 kapsamında geliştiriliyor.
Bu özellikler yeniden yazılmayacak.

Kapsam
/admin/applications sayfasını oluştur.
Mevcut başvuru listeleme API'sine bağlan.
Başvuruların şirket adı, iletişim bilgileri ve durumunu uygun biçimde göster.
Pending, Approved ve Rejected durum filtrelerini ekle.
Loading, empty-state ve error-state durumlarını destekle.
Mobil ve masaüstü kullanımını düşün.
Başvuru detayına yönlendirme için uygun yapı hazırla.
Teknik sınırlar
Backend API davranışları değiştirilmemeli.
JWT token browser JavaScript'ine açılmamalı.
Mevcut güvenli Next.js oturum mimarisi korunmalı.
Gerekli server-side API erişimi Next.js Route Handler veya server-side katman üzerinden tasarlanmalı.
API response tipleri mevcut Swagger sözleşmesine göre tanımlanmalı.
Kabul kriterleri

Yetkili admin başvuruları görebiliyor.

Durum filtreleri doğru çalışıyor.

Oturumsuz kullanıcı başvuruları görüntüleyemiyor.

Loading, empty ve error durumları çalışıyor.

TypeScript, lint ve build başarılı.

PR açılıp incelenmiş.
İş bölümü
Owner: Eda
Reviewer: Mustafa
Depends on: Issue #10 ve mevcut listeleme API'si
Phase: B — Super Admin Applications
```

</details>

<details>
<summary>#13 — feat(admin): implement tenant application detail view</summary>

```text
feat(admin): implement tenant application detail view #13
Amaç
Super Admin'in tek bir tenant başvurusunu ayrıntılı inceleyebileceği ekranı geliştirmek.

Mevcut altyapı
TenantApplication Prisma modeli mevcut.
Başvuruları listeleme API'si mevcut.
Başvuru onaylama/reddetme API'leri mevcut.
Super Admin authentication sistemi tamamlandı.
Kapsam
/admin/applications/[id] detay sayfasını oluştur.
Başvurunun şirket adı, slug, iletişim bilgileri ve mevcut durumunu göster.
Var olan API'lerle tek başvuru verisine nasıl ulaşılacağını doğrula.
Tekil detay endpoint'i gerekli ise GET /admin/tenant-applications/:id endpoint'ini JWT korumasıyla ekle ve belgele.
Geçersiz veya bulunamayan ID için uygun hata davranışı oluştur.
Detay görünümünü mobil ve masaüstü için kullanılabilir yap.
Teknik sınırlar
Listeleme endpoint'inin mevcut davranışı bozulmamalı.
Onay/red işlemleri bu Issue'da uygulanmayacak.
Başvuru detayları yetkisiz kullanıcılara açılmamalı.
Yeni backend endpoint'i eklenirse Swagger/OpenAPI açıklaması da eklenmeli.
Mevcut layout ve paylaşılan UI bileşenleri kullanılmalı.
Kabul kriterleri

Var olan bir başvurunun detayları görüntüleniyor.

Bulunamayan başvuru doğru şekilde ele alınıyor.

Yetkisiz erişim engelleniyor.

Gerekli backend testleri geçiyor.

Frontend lint, TypeScript ve build geçiyor.

PR açılıp incelenmiş.
İş bölümü
Owner: Mustafa
Reviewer: Eda
Depends on: Issue #10, Issue #6
Phase: B — Super Admin Applications
```

</details>

<details>
<summary>#14 — feat(web): connect tenant application approval and rejection actions</summary>

```text
feat(web): connect tenant application approval and rejection actions #14

Amaç
Super Admin'in bir başvuruyu arayüz üzerinden onaylayabilmesini veya reddedebilmesini sağlamak.

Mevcut altyapı
Backend'de şu endpoint'ler zaten mevcut:

PATCH /admin/tenant-applications/:id/approve
PATCH /admin/tenant-applications/:id/reject
İlgili veritabanı işlemleri ve temel backend testleri önceden geliştirildi.

Kapsam
Başvuru detay ekranına Onayla ve Reddet aksiyonları ekle.
Mevcut backend endpoint'lerine güvenli şekilde bağlan.
İşlem öncesi kullanıcı onayı göster.
İstek sürerken butonları devre dışı bırak.
Tekrarlı tıklamalara karşı koruma sağla.
Başarılı işlem sonrası başvuru durumunu güncelle.
API hata mesajlarını kullanıcıya anlaşılır göster.
Pending dışındaki durumlarda uygun aksiyon davranışını uygula.
Teknik sınırlar
Yeni onay/red endpoint'leri yazılmayacak.
Başvuru durumlarının geçiş kuralları backend tarafından belirlenmeye devam edecek.
Kullanıcı arayüzü kontrolleri backend yetkilendirmesinin yerini almayacak.
Mevcut server-side auth ve HttpOnly cookie sistemi korunacak.
Kabul kriterleri

Onaylama işlemi çalışıyor.

Reddetme işlemi çalışıyor.

İşlem sonrası doğru durum gösteriliyor.

Çift tıklamayla tekrarlı işlem oluşmuyor.

Hatalı işlemler güvenli şekilde ele alınıyor.

TypeScript, lint ve build başarılı.

PR açılıp incelenmiş.
İş bölümü
Owner: Eda
Reviewer: Mustafa
Depends on: B2 — Application Detail
Phase: B — Super Admin Applications
```

</details>

<details>
<summary>#15 — fix(admin): harden session and application error handling</summary>

```text
fix(admin): harden session and application error handling #15
Amaç
Super Admin başvuru yönetiminde oturum ve hata senaryolarını güvenli, anlaşılır ve tutarlı hâle getirmek.

Mevcut altyapı
JWT authentication hazır.
HttpOnly cookie tabanlı Next.js oturumu hazır.
Login/logout işlemleri test edildi.
Backend authentication guard'ları mevcut.
Kapsam
Başvuru işlemlerinde 401 ve 403 durumlarını doğrula.
Süresi biten oturumda kullanıcıyı uygun şekilde giriş ekranına yönlendir.
Ağ hataları, sunucu hataları ve bulunamayan kayıt davranışlarını kontrol et.
Gereksiz hassas bilgilerin kullanıcıya gösterilmediğini doğrula.
Admin API isteklerinde güvenli origin/cookie kullanımını gözden geçir.
Var olan ekranlar arasında hata davranışlarını tutarlı hâle getir.
Gerçekten tespit edilen eksiklikleri küçük ve hedefli değişikliklerle düzelt.
Teknik sınırlar
Authentication sistemi sıfırdan yazılmayacak.
Yeni token saklama yöntemi getirilmeden önce güvenlik etkisi değerlendirilecek.
Production proxy ve cookie ayarları geliştirme ortamından ayrı değerlendirilecek.
Başvuru listeleme ve detay ekranlarının temel özellikleri yeniden uygulanmayacak.
Kabul kriterleri

Oturum süresi dolunca korumalı verilere erişim engelleniyor.

401/403 hataları doğru ele alınıyor.

Ağ ve sunucu hatalarında uygulama kullanılabilir kalıyor.

Gereksiz hassas veri sızıntısı yok.

Mevcut login/logout regresyon testleri başarılı.

Lint, TypeScript, build ve ilgili testler başarılı.

PR açılıp incelenmiş.
İş bölümü
Owner: Mustafa
Reviewer: Eda
Depends on: B1 ve B3
Phase: B — Super Admin Applications
```

</details>

<details>
<summary>#16 — test(admin): validate tenant application management workflows</summary>

```text
test(admin): validate tenant application management workflows #16
Amaç
Super Admin panelindeki başvuru yönetimi akışının doğru çalıştığını doğrulamak ve önemli regresyon senaryolarını testlerle güvence altına almak.

Test edilecek akışlar
Başvurunun API üzerinden oluşturulması.
Admin panelinde başvurunun listelenmesi.
Başvuru detayının görüntülenmesi.
Başvurunun onaylanması.
Başvurunun reddedilmesi.
Başvuru durumunun güncellenmesi.
Yetkisiz erişimlerin engellenmesi.
Hatalı ID ve hatalı işlem durumları.
Kapsam
Mevcut backend ve frontend test altyapısını incele.
En kritik entegrasyon senaryolarını otomatikleştir.
Gerekliyse manuel tarayıcı kontrol listesi hazırla.
Test verilerini gerçek geliştirme verilerinden ayır.
Testlerin nasıl çalıştırılacağını belgele.
Bulunan ürün hataları için ilgili küçük düzeltmeleri veya ayrı bug Issue'larını oluştur.
Kabul kriterleri

Kritik başvuru yönetimi akışları doğrulandı.

Yetkisiz erişim senaryoları kontrol edildi.

Başvuru onay/red işlemleri doğrulandı.

Test sonuçları PR'da açıkça belgelendi.

Mevcut backend testleri çalışmaya devam ediyor.

Yeni testler tekrar çalıştırılabilir durumda.

PR açılıp incelenmiş.
İş bölümü
Owner: Eda
Reviewer: Mustafa
Depends on: B1, B2, B3 ve B4
Phase: B — Super Admin Applications
```

</details>

<details>
<summary>#17 — C1 -architecture(api): design single-admin tenant authentication and isolation</summary>

```text
C1 -architecture(api): design single-admin tenant authentication and isolation
 #17
Amaç
Her araç kiralama şirketinin kendi kullanıcılarına, rollerine ve verilerine sahip olacağı güvenli multi-tenant mimariyi tasarlamak.

Karar verilmesi gereken konular
PlatformAdmin ve Tenant kullanıcılarının ayrımı.
Tenant kullanıcılarının Tenant ile ilişkisi.
Tenant Admin ve gelecekteki çalışan rolleri.
Kullanıcının hangi tenant'a erişebileceği.
JWT içerisinde hangi bilgilerin bulunacağı.
Sunucuda tenant bağlamının nasıl belirleneceği.
Tenantlar arasında veri erişiminin nasıl engelleneceği.
Şirket başvurusu onaylandıktan sonra ilk Tenant Admin hesabının nasıl açılacağı.
Yapılacaklar

Mevcut Prisma Tenant ve PlatformAdmin modellerini incele.

Tenant kullanıcıları için veri modeli önerisi hazırla.

Yetkilendirme ve tenant izolasyonu kurallarını belirle.

İlk Tenant Admin oluşturma akışını tasarla.

Temel güvenlik senaryolarını belgele.

Mimari kararı repository içinde dokümante et.

Eda ile tasarımı inceleyip karara bağla.
Kapsam dışı
Tenant Admin login endpoint'lerinin uygulanması.
Prisma migration oluşturulması.
Araç yönetimi veya rezervasyon geliştirilmesi.
Kabul kriterleri

Veri modeli ve ilişkiler tanımlandı.

Roller ve erişim sınırları açık.

Tenant izolasyon yaklaşımı belgelendi.

İlk yönetici hesabı oluşturma akışı belirli.

Eda teknik tasarımı incelemiş.

Karar PR ile repository'ye eklenmiş.
İş bölümü
Owner: Mustafa
Reviewer: Eda
Phase: C — Tenant Administration
```

</details>

<details>
<summary>#18 — C2- architecture(api): design single-admin tenant authentication and isolation</summary>

```text
C2- architecture(api): design single-admin tenant authentication and isolation
 #18
Objective
Design the authentication, authorization, account lifecycle, and tenant isolation architecture for RentACar.

RentACar is a multi-tenant, white-label car rental SaaS platform. Each approved car rental company (Tenant) will have exactly one Tenant Admin account responsible for managing its own business.

The initial version will not support employees, staff accounts, tenant memberships, multiple administrator accounts, or role hierarchies.

Scope
1. User and Tenant Architecture
Keep PlatformAdmin and TenantAdmin as separate account types.
Define the relationship between Tenant and TenantAdmin.
Enforce exactly one administrator account per approved and activated Tenant.
Define account states such as pending activation, active, and disabled.
Define appropriate email uniqueness and normalization rules.
Preserve the existing Platform Admin authentication system.
2. Tenant Onboarding
Define the lifecycle from approved tenant application to administrator account activation.
Specify when the TenantAdmin record is created.
Design a secure invitation and email verification mechanism.
Define activation token expiration, single-use behavior, and regeneration.
Define what happens if an invitation expires or email delivery fails.
Ensure failed onboarding steps do not corrupt approved Tenant records.
3. Authentication and JWT Design
Define separate authentication boundaries for Platform Admin and Tenant Admin.
Define JWT claims, token types, audience, expiration, and validation requirements.
Define login, logout, and session validation behavior.
Define how inactive or disabled Tenant Admin accounts are handled.
Define how suspended or rejected Tenants affect account access.
4. Tenant Isolation
Specify how the authenticated Tenant is resolved.
Require server-side authorization for all tenant-scoped operations.
Prevent one Tenant from accessing another Tenant's resources.
Define the authorization requirements for future vehicle, customer, and reservation endpoints.
Define handling for cross-tenant resource IDs and unauthorized access.
5. Architecture Documentation
Document Prisma model relationships.
Document authentication and activation workflows.
Document security constraints and important edge cases.
Define API contracts required by subsequent Phase C Issues.
Acceptance Criteria

A technical architecture document is added to the repository.

Tenant and TenantAdmin relationships are clearly documented.

The one-admin-per-tenant constraint is defined.

Account lifecycle and activation workflows are documented.

Platform Admin and Tenant Admin authentication boundaries are documented.

JWT design and token validation requirements are defined.

Tenant isolation rules are clearly specified.

Security, concurrency, and failure scenarios are addressed.

Dependencies for subsequent Phase C tasks are documented.

Architecture is reviewed and approved before C2 implementation.
Out of Scope
Employee and staff accounts
TenantMembership
OWNER / ADMIN / EMPLOYEE role hierarchy
Multiple administrator accounts per Tenant
Tenant switching
Prisma migrations
Frontend implementation
Vehicle and reservation management
Additional Scope — Transactional Invitation Outbox
Implement the InvitationDelivery persistence model defined in the approved C1 architecture.

Required Fields
id: Unique delivery identifier
tenantAdminId: Related TenantAdmin
activationTokenId: Related activation token
recipientEmail: Invitation recipient
encryptedToken: Encrypted token for delivery
status: PENDING, PROCESSING, SENT, FAILED
attempts: Number of delivery attempts
nextAttemptAt: Scheduled retry timestamp
lockedUntil: Processing lease expiration
sentAt: Email provider acceptance timestamp
lastErrorCode: Safe diagnostic error code
createdAt: Creation timestamp
updatedAt: Update timestamp
Acceptance Criteria

InvitationDelivery model is added to Prisma.

Required relations and indexes are implemented.

Delivery status is represented using an enum.

Sensitive encrypted token data is nullable after successful delivery.

Pending and retryable deliveries can be queried efficiently.

Concurrent delivery processing is supported through appropriate lease fields.

Database migration and Prisma client generation succeed.

Relevant database tests pass.
Architecture Reference
Follow docs/architecture/tenant-authentication.md, especially the Invitation Delivery — Transactional Outbox section.

Dependencies
None.

This Issue must be completed before C2 begins.
```

</details>

<details>
<summary>#22 — C3- feat(api): implement secure tenant admin invitation lifecycle</summary>

```text
C3- feat(api): implement secure tenant admin invitation lifecycle
 #22

Objective
Implement the backend infrastructure required to provision a Tenant Admin account and initiate a secure activation invitation after a tenant application has been approved.

The invitation system must integrate with the existing tenant approval workflow without compromising database consistency.

Scope
1. Tenant Admin Provisioning
Integrate Tenant Admin provisioning with the approved tenant application lifecycle.
Create an inactive TenantAdmin account associated with the approved Tenant.
Use the application's contact email as the proposed administrator email.
Do not treat the contact email as verified until the activation process is completed.
Ensure only one TenantAdmin account can be associated with a Tenant.
2. Secure Invitation Tokens
Generate cryptographically secure activation tokens.
Store only token hashes in the database.
Associate invitations with the correct TenantAdmin.
Assign a configurable expiration period.
Ensure tokens are single use.
Ensure tokens cannot be used to activate unrelated accounts.
3. Idempotency and Concurrency
Prevent duplicate administrator accounts.
Handle concurrent provisioning requests safely.
Ensure repeated approval attempts cannot create duplicate tenant administrators.
Handle database uniqueness errors appropriately.
Preserve transaction consistency.
4. Invitation Lifecycle
Define how invitation issuance is triggered.
Support pending invitations.
Support safe regeneration of expired invitations according to C1.
Ensure only valid invitations can be delivered.
Avoid exposing raw activation tokens in API responses or logs.
5. Tests
Add tests for:

Successful administrator provisioning
Duplicate provisioning attempts
Invalid Tenant relationships
Token generation and hashing
Invitation expiration data
Concurrent provisioning behavior
Database failure handling
Acceptance Criteria

Approved Tenants can be provisioned with exactly one inactive TenantAdmin.

The existing approval workflow remains consistent.

Invitation tokens are cryptographically secure.

Only hashed tokens are persisted.

Invitation expiration is enforced by the lifecycle design.

Duplicate or concurrent requests do not create multiple administrators.

Raw tokens are not exposed through application APIs or logs.

Failure cases are handled predictably.

Relevant automated tests pass.

Existing approval tests continue passing.
Out of Scope
Sending activation emails
Activation form
Tenant Admin login
Employee or staff accounts
Dependencies
Requires C2.

Must follow the approved invitation lifecycle defined in C1.
```

</details>

<details>
<summary>#23 — C4- feat(api): implement tenant activation email delivery</summary>

```text
C4- feat(api): implement tenant activation email delivery
 #23

Objective
Implement reliable and secure email delivery for Tenant Admin activation invitations.

When a tenant administrator is provisioned, the system must be able to send an activation link to the registered administrator email address.

Scope
1. Email Provider Integration
Introduce a configurable email delivery adapter.
Store provider credentials and configuration in environment variables.
Support separate development and production configurations.
Avoid coupling business logic directly to a specific email provider.
2. Activation Email
Create a clear and professional activation email template.
Include the Tenant or company name.
Include a secure activation URL.
Explain that the invitation expires.
Avoid including passwords or sensitive account information.
3. Delivery Reliability
Integrate with the invitation lifecycle introduced in C3.
Implement the durable delivery strategy selected in C1.
Ensure email failures cannot silently invalidate or lose approved Tenant records.
Support safe retry of failed deliveries.
Prevent retry behavior from producing unintended duplicate activations.
4. Security
Never log raw activation tokens.
Never expose email provider credentials.
Ensure the activation URL points to the configured frontend origin.
Avoid sending invitation links to unauthorized recipients.
Document relevant environment variables without committing secrets.
5. Testing
Add automated tests covering:

Correct email recipient
Correct activation URL generation
Email provider success
Email provider failure
Retry behavior
Invalid configuration
Development-mode delivery behavior
Acceptance Criteria

Email adapter is implemented.

Activation email template is available.

Configuration is environment-based.

Activation links use the correct frontend origin.

Email failures are handled reliably.

Failed deliveries can be retried safely.

Secrets and raw activation tokens are not logged.

Automated email delivery tests pass.

Development testing does not require sending real emails.

Required setup instructions are documented.
Out of Scope
Tenant Admin login
Tenant dashboard
Employee invitation system
Marketing emails
Dependencies
Requires C3.

Implementation must follow the delivery and retry strategy approved in C1.
```

</details>

<details>
<summary>#24 — C5- feat(api): implement tenant admin account activation</summary>

```text
C5- feat(api): implement tenant admin account activation
 #24

Objective
Implement secure account activation for newly provisioned Tenant Admin accounts.

Tenant administrators must be able to use their activation invitation to verify email ownership, set a password, and activate their account.

Scope
1. Activation Endpoint
Define a dedicated Tenant Admin activation endpoint.
Accept a valid activation token and a new password.
Validate the request using NestJS DTOs.
Return predictable success and error responses.
2. Token Validation
Verify the supplied token against its stored hash.
Reject unknown or invalid tokens.
Reject expired tokens.
Reject previously consumed tokens.
Ensure a token can activate only its intended account.
3. Password Security
Validate password requirements.
Hash passwords using the project's approved password hashing approach.
Never store plaintext passwords.
Never return password hashes or raw activation tokens.
Ensure sensitive request data is not logged.
4. Account Activation
Mark the TenantAdmin account as active only after successful validation.
Record the activation completion according to C1.
Atomically consume the activation token.
Prevent concurrent activation attempts from succeeding more than once.
5. Swagger Documentation
Document the activation endpoint in English, including:

Request DTO
Successful response
Invalid input response
Expired or invalid token behavior
Relevant conflict and error responses
6. Tests
Cover:

Successful activation
Invalid token
Expired token
Previously consumed token
Weak or invalid password
Concurrent activation attempts
Database failure handling
Acceptance Criteria

Secure activation endpoint is implemented.

DTO input validation is enforced.

Tokens are validated against stored hashes.

Expired or consumed tokens are rejected.

Passwords are securely hashed.

Account activation and token consumption are atomic.

Concurrent requests cannot activate an account twice.

Sensitive values are excluded from API responses and logs.

Swagger documentation is written in English.

Unit and integration tests pass.
Out of Scope
Email delivery
Tenant Admin login
Frontend activation form
Employee accounts
Dependencies
Requires C2 and C3.

Uses the token lifecycle defined in C1.
```

</details>

<details>
<summary>#25 — C6 - feat(auth): implement Tenant Admin login and session validation</summary>

```text
C6 - feat(auth): implement Tenant Admin login and session validation
 #25

Objective
Implement a dedicated authentication system for Tenant Admin accounts without breaking the existing Platform Admin authentication flow.

Tenant administrators must authenticate independently and access only their own tenant context.

Scope
1. Login API
Implement a dedicated Tenant Admin login endpoint.
Accept administrator credentials using a validated DTO.
Look up accounts using normalized email addresses.
Verify passwords using the existing approved password hashing mechanism.
Reject inactive, disabled, or unactivated accounts.
Reject access when the associated Tenant is not permitted to operate.
2. JWT and Session Design
Generate JWTs with the claims approved in C1.
Include the authenticated administrator identity and tenant context.
Distinguish Tenant Admin JWTs from Platform Admin JWTs.
Define appropriate token expiration.
Ensure token validation does not trust client-supplied tenant IDs.
Define logout and session expiration behavior.
3. Session Validation
Implement a protected Tenant Admin profile/session endpoint.
Return only safe account and tenant information.
Validate the account and Tenant status.
Return appropriate unauthorized or forbidden responses.
4. Authentication Security
Do not expose password hashes.
Avoid user enumeration through detailed login errors.
Use appropriate credential verification error handling.
Preserve existing Platform Admin login and /auth/me behavior.
Follow security requirements defined in C1.
5. Swagger Documentation
Document the Tenant Admin endpoints in English:

Login request
Login response
Session/profile response
Unauthorized responses
Validation failures
6. Tests
Add tests covering:

Successful login
Incorrect password
Unknown email
Unactivated account
Disabled account
Suspended Tenant
Expired or invalid JWT
Platform Admin token rejection
Safe session response
Acceptance Criteria

Dedicated Tenant Admin login endpoint is implemented.

Password authentication works securely.

Only eligible active Tenant Admin accounts can log in.

JWT claims follow C1.

Tenant tokens are distinguishable from Platform Admin tokens.

Protected session validation endpoint works.

Unauthorized access is rejected.

Platform Admin authentication remains functional.

Swagger documentation is complete and in English.

Authentication tests pass.
Out of Scope
Tenant Admin dashboard UI
Employee login
Multiple Tenant switching
Vehicle management
Reservation management
Dependencies
Requires C5.

Must follow C1 authentication decisions.
```

</details>

<details>
<summary>#26 — C7 - security(api): enforce tenant authentication and data isolation</summary>

```text
C7 - security(api): enforce tenant authentication and data isolation
 #26

Objective
Establish secure tenant-scoped authentication and authorization boundaries for RentACar.

The system must guarantee that Tenant Admin accounts cannot access or modify resources belonging to other Tenants.

Scope
1. Tenant Authentication Guard
Implement a dedicated Tenant Admin JWT guard or equivalent authorization mechanism.
Validate token type, identity, and required claims.
Reject invalid, expired, or incorrectly scoped JWTs.
Ensure Platform Admin and Tenant Admin authentication remain separate.
2. Tenant Context Resolution
Resolve the current tenant from the authenticated administrator.
Verify the administrator is associated with the expected Tenant.
Validate account and Tenant status.
Provide trusted tenant context to protected services.
3. Data Isolation Rules
Require tenant-scoped queries for tenant-owned resources.
Never trust arbitrary tenant IDs from client requests.
Ensure resources are filtered by the authorized tenant context.
Reject attempts to access another Tenant's resources.
Prevent cross-tenant updates and deletions.
4. Authorization Boundaries
Reject Tenant Admin JWTs on Platform Admin-only endpoints.
Reject Platform Admin JWTs on Tenant Admin-only endpoints.
Avoid privilege escalation through token claim manipulation.
Ensure token scope is validated consistently.
5. Reusable Security Infrastructure
Provide reusable guards, decorators, or tenant context utilities.
Establish a consistent pattern for future vehicle, customer, and reservation modules.
Document how new tenant-scoped endpoints must use this infrastructure.
6. Security Tests
Add tests covering:

Valid Tenant Admin access
Missing JWT
Expired JWT
Incorrect token type
Cross-tenant resource access
Cross-tenant resource modification
Disabled Tenant Admin
Suspended Tenant
Manipulated tenant IDs
Platform Admin and Tenant Admin token separation
Acceptance Criteria

Tenant Admin authentication guard is implemented.

Tenant context is resolved from trusted server-side data.

Cross-tenant access is rejected.

Cross-tenant modifications are rejected.

Platform and Tenant Admin JWTs cannot be interchanged.

Disabled accounts and suspended Tenants are denied access.

Reusable authorization infrastructure is documented.

Security tests cover isolation and privilege boundaries.

Existing Platform Admin functionality remains unaffected.
Out of Scope
Vehicle CRUD
Reservation CRUD
Employee permissions
Advanced RBAC
Multi-tenant account switching
Dependencies
Requires C6.

Must follow tenant isolation decisions defined in C1.
```

</details>

<details>
<summary>#27 — C8 - feat(web): implement Tenant Admin activation and login pages</summary>

```text
C8 - feat(web): implement Tenant Admin activation and login pages
 #27

Objective
Implement the Tenant Admin account activation and login experience using Next.js.

The interface must integrate with the dedicated Tenant Admin authentication endpoints while preserving the existing Platform Admin login system.

Scope
1. Activation Page
Create an account activation page.
Read and handle the activation token securely.
Allow the administrator to create a password.
Validate required fields and password requirements.
Display clear success and error states.
Handle invalid, expired, or previously used activation links.
2. Tenant Admin Login Page
Create a dedicated Tenant Admin login form.
Accept email and password.
Display appropriate validation errors.
Handle invalid credentials and inactive accounts.
Provide loading and disabled states while submitting.
3. Secure Session Handling
Integrate with the dedicated Tenant Admin login API.
Store session credentials using secure HttpOnly cookies.
Avoid storing JWTs in localStorage or exposing them to client-side JavaScript.
Keep Tenant Admin and Platform Admin sessions separate.
Implement appropriate redirect behavior after successful login.
4. UI and UX
Use the existing shared loading, error, and form patterns where appropriate.
Maintain consistency with the RentACar design.
Support responsive layouts.
Provide accessible form labels and validation feedback.
Do not alter the existing Platform Admin login experience unnecessarily.
5. Tests
Add frontend tests or appropriate automated validation covering:

Activation form validation
Successful activation
Expired activation token
Invalid credentials
Successful login
Session handling
API failure states
Acceptance Criteria

Tenant Admin activation page is implemented.

Password setup is integrated with the activation API.

Invalid and expired links are handled.

Tenant Admin login page is implemented.

Dedicated tenant authentication API is integrated.

Session token is stored using an HttpOnly cookie.

Platform Admin login remains unaffected.

Loading, error, and success states are implemented.

Responsive and accessibility checks pass.

Frontend lint, TypeScript, and build checks pass.
Out of Scope
Employee login
Tenant dashboard features
Vehicle and reservation management
Advanced account settings
Dependencies
Requires C5 and C6 API contracts.

End-to-end integration requires the corresponding backend endpoints.
```

</details>

<details>
<summary>#28 — C9 - feat(web): implement protected Tenant Admin dashboard shell</summary>

```text
C9 - feat(web): implement protected Tenant Admin dashboard shell
 #28


Objective
Implement a dedicated, protected management dashboard for Tenant Admin accounts.

Each car rental company must access its own dashboard without exposing Platform Admin functionality or other tenants' information.

Scope
1. Dashboard Routing
Create a dedicated Tenant Admin dashboard route structure.
Keep Tenant Admin pages separate from Platform Admin pages.
Implement shared dashboard layout components.
Provide a reusable structure for future tenant management modules.
2. Authentication Protection
Validate the Tenant Admin session server-side.
Redirect unauthenticated users to the Tenant Admin login page.
Handle expired and invalid sessions.
Prevent unauthorized access to protected pages.
Integrate with the trusted tenant session endpoint.
3. Tenant Information
Display the authenticated Tenant's company name.
Display only trusted tenant information returned by the backend.
Avoid relying on client-supplied tenant IDs.
Handle missing or unavailable tenant information safely.
4. Navigation
Create a dashboard navigation structure prepared for future modules:

Overview
Vehicles
Reservations
Customers
Company settings
Do not implement unfinished features as functional navigation destinations.

5. Logout
Implement Tenant Admin logout.
Clear the correct Tenant Admin session cookie.
Redirect to the appropriate login page.
Preserve the Platform Admin session independently.
6. UI and Responsiveness
Provide responsive sidebar/header navigation.
Reuse appropriate shared UI components.
Implement loading, empty, and error states.
Maintain a consistent RentACar design.
7. Tests
Verify:

Valid authenticated access
Unauthenticated redirects
Expired session behavior
Correct Tenant information
Tenant logout
Separation from Platform Admin dashboard
Acceptance Criteria

Tenant Admin dashboard routing is implemented.

Protected layout and authentication checks are in place.

Authenticated Tenant information is displayed.

Platform Admin functionality is not exposed.

Tenant logout works correctly.

Invalid sessions are handled safely.

Responsive dashboard components are implemented.

Shared UI patterns are reused where suitable.

Frontend lint, TypeScript, and production build pass.

Existing Platform Admin dashboard remains functional.
Out of Scope
Vehicle CRUD
Reservation management
Customer management
Billing and payments
Staff and employee management
Dependencies
Requires C7 and C8.
```

</details>

<details>
<summary>#29 — C10 - test(tenant): validate tenant onboarding, authentication and isolation workflows</summary>

```text
C10 - test(tenant): validate tenant onboarding, authentication and isolation workflows
 #29



Objective
Validate the complete Tenant Admin onboarding, authentication, authorization, and dashboard workflows through automated and manual testing.

The tests must confirm that each tenant can securely manage its own account while remaining isolated from other tenants.

Scope
1. Onboarding Workflow
Validate the complete flow:

Submit a tenant application.
Approve the application as Platform Admin.
Create the Tenant and inactive TenantAdmin account.
Issue a secure activation invitation.
Deliver the activation email.
Open the activation link.
Set a password and activate the account.
Log in as Tenant Admin.
Access the protected Tenant Admin dashboard.
2. Activation Security
Test:

Valid invitation token
Expired token
Invalid token
Previously consumed token
Concurrent activation requests
Duplicate account provisioning
Invitation delivery failures and retries
3. Authentication
Test:

Successful login
Incorrect password
Unknown email
Inactive account
Disabled account
Suspended Tenant
Expired JWT
Invalid JWT
Logout
Session expiration
4. Authorization and Tenant Isolation
Create test fixtures for at least two Tenants.
Verify each Tenant Admin can access only its own tenant context.
Reject cross-tenant resource access.
Reject cross-tenant updates.
Reject Platform Admin JWTs on Tenant Admin-only endpoints.
Reject Tenant Admin JWTs on Platform Admin-only endpoints.
Validate that manipulating tenant IDs cannot bypass authorization.
5. Frontend Workflows
Validate the activation page.
Validate the login form.
Validate authenticated dashboard navigation.
Validate unauthorized redirects.
Validate logout and session expiration.
Verify error and loading states.
Check responsive layouts.
6. Regression Testing
Run the relevant backend and frontend checks:

Backend:

npm run lint
npm run build
npm test
Frontend:

npm run lint
npx tsc --noEmit
npm run build
Document results and remaining limitations.

Acceptance Criteria

Tenant onboarding flow is validated end to end.

Account activation succeeds only with valid invitations.

Expired or consumed tokens are rejected.

Authentication failures behave correctly.

Session expiration and logout work.

Tenant isolation is tested with multiple Tenants.

Cross-tenant access and modifications are rejected.

Platform Admin and Tenant Admin token boundaries are verified.

Email failure and retry cases are tested.

Frontend workflows and error states are validated.

Existing Platform Admin functionality passes regression tests.

Test results are documented in the PR.
Dependencies
Requires C3, C4, C5, C6, C7, C8, and C9 to be integrated.

C1 and C2 must already be completed.
```

</details>

<details>
<summary>#35 — D1 - docs(vehicle): research vehicle management requirements and architecture</summary>

```text
D1 - docs(vehicle): research vehicle management requirements and architecture
 #35

D1 — Vehicle Management Product Research & Architecture
Objective
Research and document the real operational requirements of car rental businesses before implementing the RentACar vehicle management module.

The goal is to design a practical, scalable, and user-friendly fleet management experience for car rental company owners.

This task must produce a comprehensive product and architecture document that will guide the implementation of Phase D and inform future reservation, customer, pricing, and maintenance modules.

Assigned to: Eda
Phase: D — Vehicle Management
Type: Documentation / Product Research / Architecture

1. Industry and Competitor Research
Research existing car rental management systems and relevant operational workflows.

Analyze at least three relevant products, platforms, or documented industry workflows.

Research the following capabilities:

Vehicle fleet management

Vehicle inventory and specifications

Rental pricing and deposits

Vehicle availability and scheduling

Reservation and rental tracking

Customer and driver information

Vehicle pickup and return operations

Maintenance and service tracking

Insurance and inspection management

Damage reporting

Vehicle photos and media management

Fleet utilization and business reporting

For every researched product or source, document:

Product or source name

Official website or source URL

Relevant capabilities

Strengths and limitations

Features suitable for RentACar

Features that should be simplified or postponed

Do not copy competitor interfaces or designs directly.

2. Business Owner Requirements
Analyze what car rental company owners need to manage their businesses efficiently.

Consider the following workflows:

Register a vehicle in the fleet.

Update vehicle information.

Add and organize vehicle photos.

Define rental pricing and security deposits.

View available and unavailable vehicles.

Track which vehicles are rented or reserved.

View relevant customer and driver information.

Manage pickup and return operations.

Track maintenance and insurance dates.

Temporarily disable vehicles.

Search and filter vehicle inventory.

Review rental history.

Monitor basic fleet performance.

For each workflow, explain:

Business purpose

Required information

Recommended screens

Important actions

Validation or business rules

Dependencies on future modules

Whether it belongs in the Phase D MVP

Do not assume every researched capability must be implemented immediately.

3. Vehicle Data Requirements
Analyze and categorize all relevant Vehicle fields.

A. Vehicle Identity
Consider:

Brand

Model

Model year

License plate

VIN / chassis number

Vehicle category

Color

B. Technical Specifications
Consider:

Transmission

Fuel type

Seating capacity

Door count

Mileage

Fuel or battery level

Air conditioning

Vehicle equipment and features

C. Rental and Commercial Details
Consider:

Daily rental price

Currency

Security deposit

Mileage limits

Extra mileage charges

Minimum rental duration

Rental availability

D. Operational Details
Consider:

Active/inactive fleet status

Maintenance state

Insurance expiration

Vehicle inspection expiration

Last service date

Current mileage

Internal notes

E. Media
Consider:

Cover image

Additional photos

Image ordering

File size and format restrictions

Image deletion and replacement

Image storage requirements

For every proposed field, include:

Property | Required Information -- | -- Field name | Proposed database/API name Data type | String, Integer, Decimal, Boolean, Enum, etc. Required | Yes / No Validation | Allowed values, limits, formatting Business purpose | Why the field is needed Priority | MVP Required / MVP Optional / Future UI location | List / Detail / Create / Edit
The final field matrix must be detailed enough to guide both Prisma schema development and frontend form implementation.

4. Vehicle Status and Availability
Analyze the difference between:

Active versus inactive fleet status

Available versus reserved vehicles

Currently rented vehicles

Vehicles undergoing maintenance

Temporarily unavailable vehicles

Determine which states should be persisted and which should later be calculated from reservations, rentals, or maintenance records.

Avoid using one status field for unrelated concepts.

For example, a vehicle may be active in the fleet but unavailable for a specific date because it has been reserved.

Document:

Proposed status enums

Status transitions

Allowed and forbidden transitions

Business rules

Future reservation dependencies

5. Pricing and Rental Rules
Evaluate what pricing information is needed for the initial vehicle module.

Consider:

Base daily rental price

Supported currency

Security deposit

Daily versus seasonal rates

Minimum rental period

Extra mileage pricing

Optional equipment pricing

Discount and promotion requirements

Determine which fields belong directly on Vehicle and which may require dedicated pricing models later.

Document monetary precision requirements. Monetary values must not rely on imprecise JavaScript floating-point calculations for billing.

6. UX and Dashboard Research
Design the recommended vehicle management experience for a business owner.

Analyze:

Vehicle Listing
Table versus card layout

Useful columns

Vehicle thumbnail

Search

Filters

Sorting

Pagination

Status indicators

Quick actions

Empty/loading/error states

Vehicle Details
Main vehicle information

Technical specifications

Pricing information

Status

Photos

Operational notes

Future reservation and maintenance sections

Create/Edit Forms
Field grouping

Required-field indicators

Dropdowns and enum selectors

Numeric validation

Error messages

Save/cancel behavior

Responsive layouts

Provide wireframes, diagrams, or referenced UI examples where useful.

The UI proposal should prioritize everyday usability over decorative complexity.

7. Domain and API Architecture
Propose a Vehicle domain model compatible with the existing RentACar architecture.

Define:

Vehicle fields and types

Enum values

Required and optional fields

Unique constraints

Tenant ownership

Validation rules

Pagination and filtering

Error responses

Propose contracts for:

GET /tenant/vehicles

GET /tenant/vehicles/:id

POST /tenant/vehicles

PATCH /tenant/vehicles/:id

PATCH /tenant/vehicles/:id/status

For each endpoint, document:

Purpose

Authentication requirement

Request parameters

Request DTO

Success response example

Validation errors

Authorization behavior

Not-found behavior

Important: API contracts are proposals, not implementation.

All tenant ownership must be resolved from authenticated server-side context.

Never trust a client-provided tenant ID for authorization.

Reference the approved Phase C architecture:

docs/architecture/tenant-authentication.md

8. MVP Scope and Future Roadmap
Separate researched requirements into three groups:

Phase D MVP
Essential vehicle management features required for the initial operational release.

Later Vehicle Enhancements
Features that improve fleet management but are not required immediately.

Future Business Modules
Features that belong to separate systems, such as:

Reservations

Customers and drivers

Rental contracts

Payments

Maintenance scheduling

Advanced pricing

Reporting and analytics

For every deferred feature, explain the dependency and why it should not be implemented in the current phase.

9. Technical Boundaries
This task is documentation and research only.

Do not:

Modify Prisma schema

Implement vehicle API endpoints

Modify tenant authentication

Modify Platform Admin authentication

Modify the Tenant Admin dashboard

Implement vehicle UI components

Integrate with real backend APIs

This work must remain independent of C3–C10.

10. Deliverable
Create:

docs/architecture/vehicle-management.md

The document must contain:

Executive summary

Industry research and sources

Business owner workflows

Vehicle field matrix

Status and availability decisions

Pricing requirements

UX recommendations

Proposed data model

Proposed API contracts

Phase D MVP scope

Future module dependencies

Open questions and tradeoffs

The document must be understandable by another developer without requiring access to the author's ChatGPT conversation.

Acceptance Criteria
At least three relevant products or workflows have been researched.

Research sources and URLs are included.

Core car rental company workflows are documented.

Vehicle information requirements are categorized.

Vehicle fields have types, validation rules, and priorities.

Pricing and deposit requirements are evaluated.

Vehicle status and availability are clearly distinguished.

Maintenance, insurance, and media needs are evaluated.

Vehicle listing and form UX recommendations are documented.

Proposed Vehicle data model is documented.

Proposed API contracts are documented.

Tenant isolation rules follow C1.

MVP scope is clearly distinguished from future features.

Future module dependencies are identified.

Architecture document is committed in a dedicated branch.

PR is reviewed and approved by Mustafa before implementation.

Dependencies
Approved C1 architecture

No runtime dependency on C3–C10

Definition of Done
D1 is complete when the architecture document has been reviewed, approved, and merged into main.

D4, D2, and D3 must follow the approved D1 decisions.
```

</details>

<details>
<summary>#36 — D4- feat(web): create shared vehicle types, validation and UI components</summary>

```text
D4- feat(web): create shared vehicle types, validation and UI components
 #36

D4 — Shared Vehicle Types, Validation & Components
Objective
Create the reusable frontend foundation for RentACar's vehicle management module.

The implementation must follow the approved D1 vehicle management architecture and remain independent of the unfinished Phase C tenant authentication and dashboard implementation.

Assigned to: Eda
Phase: D — Vehicle Management
Type: Frontend / Shared Components

1. Shared Vehicle Types
Define TypeScript types based on the approved D1 contract.

Include appropriate types for:

Vehicle identity and specifications
Vehicle status
Transmission
Fuel type
Vehicle categories, if included in the MVP
Create Vehicle input
Update Vehicle input
Vehicle form values
Vehicle display data
List filters and sorting, if included in the MVP
Avoid duplicating types across forms, components, and mock data.

Use a clear folder structure, such as:

apps/web/types/vehicle.ts
apps/web/components/vehicles/
apps/web/lib/vehicles/
Follow existing project conventions where possible.

2. Shared Validation
Implement reusable validation rules based on the D1 field matrix.

Validation should cover approved MVP requirements, such as:

Required fields
String length limits
Valid numeric ranges
Model year constraints
License plate formatting
Enum values
Price and deposit inputs, if included in the MVP
Use an existing validation library if appropriate, or implement small reusable validators.

Avoid introducing unnecessary dependencies.

Frontend validation improves usability but must not be treated as a replacement for backend validation.

3. Reusable UI Components
Build the shared components required by D2 and D3.

Potential components:

VehicleForm
VehicleCard
VehicleStatusBadge
VehicleField
VehicleEmptyState
Reusable vehicle selectors
Only create components justified by approved requirements.

Avoid excessive abstraction or premature component development.

4. Typed Mock Data
Create representative vehicle fixtures that cover:

Multiple brands and models
Different transmission types
Different fuel types
Active and inactive vehicles
Empty-state scenarios
Realistic field values
All mock data must use the approved Vehicle TypeScript types.

Keep fixtures separate from production API services.

Do not hardcode real customer or tenant data.

5. Independence from Phase C
This Issue must not modify:

apps/api/prisma/schema.prisma
Tenant authentication services or guards
Platform Admin authentication
Tenant Admin dashboard layout
Shared authentication/session logic
Do not call real Vehicle APIs.

Do not rely on hardcoded Tenant IDs.

Components should be usable through props and callback interfaces.

6. Component Behavior
Shared components must:

Support appropriate loading and disabled states.
Display validation errors clearly.
Use accessible labels and controls.
Remain responsive.
Avoid claiming mock actions have persisted data.
Be ready for future backend integration.
7. Testing
Add appropriate component or validation tests.

At minimum, validate:

Required-field behavior
Invalid field values
Allowed enum values
Reusable component props
Mock data compatibility
TypeScript correctness
Run frontend quality checks.

Acceptance Criteria

Shared Vehicle types are defined.

Types follow the approved D1 architecture.

Create and edit input types are available.

Shared validation rules are implemented.

Required MVP components are implemented.

Typed mock fixtures are created.

Components are reusable through props.

Frontend and backend concerns remain separated.

No real backend API calls are introduced.

Tenant authentication and dashboard files remain untouched.

Frontend tests and validation checks pass.

ESLint passes.

TypeScript check passes.

Production build passes.
Out of Scope
Vehicle Prisma models
Vehicle CRUD endpoints
Real API integration
Tenant session management
Tenant dashboard integration
Vehicle image uploads
Reservation and customer management
Dependencies
Requires D1 to be reviewed and merged into main.

D4 must be merged before D2 and D3.

Definition of Done
Shared types, validation, components, and mock fixtures are reviewed and merged into main without introducing dependencies on incomplete Phase C features.
```

</details>

<details>
<summary>#37 — D2- feat(web): build tenant vehicle listing interface</summary>

```text
D2- feat(web): build tenant vehicle listing interface
 #37

D2 — Tenant Vehicle Listing Interface
Objective
Build the vehicle listing interface that car rental company owners will use to view and manage their fleet.

The UI must follow the approved D1 business requirements and reuse the shared Vehicle types and components introduced in D4.

The initial implementation must use mock data and must not depend on real backend APIs or the unfinished Tenant Admin dashboard.

Assigned to: Eda
Phase: D — Vehicle Management
Type: Frontend / UI

1. Vehicle Listing
Build a responsive vehicle inventory interface.

Display the fields prioritized in the approved D1 requirements, potentially including:

Vehicle image or placeholder
Brand and model
Model year
License plate
Transmission
Fuel type
Daily rental price, if included in the MVP
Fleet status
Do not display unnecessary fields simply because they exist in the domain model.

Prioritize the information that company owners need for everyday fleet management.

2. Search, Filtering and Sorting
Implement the search and filter UI approved in D1.

Consider:

Search by brand
Search by model
Search by license plate
Filter by fleet status
Filter by transmission
Filter by fuel type
Sort by relevant fields
For mock data, implement functional client-side filtering where practical.

Do not imply that server-side filtering or pagination has already been implemented.

3. Fleet Status
Use the status model approved in D1.

Clearly distinguish fleet activation state from rental availability.

For example:

Active/inactive is a fleet management state.
Reserved/rented availability will depend on future booking and rental modules.
Do not present mock rental availability as real-time data.

4. UI States
Implement:

Initial data display
Empty vehicle list
No search results
Loading state
Error state
Responsive layouts
Use the shared components from D4 where appropriate.

5. Vehicle Actions
Provide appropriate UI affordances for:

Add Vehicle
View Vehicle
Edit Vehicle
View status
Actual navigation should only target implemented routes or explicitly marked demo screens.

Do not create misleading production actions that pretend to save real vehicles.

6. Mock Data Architecture
Use typed fixtures from D4.
Separate rendering from data retrieval.
Accept data through reusable component props where possible.
Avoid direct coupling to backend endpoints.
Avoid storing mock Vehicle data in real production services.
7. Integration Readiness
Structure components so they can later be integrated into the protected Tenant Admin dashboard created during C9.

Do not modify the Tenant Admin dashboard layout or shared authentication files.

Full backend integration will be implemented in a later Phase D Issue.

8. Testing
Validate:

Vehicle rows/cards render correctly.
Filters and search work with mock data.
Empty and error states are handled.
Vehicle status is presented correctly.
Responsive behavior is acceptable.
No real backend requests are made.
Acceptance Criteria

Vehicle listing UI is implemented.

Displayed fields match D1 MVP decisions.

D4 shared types and components are reused.

Search and filtering work with mock data.

Fleet status is correctly represented.

Empty, loading, and error states exist.

Desktop and mobile layouts are responsive.

No real Vehicle API dependency is introduced.

No tenant authentication/dashboard changes are made.

Existing Platform Admin UI remains functional.

Relevant tests pass.

ESLint passes.

TypeScript check passes.

Production build passes.
Out of Scope
Real Vehicle API
Prisma changes
Server-side pagination
Tenant authentication
Real-time rental availability
Reservation management
Vehicle persistence
Real image uploads
Dependencies
Requires D1 and D4 to be reviewed and merged.

Future integration depends on the Tenant Admin dashboard and Vehicle API.

Definition of Done
The vehicle listing UI is reviewed, tested, and merged into main as an independent frontend module using typed mock data.
```

</details>

<details>
<summary>#38 — D3- feat(web): build vehicle create and edit forms</summary>

```text
D3- feat(web): build vehicle create and edit forms
 #38

Objective
Build practical and reusable Vehicle creation and editing interfaces for car rental company owners.

All fields, validation rules, and form workflows must follow the approved D1 architecture and reuse the shared Vehicle components from D4.

The initial implementation must work without real backend persistence or Tenant Admin authentication.

Assigned to: Eda
Phase: D — Vehicle Management
Type: Frontend / Forms

1. Vehicle Creation
Create a Vehicle form using the approved D1 MVP field matrix.

Potential sections include:

Vehicle Identity
Brand
Model
Model year
License plate
Category
Color
Technical Specifications
Transmission
Fuel type
Passenger capacity
Mileage
Other approved MVP specifications
Rental Information
Daily rental price
Currency
Security deposit
Other approved MVP rental settings
Operational Details
Fleet activation status
Internal notes
Other approved MVP fields
Only implement fields included in the approved D1 scope.

2. Vehicle Editing
Build an edit interface that:

Loads data from typed mock fixtures.
Prefills the shared Vehicle form.
Allows editing supported fields.
Preserves unrelated values.
Provides clear save and cancel actions.
Handles missing or invalid mock vehicle IDs appropriately.
3. Shared Form Architecture
Use the VehicleForm created in D4.

Avoid separate duplicated create and edit forms.

Define clear submission callback interfaces to support later backend integration.

Do not couple the shared form directly to API requests.

4. Validation
Implement the D1 validation requirements.

Consider:

Required fields
Model year range
Valid numeric values
Price and deposit input formats
License plate format
Enum selection
Text length limits
Show errors beside the relevant fields.

Prevent invalid submission.

Do not use client-side validation as a substitute for backend enforcement.

5. Form UX
Implement:

Required-field indicators
Logical field grouping
Suitable default values
Loading and submitting states
Save and cancel actions
Clear success/error demonstration states
Responsive layout
Accessible labels and keyboard navigation
Mock submissions must be clearly identified as demos and must not claim data has been saved to PostgreSQL.

6. Image Handling
If D1 includes vehicle photos in the MVP:

Design the intended image section.
Use placeholders or mock previews.
Document the expected upload behavior.
Do not implement real file storage or upload APIs in D3.

7. Integration Readiness
The create/edit interfaces must be easy to connect to the future Vehicle CRUD API.

Keep form components separate from networking and authentication logic.

Do not modify the Tenant Admin dashboard layout.

8. Testing
Validate:

Form rendering
Required-field errors
Invalid numeric input
Valid enum selection
Mock form submission
Edit form prefill
Loading and disabled states
Responsive behavior
Acceptance Criteria

Vehicle creation UI is implemented.

Vehicle editing UI is implemented.

Shared D4 VehicleForm is reused.

Fields match the approved D1 MVP requirements.

Required validation rules are implemented.

Mock edit data correctly populates the form.

Invalid submissions are prevented.

Save and cancel interactions behave correctly.

Mock submission is not represented as real persistence.

Responsive layout is implemented.

Authentication and dashboard files remain untouched.

No real backend API calls are introduced.

Relevant frontend tests pass.

ESLint passes.

TypeScript check passes.

Production build passes.
Out of Scope
Vehicle CRUD API
Prisma migration
Real database persistence
Tenant authentication
Tenant dashboard integration
Production image uploads
Reservations
Customer management
Dependencies
Requires D1 and D4 to be reviewed and merged.

Full Vehicle CRUD integration will be handled in a later Phase D Issue.

Definition of Done
The Vehicle create/edit UI is reviewed, validated, and merged into main without requiring incomplete Phase C backend functionality.
```

</details>

<details>
<summary>#46 — E1 — Safe Tenant Application Deletion</summary>

```text
E1 — Safe Tenant Application Deletion
 #46
Objective
Implement secure deletion of tenant applications from the Platform Admin dashboard without affecting approved tenants or related records.

Scope
Backend
Implement DELETE /admin/tenant-applications/:id.
Only authenticated Platform Admin users may perform this action.
Allow deletion of PENDING and REJECTED applications only when tenantId is null.
Prevent deletion of APPROVED applications and applications linked to a Tenant.
Return appropriate HTTP responses:
204 No Content — successful deletion.
401 Unauthorized — no valid authentication.
403 Forbidden — authenticated user lacks permission, where applicable.
404 Not Found — application does not exist.
409 Conflict — application cannot be deleted.
Protect against concurrent approval/deletion operations using an atomic conditional database operation.
Handle foreign key constraints without cascading deletion of tenants.
Frontend
Add a Delete action to the existing Platform Admin tenant application interface.
Show a confirmation dialog before deletion.
Explain that deletion is permanent.
Disable or hide the action for approved applications.
Show loading, success and error feedback.
Refresh the application list after successful deletion.
Security & Data Integrity
Do not modify Platform Admin JWT/authentication behavior.
Do not modify Tenant Admin login, session or activation code.
Do not use onDelete: Cascade to delete related Tenant records.
Do not delete records linked to a Tenant.
Do not accept tenant identity or authorization information from the request body.
Preserve existing approval and rejection behavior.
Avoid changing Prisma schema unless absolutely necessary and agreed upon.
Acceptance Criteria

Platform Admin can delete a pending, unlinked application.

Platform Admin can delete a rejected, unlinked application.

Approved or tenant-linked applications cannot be deleted.

Two concurrent approve/delete requests cannot produce inconsistent results.

Unauthenticated users cannot delete applications.

Deleted applications disappear from the list.

Prisma Studio confirms that only the intended application record was deleted.

Existing application approval/rejection endpoints continue working.

TypeScript, lint, build and relevant existing tests pass.
Git & Collaboration
Create branch from the latest main:
feature/safe-tenant-application-deletion
Do not modify files under apps/api/src/auth/**.
Do not modify Tenant Admin session or JWT code.
Keep changes limited to tenant application backend, its relevant frontend UI and necessary related files.
Do not include unrelated formatting changes or refactoring.
Required PR Description
The Pull Request must include the following section, even if no additional setup is required.

Local Setup / Team Actions
Database migrations

State whether a new Prisma migration was added.
If yes, list its exact migration name.
Include commands for both developers to apply it after pulling:
cd apps/api
npx prisma migrate deploy
npx prisma generate
If no migration was added, explicitly write: No database migration required.
Dependencies

List any new npm packages.
If packages changed, instruct developers to run npm install from the relevant workspace/root.
Otherwise write: No dependency installation required.
Environment variables

List any new or changed .env variables and describe how to configure them without including secrets.
Otherwise write: No environment variable changes required.
Manual steps

List any required local setup, backend restart, data migration or other post-merge actions for Mustafa and Eda.
If none are required, explicitly state that.
Verification

Explain how another developer can verify the deletion behavior locally.
Include the result of TypeScript, lint, build and relevant tests.
Important: A successful git pull does not automatically apply database migrations, install new dependencies or update local .env files.

Out of Scope
Deleting Tenant records.
Deleting TenantAdmin accounts.
Deleting sessions, invitation tokens or invitation deliveries.
Changing tenant authorization and isolation.
Changing database relationships to cascading deletion.
```

</details>

<details>
<summary>#53 — Team Sync — C1–C10 Entegrasyonu, Yerel Kurulum ve Arayüz Uyumu</summary>

```text
Team Sync — C1–C10 Entegrasyonu, Yerel Kurulum ve Arayüz Uyumu
 #53

Amaç
C1–C10 kapsamında tamamlanıp main branch'ine birleştirilen geliştirmelerin Eda'nın yerel ortamına aktarılması, mevcut D/E serisi çalışmalarıyla uyumunun kontrol edilmesi ve bundan sonraki frontend geliştirmelerinde ortak tasarım standartlarının kullanılması.

Bu issue yeni özellik geliştirme görevi değildir. Önceliğimiz iki geliştiricinin aynı güncel altyapıyla sorunsuz çalışabilmesidir.

1. C Serisinde Neler Geliştirildi?
Şirket başvuru ve onay sistemi
Şirketlerin Tenant başvurusu oluşturabilmesi.
Platform Admin tarafından başvuruların listelenmesi ve detaylarının görüntülenmesi.
Başvuruların onaylanması veya reddedilmesi.
Onaylanan başvurular için Tenant ve TenantAdmin hesaplarının oluşturulması.
Tekrarlanan onaylama ve geçersiz durum geçişlerinin engellenmesi.
Davet ve hesap aktivasyonu
Onaylanan şirket yöneticisine aktivasyon daveti oluşturulması.
Güvenli, süreli ve tek kullanımlık aktivasyon token'ları.
Davet e-postalarının kuyruk üzerinden gönderilmesi.
Gönderim hatalarında yeniden deneme mekanizması.
/activate sayfasında parola belirlenerek hesabın etkinleştirilmesi.
Tenant Admin kimlik doğrulama sistemi
/tenant/login üzerinden şirket yöneticisi girişi.
Access token ve refresh token ile oturum yönetimi.
Refresh token rotasyonu ve eski token'ların geçersiz kılınması.
Logout sonrasında oturumun iptal edilmesi.
HttpOnly ve SameSite Strict cookie kullanımı.
Süresi dolan oturumların yenilenmesi ve güvenli yönlendirmeler.
Platform Admin ve Tenant Admin yetkilerinin birbirinden ayrılması.
Tenant Dashboard
/tenant altında korumalı Tenant Admin paneli.
Doğrulanmış oturum üzerinden şirket bilgilerinin getirilmesi.
Ortak sidebar ve header yapısı.
Mobil uyumlu açılır/kapanır menü.
Oturum kontrolü, yüklenme ve hata durumları.
Platform Admin arayüzü
Platform Admin mobil navigasyonunun iyileştirilmesi.
Başvuru listeleme ve detay sayfalarının mobil uyumluluğu.
Masaüstü düzeni korunarak dar ekranlardaki taşma sorunlarının giderilmesi.
Otomatik testler
C10 kapsamında aktivasyon, login, refresh, logout, JWT yetkilendirmesi, Tenant izolasyonu ve tam onboarding iş akışı test edildi.

Son doğrulanan sonuçlar:

96 backend unit/integration testi başarılı.
21 backend E2E testi başarılı.
Backend ve frontend TypeScript, lint ve build başarılı.
Tenant ve Platform Admin manuel arayüz testleri başarılı.
2. Eda — Yerel Ortam Entegrasyonu

Kendi çalışmalarının commit edildiğinden veya güvenli biçimde saklandığından emin ol.

main branch'ine geçip en güncel değişiklikleri çek.

Backend ve frontend bağımlılıklarını güncel kurulumla kontrol et.

Mevcut .env yapılandırmasının yeni backend gereksinimlerini karşıladığını doğrula.

Prisma migration durumunu kontrol et; bekleyen migration'ları uygun yerel veritabanına uygula.

Prisma Client'ın güncel şemadan üretildiğini doğrula.

Backend ve frontend uygulamalarını yeniden başlat.
Önemli: Proje Prisma 7 kullanıyor. Prisma komutlarını apps/api klasöründe, projenin kurulu sürümüyle çalıştır. Farklı bir Prisma sürümünü yanlışlıkla indirme.

Migration uygulamadan önce hedef veritabanının doğru olduğunu kontrol et. migrate reset kullanma.

Test veritabanı
Backend E2E testleri için geliştirme veritabanından ayrı bir PostgreSQL rentacar_test veritabanı kullanılmalı.


.env.test dosyasının yerel test veritabanına işaret ettiğini doğrula.

Test veritabanında gerekli Prisma migration'larını uygula.

E2E testlerini yalnızca izole test veritabanında çalıştır.
.env, .env.test ve gizli anahtarlar GitHub'a gönderilmemeli.

3. Eda — Çalışma Kontrolleri
Backend
apps/api klasöründe:

npx tsc --noEmit
npm run lint
npm run build
npm test
npm run test:e2e
Frontend
apps/web klasöründe:

npx tsc --noEmit
npm run lint
npm run build
Testleri çalıştırırken ortaya çıkan hatalar çözülmeli veya ilgili issue altında açıklanmalı.

4. Manuel Entegrasyon Testleri

Platform Admin hesabıyla giriş yap.

Şirket başvuru listesini ve detay ekranını kontrol et.

Başvuru onaylama/reddetme akışlarını doğrula.

Davet ve aktivasyon akışının çalıştığını kontrol et.

Tenant Admin hesabıyla giriş yap.

Tenant Dashboard'da doğru şirket bilgilerinin gösterildiğini doğrula.

Sayfa yenileme ve birden fazla sekmede oturum davranışını kontrol et.

Logout sonrası korumalı sayfalara erişilemediğini doğrula.

Platform Admin ve Tenant Admin yetki ayrımını kontrol et.

Her iki panelin mobil görünümünü incele.
5. D/E Serisiyle Uyumluluk
Eda'nın daha önce tamamladığı D/E serisi çalışmalarının güncel C serisiyle uyumlu kalması gerekiyor.


D/E kapsamında geliştirilen sayfaları ve bileşenleri güncel main üzerinde kontrol et.

API endpoint'leri, response alanları ve kimlik doğrulama beklentilerinin uyumunu incele.

Tenant'a ait işlemlerde şirket kimliğinin istemciden gelen güvenilmeyen değerler yerine doğrulanmış oturumdan alınmasına dikkat et.

Ortak layout ve navigasyon bileşenlerinin gereksiz kopyalarını oluşturma.

Birleşme sonrasında bozulmuş sayfa, yönlendirme veya kullanıcı akışı varsa bu issue altında belirt.
6. Ortak UI Tasarım Standartları
Bundan sonraki frontend geliştirmelerinde iki farklı yönetim panelinin görsel kimliği korunmalı.

Tenant Admin — Koyu orman yeşili
Ana renk: #13241f

Tenant Sidebar ve mobil navigasyonda mevcut yeşil tasarım korunmalı.
Yeni sayfalar mevcut Tenant Dashboard layout'una uyumlu olmalı.
Sidebar, header, butonlar ve sayfa boşlukları tutarlı kullanılmalı.
Mobil ekranlarda menüler ve içerikler taşmamalı.
Platform Admin — Lacivert
Ana renk: #19243a

Platform Admin sidebar ve mobil navigasyonda mevcut lacivert tasarım korunmalı.
Yeni Platform Admin sayfaları mevcut layout ve navigasyonla uyumlu olmalı.
Başvuru listesi ve detay sayfalarındaki responsive yaklaşım sürdürülmeli.
Tenant Admin'e ait yeşil tasarım Platform Admin'e karıştırılmamalı.
Renkler tek başına tasarım standardı değildir. Yeni bileşenler oluşturulurken güncel main branch'indeki mevcut sayfaların tipografi, spacing, border ve responsive davranışları referans alınmalı.

7. ChatGPT / Geliştirme Asistanı Senkronizasyonu
Eda, bu issue'nun tamamını kendi ChatGPT asistanıyla paylaşmalı.

Asistanına özellikle şu bilgiler aktarılmalı:

C1–C10 tamamlandı ve main branch'ine merge edildi.
Tenant authentication, activation, refresh ve logout altyapısı mevcut.
Tenant Dashboard ve Platform Admin için yeni ortak layout ve mobil navigasyon yapıları mevcut.
Yeni frontend işleri başlamadan önce güncel main branch'indeki ilgili kodlar incelenmeli.
Tenant Admin tasarım rengi #13241f, Platform Admin tasarım rengi #19243a.
D/E serisi çalışmalarında mevcut auth ve layout yapıları yeniden oluşturulmamalı; hazır altyapı kullanılmalı.
Not: Bu issue bir koordinasyon ve entegrasyon görevidir. Ayrıca uzun bir tasarım dokümanı hazırlamaya gerek yok; güncel kod ve bu issue ortak referans olacaktır.

Tamamlanma Kriterleri

Eda'nın yerel ortamı güncel main ile sorunsuz çalışıyor.

Gerekli bağımlılıklar ve migration'lar doğrulandı.

Backend ve frontend testleri başarılı.

Tenant ve Platform Admin manuel iş akışları kontrol edildi.

D/E serisinde regresyon bulunmadı veya sorunlar açıkça kaydedildi.

Yeni UI standartları Eda ve geliştirme asistanı tarafından benimsendi.

Eda, test sonuçlarını ve varsa kalan sorunları bu issue'ya yorum olarak yazdı.
```

</details>

<details>
<summary>#54 — F1 — docs(architecture): Ortak Proje Hafızası ve Vehicle API Sözleşmesinin Netleştirilmesi</summary>

```text
F1 — docs(architecture): Ortak Proje Hafızası ve Vehicle API Sözleşmesinin Netleştirilmesi
 #54


F1 — docs(architecture): Ortak Proje Hafızası ve Vehicle API Sözleşmesinin Netleştirilmesi
Sorumlu: Mustafa
Branch: docs/f1-project-sync-vehicle-contract
Bağımlılıklar: C1–C10, D1–D4
Tür: Mimari / Backend / Takım koordinasyonu

Amaç
RentACar projesinin güncel durumunu her iki geliştiricinin ve kullandıkları ChatGPT asistanlarının anlayabileceği ortak bir dokümanda tutmak. Aynı zamanda D1 araç mimarisi ile mevcut frontend tipleri arasındaki farklılıkları çözerek backend geliştirmeleri için kesin bir API sözleşmesi oluşturmak.

Yapılacaklar

Mevcut C1–C10, D1–D4 ve E1 geliştirmelerinin kaynak kod ve mimari dokümanlarını gözden geçir.

docs/team/PROJECT_STATUS.md dosyasını oluştur.

Dosyada tamamlanan özellikler, aktif işler, sonraki görevler, mimari kararlar ve önemli dosya yolları bulunsun.

PR sonrasında dosyanın nasıl güncelleneceğine dair kısa bir ekip kuralı tanımla.

docs/architecture/vehicle-management.md dosyasındaki D1 kararlarını incele.

apps/web/types/vehicle.ts dosyasını ve mevcut araç formlarını karşılaştır.

Vehicle API alanlarını, enum değerlerini, nullable alanları ve para formatını kesinleştir.

Frontend ile D1 arasında farklı olan sıralama seçeneklerini uzlaştır.

Pagination, filtreleme, hata kodları ve response yapısını netleştir.

Tenant sahipliğinin istemciden değil doğrulanmış oturumdan geleceğini sözleşmede belirt.

Kararları mevcut mimari dokümanında güncelle ve Eda'nın incelemesine sun.
Teknik sınırlar
Bu görev yeni Prisma migration, çalışan Vehicle endpoint'i veya araç ekranı oluşturmayacak. Mevcut kimlik doğrulama altyapısı değiştirilmeyecek.

Öğrenme hedefleri
API-first design, domain modeling, teknik dokümantasyon, frontend-backend sözleşmesi, sürüm uyumluluğu ve ekip koordinasyonu.

Kabul kriterleri

İki geliştiricinin kullanabileceği ortak proje durum dosyası mevcut.

Vehicle API sözleşmesi D1 ve D4 ile uyumlu.

Açık kararlar ve ertelenen özellikler belirtilmiş.

Eda sözleşmeyi incelemiş ve önemli uyumsuzluklar çözülmüş.

Dokümantasyon güncel main üzerinde birleştirilmiş.
PR / Local Setup / Team Actions
Yeni bağımlılık, migration veya environment variable beklenmiyor. PR'da bu durum açıkça belirtilmeli.
```

</details>

<details>
<summary>#55 — F2 — feature(api): Tenant Bazlı Vehicle Prisma Modeli ve Migration</summary>

```text
F2 — feature(api): Tenant Bazlı Vehicle Prisma Modeli ve Migration
 #55
F2 — feature(api): Tenant Bazlı Vehicle Prisma Modeli ve Migration
Sorumlu: Mustafa
Branch: feature/f2-vehicle-prisma-model
Bağımlılık: F1
Tür: Backend / Database

Amaç
Onaylanmış Tenant'ların araçlarını PostgreSQL üzerinde güvenli ve kalıcı biçimde saklayabileceği veri modelini oluşturmak.

Yapılacaklar

F1'de onaylanan alanları esas alarak Prisma Vehicle modelini ekle.

Tenant ile bire-çok ilişki kur.

Her aracın tam olarak bir Tenant'a ait olmasını sağla.

Araç kimlik alanlarını ekle: plate, vin, internalCode, make, model, modelYear.

Teknik özellikleri ekle: category, transmission, fuelType, seatCount, doorCount, odometerKm ve onaylanan opsiyonel alanlar.

Günlük fiyat, para birimi, depozito ve kilometre ücretlerini doğru veri tipleriyle sakla.

fleetStatus için yalnızca ACTIVE/INACTIVE durumlarını kullan.

Rezervasyon müsaitliğini Vehicle statüsüymüş gibi modelleme.

Tenant bazlı plaka/VIN/internalCode benzersizlik kısıtlarını değerlendir ve uygula.

Plaka normalizasyonunun veritabanı kısıtlarıyla tutarlı olmasını sağla.

Gerekli indeksleri ve silme davranışlarını belirle.

Prisma migration oluştur.

Prisma Client'ı yeniden üret ve şemayı doğrula.

Boş veya eksik opsiyonel alanların nasıl saklanacağını test et.
Güvenlik
tenantId zorunlu ilişki olmalı.
İleride araç silinmesi, Tenant veya tarihsel kiralama kayıtlarını yanlışlıkla silmemeli.
Veritabanı seviyesinde mümkün olan veri bütünlüğü kuralları uygulanmalı.
Kapsam dışı
Controller, HTTP endpoint, rezervasyon, araç fotoğrafları ve müşteri kayıtları.

Öğrenme hedefleri
Prisma ilişkileri, foreign key, composite unique constraint, index, migration, Decimal ve veritabanı tasarım kararları.

Kabul kriterleri

Vehicle modeli tanımlı ve Prisma doğrulaması başarılı.

Tenant–Vehicle ilişkisi çalışıyor.

Aynı Tenant'ın yinelenen normalleştirilmiş plakası engelleniyor.

Farklı Tenant kayıtları birbirinden bağımsız.

Migration güvenli şekilde uygulanıyor.

Backend TypeScript ve build kontrolü başarılı.

Test veritabanında migration doğrulanmış.
PR / Local Setup / Team Actions
Migration adı, hangi veritabanlarına uygulanacağı, Prisma Client üretimi ve backend yeniden başlatma gerekliliği PR'da yazılmalı. Üretim veya değerli geliştirme veritabanlarında migrate reset kullanılmamalı.
```

</details>

<details>
<summary>#56 — F3 — feature(api): Güvenli Tenant Vehicle Listeleme ve Detay Endpoint'leri</summary>

```text
F3 — feature(api): Güvenli Tenant Vehicle Listeleme ve Detay Endpoint'leri
 #56


F3 — feature(api): Güvenli Tenant Vehicle Listeleme ve Detay Endpoint'leri
Sorumlu: Mustafa
Branch: feature/f3-tenant-vehicle-read-api
Bağımlılık: F2
Tür: Backend / API / Security

Amaç
Tenant Admin kullanıcılarının yalnızca kendi şirketlerine ait araçları listeleyebilmesini ve detaylarını görüntüleyebilmesini sağlamak.

Endpoint'ler
GET /tenant/vehicles
GET /tenant/vehicles/:id
Yapılacaklar

NestJS Vehicle modülü, controller ve service katmanlarını oluştur.

Mevcut Tenant JWT guard ve doğrulanmış oturum yapısını kullan.

Tenant kimliğini yalnızca sunucu tarafındaki kimlik doğrulama bağlamından al.

Araçları tenantId ile sınırlandırarak sorgula.

Sayfalama için page/limit doğrulaması ve maksimum limit uygula.

Plaka, marka ve model araması ekle.

Kategori ve filo durumu filtreleri ekle.

Sıralama alanlarını F1 sözleşmesindeki allowlist ile sınırlandır.

Sonuçlar için kararlı sıralama ve toplam kayıt sayısı sağla.

Tek araç detayında id ve tenantId birlikte doğrulansın.

Başka şirkete ait veya olmayan araçlar için bilgi sızdırmayan 404 döndür.

Decimal para alanlarını JSON'da string olarak döndür.

Swagger açıklamalarını ve ilgili unit testleri yaz.
Öğrenme hedefleri
NestJS controller/service/module mimarisi, dependency injection, DTO, pagination, query validation, authorization ve response serialization.

Test senaryoları
Tenant A kendi aracını görebilmeli.
Tenant B aynı araç ID'siyle detay alamamalı.
Platform Admin JWT, Tenant API'ye erişememeli.
Geçersiz pagination ve sort değerleri reddedilmeli.
Boş araç listesi doğru response döndürmeli.
Kabul kriterleri

İki endpoint çalışıyor.

Tenant izolasyonu uygulanmış.

Filtreler ve pagination doğrulanmış.

API response F1 sözleşmesine uyuyor.

İlgili unit testler başarılı.

Backend lint, TypeScript ve build başarılı.
Kapsam dışı
Araç ekleme, düzenleme, silme, durum güncelleme ve frontend entegrasyonu.

PR / Local Setup / Team Actions
Yeni environment variable veya migration varsa açıkça belirt; yoksa da 'Yok' yaz. API restart ve test komutlarını ekle.
```

</details>

<details>
<summary>#57 — F4 — feature(api): Tenant Vehicle Oluşturma Endpoint'i</summary>

```text
F4 — feature(api): Tenant Vehicle Oluşturma Endpoint'i
 #57


F4 — feature(api): Tenant Vehicle Oluşturma Endpoint'i
Sorumlu: Mustafa
Branch: feature/f4-tenant-vehicle-create
Bağımlılık: F3
Tür: Backend / API

Amaç
Tenant Admin'in yeni araç ekleyebilmesini, bu aracın PostgreSQL'de kalıcı saklanmasını ve başka Tenant'a yanlışlıkla bağlanamamasını sağlamak.

Endpoint
POST /tenant/vehicles

Yapılacaklar

F1 sözleşmesine uygun CreateVehicle DTO oluştur.

Zorunlu araç alanlarını doğrula.

Metin uzunluklarını, model yılını, enum değerlerini ve sayı aralıklarını doğrula.

Fiyat/depozito alanlarında decimal string doğrulaması yap.

Plakayı kaydetmeden önce kararlaştırılan kurala göre normalize et.

Boş opsiyonel değerleri tutarlı şekilde null/undefined olarak işle.

tenantId, id, fleetStatus ve timestamp alanlarının istemciden kontrol edilmesini engelle.

tenantId değerini doğrulanmış Tenant oturumundan al.

Veritabanındaki benzersizlik ihlallerini güvenli 409 hata yanıtına dönüştür.

Oluşturulan aracın detay response'unu döndür.

Swagger örnekleri ekle.

Başarılı ve başarısız oluşturma testleri yaz.
Güvenlik ve doğrulama
Başka Tenant ID'si göndererek araç oluşturmak mümkün olmamalı.
Bilinmeyen DTO alanları reddedilmeli.
Aynı Tenant'a eş zamanlı gönderilen duplicate plakalar veritabanı kısıtlarıyla korunmalı.
Hata mesajında ham SQL/Prisma hata detayları sızdırılmamalı.
Öğrenme hedefleri
DTO validation, NestJS pipes, Prisma create işlemi, HTTP 201, conflict handling ve yarış durumlarında veritabanı kısıtlarının önemi.

Kabul kriterleri

Geçerli araç isteği 201 döndürüyor.

Araç doğru Tenant'a kaydediliyor.

Hatalı veri uygun 400 yanıtı alıyor.

Duplicate plaka için 409 dönüyor.

İstemci Tenant sahipliğini değiştiremiyor.

Unit ve ilgili integration testleri başarılı.
Kapsam dışı
Araç fotoğrafı yükleme, araç düzenleme, rezervasyon ve fiziksel silme.

PR / Local Setup / Team Actions
Backend'in yeniden başlatılması, varsa yeni env/migration/dependency değişiklikleri ve test komutları açıklanmalı.
```

</details>

<details>
<summary>#58 — F5 — feature(api): Tenant Vehicle Güncelleme Endpoint'i</summary>

```text
F5 — feature(api): Tenant Vehicle Güncelleme Endpoint'i
 #58

F5 — feature(api): Tenant Vehicle Güncelleme Endpoint'i
Sorumlu: Mustafa
Branch: feature/f5-tenant-vehicle-update
Bağımlılık: F4
Tür: Backend / API

Amaç
Şirket yöneticisinin kendi aracının düzenlenebilir bilgilerini güncellemesini sağlamak.

Endpoint
PATCH /tenant/vehicles/:id

Yapılacaklar

F1 sözleşmesine uygun UpdateVehicle DTO oluştur.

Sadece izin verilen alanların güncellenmesini sağla.

Boş PATCH isteğini reddet.

tenantId, id, createdAt, fleetStatus gibi sistem alanlarını koru.

İzin verilen nullable alanlarda null ile alan temizleme davranışını uygula.

Güncellenen plaka/VIN/internalCode için benzersizlik kontrolünü koru.

Odometer azaltma durumunu D1 kararına göre ele al.

Araç bulunamadığında veya farklı Tenant'a ait olduğunda 404 döndür.

Güncelleme sırasında tenant filtresinin kaybolmamasını sağla.

Güncel aracın detay response'unu döndür.

Başarılı güncelleme, yetkisiz güncelleme ve validasyon testleri ekle.
Öğrenme hedefleri
HTTP PATCH ve PUT farkı, partial DTO, immutable field, null/undefined semantiği, authorization ve veri bütünlüğü.

Kabul kriterleri

Araç alanları güvenli biçimde güncelleniyor.

Başka Tenant'ın aracı değiştirilemiyor.

Sistem alanları değiştirilemiyor.

Null/undefined davranışı sözleşmeyle uyumlu.

Hatalar doğru HTTP kodlarıyla dönüyor.

Unit ve integration testleri başarılı.
Kapsam dışı
ACTIVE/INACTIVE durum değiştirme, silme, fotoğraf yükleme ve rezervasyon.

PR / Local Setup / Team Actions
Veritabanı/migration/env/dependency değişiklikleri ve backend yeniden başlatma ihtiyacı açıkça belirtilmeli.
```

</details>

<details>
<summary>#59 — F6 — test(api): Vehicle CRUD Tenant İzolasyonu ve E2E Güvenlik Testleri</summary>

```text
F6 — test(api): Vehicle CRUD Tenant İzolasyonu ve E2E Güvenlik Testleri
 #59

F6 — test(api): Vehicle CRUD Tenant İzolasyonu ve E2E Güvenlik Testleri
Sorumlu: Mustafa
Branch: test/f6-vehicle-security-e2e
Bağımlılıklar: F3, F4, F5 ve G4
Tür: Backend / Testing / Security

Amaç
Araç yönetiminin yalnızca mutlu senaryoda değil, gerçek HTTP istekleri ve ayrı Tenant kayıtlarıyla güvenli çalıştığını doğrulamak.

Yapılacaklar

İzole rentacar_test veritabanı kullanılacak.

İki ayrı Tenant, TenantAdmin ve oturum için test fixture'ları oluştur.

Tenant A araç oluşturduğunda Tenant B'nin liste ve detaydan erişemediğini doğrula.

Başka Tenant'ın aracını düzenleme girişimini test et.

G4 durum değiştirme endpoint'i için cross-tenant güvenlik testi ekle.

İstemciden gönderilen sahte tenantId değerinin reddedildiğini doğrula.

Platform Admin token'ının Tenant Vehicle API'de reddedildiğini test et.

Geçersiz/revoked oturum davranışını kontrol et.

Duplicate plaka, geçersiz decimal, hatalı enum ve invalid pagination testleri yaz.

Pagination toplam sayısının başka Tenant'ın araçlarını içermediğini doğrula.

Test fixture temizliğini güvenli ve tekrar çalıştırılabilir yap.

Mevcut C10 onboarding/auth/isolation testlerinin regresyon kontrollerini çalıştır.
Öğrenme hedefleri
Integration vs E2E test, test doubles, fixture isolation, güvenlik testi, regresyon ve PostgreSQL üzerinde gerçek iş akışı doğrulama.

Kabul kriterleri

Tenant A/B arasında veri sızıntısı yok.

Create/read/update/status işlemlerinin güvenliği doğrulanmış.

Normal ve hatalı istek senaryoları test edilmiş.

Testler rentacar_test üzerinde tekrar çalıştırılabiliyor.

Test verileri güvenli biçimde temizleniyor.

Backend test, lint, TypeScript ve build kontrolleri başarılı.
Kapsam dışı
Yeni araç özelliği geliştirmek veya frontend tasarımını değiştirmek.

PR / Local Setup / Team Actions
Test DB gereksinimleri, uygulanması gereken mevcut migration'lar ve test çalıştırma komutları PR'da açıklanmalı.
```

</details>

<details>
<summary>#60 — F7 — feature(web): Tenant Admin Araç Detay Sayfası</summary>

```text
F7 — feature(web): Tenant Admin Araç Detay Sayfası
 #60


F7 — feature(web): Tenant Admin Araç Detay Sayfası
Sorumlu: Mustafa
Branch: feature/f7-tenant-vehicle-detail-page
Bağımlılıklar: F3, G1, G3
Tür: Frontend / Next.js / Integration

Amaç
Mustafa'nın frontend geliştirme pratiği kazanması ve Tenant Admin'in araç detaylarını profesyonel bir ekrandan görüntüleyebilmesi.

Sayfa
/tenant/vehicles/[id]

Yapılacaklar

Mevcut Tenant Admin layout'unu kullan.

Yeni ayrı sidebar/header oluşturma.

Detay ekranını #13241f Tenant tasarım diliyle uyumlu hazırla.

Aracın plakasını, marka/modelini, kategorisini ve filo durumunu göster.

Teknik özellikler, fiyatlandırma ve operasyon bilgilerini anlaşılır bölümlere ayır.

API'den gelen gerçek araç verilerini kullan.

Loading, error, 404 ve boş opsiyonel alan durumlarını ele al.

Araç listesine dönüş bağlantısı ekle.

Düzenleme sayfasına yönlendirme hazırla.

Bilgileri masaüstü ve mobil ekranlarda okunabilir göster.

Eda'nın mevcut Vehicle bileşenlerinden uygun olanları yeniden kullan.

Yetkisiz oturumlarda mevcut Tenant auth davranışını koru.
Tasarım beklentisi
Abartılı dashboard kartları veya fazla dekoratif tasarım kullanılmayacak. Bilgi hiyerarşisi, net başlıklar, tutarlı boşluklar, sade ikonlar ve profesyonel detay sunumu önceliklidir.

Öğrenme hedefleri
Next.js App Router, dynamic routes, React component composition, async data fetching, UI state management ve responsive tasarım.

Kabul kriterleri


Detay sayfası Tenant sidebar üzerinden ulaşılan araç listesiyle entegre.

Doğru araç verisi gösteriliyor.

Bulunamayan araç için uygun durum gösteriliyor.

Loading/error/unauthorized durumları çalışıyor.

375px mobil genişlikte yatay taşma yok.

Frontend test, lint, TypeScript ve build kontrolleri başarılı.
PR / Local Setup / Team Actions
Yeni route, API bağımlılığı ve frontend yeniden başlatma gereksinimleri PR'da belirtilmeli.
```

</details>

 <details>
<summary>#61 — F8 — docs(architecture): Hesapsız Müşteri ve Rezervasyon Domain Tasarımı</summary>

> 28.11.2026 — Hesapsız Rezervasyon ve Takip Sistemi ürün kararı doğrultusunda görev kapsamı değiştirilmiştir. Eski Customer domain görevinin yerini yeni mimari tasarım görevi almıştır.

# F8 — docs(architecture): Hesapsız Müşteri ve Rezervasyon Domain Tasarımı

**Sorumlu:** Mustafa
**Reviewer:** Eda
**Branch:** `docs/f8-customer-reservation-domain`
**Bağımlılık:** F6, mevcut Tenant ve Vehicle mimarisi
**Tür:** Backend Architecture / Domain Design / Documentation

## Amaç

RentACar'ın kalıcı **Hesapsız Rezervasyon ve Takip Sistemi** ürün kararı doğrultusunda müşteri ve rezervasyon domainlerinin sınırlarını, ilişkilerini, veri modellerini ve temel iş kurallarını tasarlamak.

Bu görevde çalışan müşteri veya rezervasyon sistemi geliştirilmeyecektir. Hedef, sonraki geliştirme serilerinde uygulanabilecek, multi-tenant SaaS mimarisiyle uyumlu ve ekip tarafından anlaşılabilir bir teknik tasarım ortaya koymaktır.

## 1. Mevcut altyapı ve ürün kararı

RentACar, Next.js ve NestJS tabanlı, PostgreSQL ve Prisma kullanan multi-tenant araç kiralama SaaS platformudur.

Mevcut Platform Admin ve Tenant Admin authentication sistemleri, tenant izolasyonu ve Vehicle CRUD altyapısı korunacaktır.

**Kalıcı ürün kararı:**

- Müşteriler web sitesi veya mobil uygulama üzerinden hesap oluşturmadan rezervasyon yapacaktır.
- Müşteriler için login, registration, password, JWT, refresh token veya authentication session bulunmayacaktır.
- Hesapsız rezervasyon geçici bir Guest Booking özelliği olarak tanımlanmayacaktır.
- Müşteri rezervasyonu oluşturduğunda takip kodu alacak, rezervasyonu başlangıçta `PENDING` olacaktır.
- Tenant Admin rezervasyonu inceleyerek onaylayacak veya reddedecektir.
- Müşteri aynı takip koduyla rezervasyonunun durumunu sorgulayacaktır.
- Müşteri tarafında SMS, OTP veya e-posta doğrulaması bulunmayacaktır.
- İlk sürümde online ödeme bu mimarinin uygulama kapsamına dahil değildir.

## 2. Yapılacaklar

### 2.1 Customer domain

- Customer kavramını Platform Admin ve Tenant Admin gibi authentication kullanıcılarından kesin olarak ayır.
- Customer'ın Tenant'a ait ticari/iletişim kaydı olmasını tasarla.
- Ad, soyad ve telefon gibi temel alanları belirle.
- E-posta, doğum tarihi ve diğer opsiyonel alanları değerlendir.
- Kimlik numarası ve ehliyet bilgilerinin MVP'de gerçekten gerekli olup olmadığını araştır; gereksiz kişisel veri toplamaktan kaçın.
- Telefon numarası ve e-posta normalizasyonunu tasarla.
- Aynı kişinin birden fazla rezervasyon oluşturmasını destekleyecek ilişki modelini belirle.
- Aynı telefon numarasının doğrulanmış kimlik kanıtı olmadığını dikkate al; otomatik müşteri birleştirme risklerini değerlendir.
- Müşteri kayıtlarının listeleme, arama ve ileride düzenleme ihtiyaçlarını belirle.
- Arşivleme, silme, anonimleştirme ve saklama yaklaşımını belgele.
- Customer ile Driver ve AdditionalDriver gibi gelecekteki kavramların farkını açıkla.

### 2.2 Reservation domain

- Reservation varlığının sorumluluğunu tanımla.
- Tenant, Customer, Vehicle ve Reservation arasındaki ilişkileri tasarla.
- Rezervasyon başlangıç/bitiş tarihleri ile alış/iade saatlerini belirle.
- Alış ve iade konumlarının farklı olabilmesini değerlendir.
- Uçuş kodu gibi rezervasyona özgü opsiyonel bilgileri belirle.
- Rezervasyonun kendi sistem içi kimliğini ve müşteri takip kodunu birbirinden ayır.
- `PENDING`, `CONFIRMED` ve `REJECTED` durumlarını veri modeli seviyesinde tanımla.
- Oluşturulma, onaylanma ve reddedilme zamanlarının saklanmasını değerlendir.
- Rezervasyon sırasında alınan müşteri ve fiyat bilgilerinin tarihsel olarak korunmasını tasarla.
- Rezervasyon ile gerçek kiralama sözleşmesi/teslim işleminin farklı domainler olduğunu açıkla.
- Belirli fiziksel araç üzerinden rezervasyon ile araç kategorisi üzerinden rezervasyon seçeneklerini karşılaştır; MVP yaklaşımını öner.

### 2.3 Location / Branch domain

- Mevcut `Vehicle.currentLocationLabel` alanının sınırlarını incele.
- Tenant'a ait şube, havalimanı ve teslimat noktası ihtiyacını değerlendir.
- Alış/iade konumları için önerilen model ve ilişkileri hazırla.
- Rezervasyon tarihindeki konum bilgisinin korunması gereksinimini incele.
- MVP'de hangi konum özelliklerinin uygulanacağını, hangilerinin erteleneceğini belirle.

### 2.4 Extra Services domain

- Bebek koltuğu, ek sürücü, navigasyon gibi seçilebilir hizmetleri modelle.
- Aracın mevcut teknik özellikleri ile ücretli ek hizmetleri ayır.
- Hizmetlerin Tenant'a özel tanımlanmasını tasarla.
- Sabit ücret ve günlük ücret yaklaşımlarını değerlendir.
- Ek hizmet kataloğu ile rezervasyonda seçilmiş hizmetlerin kayıtlarını ayır.
- Hizmet fiyatları değiştiğinde önceki rezervasyonların etkilenmemesini sağlayacak veri modelini öner.
- Miktar, kullanılabilirlik ve gelecekteki stok yönetimi ihtiyaçlarını değerlendir.

### 2.5 Pricing domain

- Mevcut Vehicle fiyat alanlarını incele.
- Araç bedeli, ek hizmetler, depozito, para birimi ve toplam tutar ayrımını tanımla.
- Rezervasyon anındaki fiyatların snapshot olarak korunmasını tasarla.
- PostgreSQL/Prisma `Decimal` ve API tarafında decimal string kullanımını değerlendir.
- Günlük fiyat hesaplamasının sınırlarını ve belirsiz iş kurallarını açıkla.
- Gelecekteki dinamik fiyatlandırma ve kampanya sistemlerini MVP dışında tut.

## 3. Veri modeli tasarımı

Önerilen her yeni model için aşağıdaki kararları belgeleyerek uygulanabilir Prisma taslakları hazırla:

- Modelin amacı ve domain sahipliği
- Alan adları, türleri ve zorunlulukları
- Nullable alanlar ve varsayılan değerler
- Tenant ilişkisi ve erişim sınırları
- Primary key, foreign key, unique ve index kararları
- Silme, arşivleme ve referential integrity davranışları
- Tarihsel snapshot ihtiyaçları
- Veri minimizasyonu ve saklama riskleri
- Alternatifler, trade-off'lar ve açık kararlar

Özellikle tenant sahipliğinin Customer ve Reservation üzerinden nasıl korunacağını, farklı tenant'lara ait kayıtların yanlış ilişkilendirilmesinin veri katmanında nasıl engellenebileceğini değerlendir.

ER diyagramı ve önerilen Prisma model taslaklarını doküman içerisinde sun. **Gerçek `schema.prisma` dosyasını değiştirme.**

## 4. Mimari dokümantasyon

Oluşturulacak dosya:

`docs/architecture/customer-reservation-domain.md`

Doküman en az şu bölümleri içermelidir:

1. Amaç ve kalıcı ürün kararları
2. Mevcut sistemle ilişkiler
3. Domain sınırları ve terminoloji
4. Customer veri modeli
5. Reservation veri modeli
6. Location/Branch seçenekleri
7. Extra Services tasarımı
8. Pricing ve snapshot yaklaşımı
9. ER diyagramı ve Prisma taslakları
10. Tenant izolasyonu ve kişisel veri sınırları
11. MVP / future scope ayrımı
12. Alternatifler, açık kararlar ve riskler
13. F9 ve sonraki uygulama görevlerine aktarılan gereksinimler

## 5. Öğrenme hedefleri

- Domain-driven design ve bounded context
- Relational database modeling
- Prisma ilişkileri, unique ve index tasarımı
- Multi-tenant veri izolasyonu
- Veri minimizasyonu ve kişisel veri yaşam döngüsü
- Tarihsel veri bütünlüğü ve snapshot yaklaşımı
- Alternatif tasarımların teknik karşılaştırması

Kararlar yalnızca belgelenmemeli; neden seçildikleri ve hangi alternatiflerin elendiği de açıklanmalıdır.

## 6. Kabul kriterleri

- [ ] Hesapsız rezervasyon yaklaşımı kalıcı ürün kararı olarak belgelenmiş.
- [ ] Customer kavramı authentication kullanıcılarından ayrılmış.
- [ ] Tenant, Customer, Reservation ve Vehicle ilişkileri tanımlanmış.
- [ ] Müşteri alanları zorunlu/opsiyonel olarak sınıflandırılmış.
- [ ] Gereksiz kimlik, ehliyet ve hassas verilerin toplanması önlenmiş.
- [ ] Tekrarlanan müşteri kayıtları için yaklaşım tasarlanmış.
- [ ] Müşteri verilerinin saklama, arşivleme ve anonimleştirme riskleri açıklanmış.
- [ ] Rezervasyon snapshot yaklaşımı belirlenmiş.
- [ ] Alış/iade konumu ve şube ihtiyaçları değerlendirilmiş.
- [ ] Ek hizmet domaini ve fiyatlandırma ilişkileri tanımlanmış.
- [ ] Prisma taslakları, indeksler, ilişkiler ve ER diyagramı hazırlanmış.
- [ ] Tenant izolasyonu ve veri bütünlüğü kuralları belgelenmiş.
- [ ] MVP ve sonraki geliştirmeler ayrılmış.
- [ ] F9'a devredilecek açık iş kuralları belirlenmiş.
- [ ] Doküman Eda'nın teknik incelemesine sunulmuş.
- [ ] `PROJECT_STATUS.md` ilgili görev bilgileriyle güncellenmiş.

## 7. Kapsam dışı

- Gerçek Prisma schema değişiklikleri ve migration
- Çalışan Customer veya Reservation API'leri
- Customer CRUD implementasyonu
- Rezervasyon oluşturma veya takip kodu implementasyonu
- Public web sitesi veya mobil uygulama
- Yönetim paneli ekranları
- Authentication sisteminin değiştirilmesi
- E-posta worker geliştirmesi
- Ödeme altyapısı

## 8. Bağımlılıklar

- C1–C10 Tenant authentication ve isolation mimarisi
- F1–F6 Vehicle domain ve API altyapısı
- Güncel `schema.prisma`
- `docs/architecture/tenant-authentication.md`
- `docs/architecture/vehicle-management.md`
- `docs/api/vehicle-api-contract.md` veya projedeki güncel karşılığı

F7 ve Eda'nın G5–G9 çalışmaları incelenebilir ancak kodlarına müdahale edilmeyecektir.

## 9. PR / Local Setup / Team Actions

- Bu görev ayrı dokümantasyon branch'inde ve ayrı PR ile tamamlanacaktır.
- PR'da mimari karar özeti, açık sorular ve F9 bağımlılıkları belirtilecektir.
- Kod değişikliği, migration, yeni bağımlılık veya `.env` değişikliği beklenmemektedir.
- Mimari taslakların mevcut kodla uyumluluğu kontrol edilecektir.
- `ISSUE_HISTORY.md` içindeki kapsam değişikliğinin geçmişi korunacaktır.
- Güncel `main` üzerinden ekip durumları doğrulanacak ve Eda'nın kayıtları korunacaktır.

**Teslimat:** İncelenebilir ve sonraki geliştirmelere referans olabilecek `customer-reservation-domain.md` dokümanı.

**Not:** F8 yalnızca mimari tasarım ve dokümantasyon görevidir; çalışan sistem geliştirilmez.

</details>

<details>
<summary>#62 — F9 — docs(architecture): Rezervasyon Yaşam Döngüsü, Güvenli Takip ve API Sözleşmeleri</summary>

> 28.11.2026 — Önceki Customer modeli ve API implementasyonu görevi, yeni rezervasyon mimarisi kararı doğrultusunda mimari tasarım ve dokümantasyon görevine dönüştürülmüştür.

# F9 — docs(architecture): Rezervasyon Yaşam Döngüsü, Güvenli Takip ve API Sözleşmeleri

**Sorumlu:** Mustafa
**Reviewer:** Eda
**Branch:** `docs/f9-reservation-lifecycle-api`
**Bağımlılık:** F8
**Tür:** Backend Architecture / API Design / Security / Documentation

## Amaç

F8'de belirlenen Customer ve Reservation domain mimarisi üzerine RentACar'ın kalıcı Hesapsız Rezervasyon ve Takip Sistemi için uygulanabilir iş akışlarını, rezervasyon yaşam döngüsünü, araç müsaitliği kurallarını, takip kodu güvenliğini, API sözleşmelerini ve bildirim mimarisini tasarlamak.

Bu görev rezervasyon altyapısının implementasyonu değildir. Hedef; sonraki görevlerde backend, frontend ve mobil uygulamanın aynı sözleşmeye göre geliştirilmesini sağlayacak, güvenliği ve veri bütünlüğünü önceden ele alan ayrıntılı bir teknik doküman hazırlamaktır.

## 1. Mevcut altyapı ve ürün kuralları

- RentACar multi-tenant ve white-label SaaS platformudur.
- Platform Admin ve Tenant Admin authentication altyapısı korunacaktır.
- Customer bir authentication hesabı değildir.
- Müşteriler hesap oluşturmadan rezervasyon yapacak ve takip koduyla sorgulayacaktır.
- Müşteri için JWT, session, SMS, OTP veya e-posta doğrulaması tasarlanmayacaktır.
- Rezervasyon oluşturulduğunda başlangıç durumu `PENDING` olacaktır.
- Tenant Admin rezervasyonu onaylayabilecek (`CONFIRMED`) veya reddedebilecektir (`REJECTED`).
- Yeni rezervasyon Tenant Admin panelinde görünecek ve kayıtlı tenant yönetici adresine e-posta bildirimi gönderilmesi planlanacaktır.
- Takip kodu tek başına sınırlı public rezervasyon sorgulaması için yeterli olacaktır.
- İlk sürümde online ödeme entegrasyonu bu görev kapsamında uygulanmayacaktır.

F8'de onaylanan modeller, ilişki kuralları ve veri minimizasyonu kararları esas alınacaktır.

## 2. Yapılacaklar

### 2.1 Reservation lifecycle

Aşağıdaki temel durumların anlamlarını tanımla:

- `PENDING`: Oluşturulmuş, tenant onayı bekleyen rezervasyon talebi.
- `CONFIRMED`: Tenant tarafından kabul edilmiş rezervasyon.
- `REJECTED`: Tenant tarafından reddedilmiş rezervasyon.

Şu konuları tasarla:

- Durum geçiş diyagramı ve izin verilen geçişler
- Onay/red işlemlerinin yetki sınırları
- Geçersiz durum geçişlerine verilecek yanıtlar
- Tekrarlanan onay veya red isteklerinin davranışı
- Aynı anda gelen onay/red talepleri
- Uzun süre bekleyen rezervasyonların yaşam döngüsü
- İptal ve süre aşımı durumlarına MVP'de ihtiyaç olup olmadığı
- Durum değişikliklerinin audit/history kayıtları
- Kararı veren Tenant Admin ve karar zamanının kaydı
- Rezervasyonun gerçek kiralama, araç teslimi ve iade işlemlerinden ayrılması

Gereksiz durumlar ekleme. Ek status değerleri ancak gerçek iş ihtiyacıyla gerekçelendirilmelidir.

### 2.2 Vehicle availability ve concurrency

- `FleetStatus.ACTIVE` ile tarih aralığına bağlı müsaitliğin farklı kavramlar olduğunu koru.
- Başlangıç ve bitiş tarih/saatlerinin doğrulama kurallarını belirle.
- Tarih aralıklarının çakışma mantığını açıkla.
- UTC saklama, yerel saat ve zaman dilimi dönüşümlerini değerlendir.
- `PENDING` rezervasyonların araç müsaitliğine etkisini tartış.
- `CONFIRMED` rezervasyonlarla çakışan yeni onayların engellenmesi için uygulanabilir strateji seç.
- Eş zamanlı tenant onaylarında yarış durumlarını incele.
- PostgreSQL transaction, locking, isolation seviyeleri ve uygun veritabanı constraint seçeneklerini karşılaştır.
- Yalnız uygulama seviyesindeki availability kontrolünün neden yeterli olmayabileceğini açıkla.
- Rezervasyon oluşturma ile kesin onay anındaki müsaitlik kontrolünü birbirinden ayır.
- İleride kiralama, bakım veya bloke dönemlerinin müsaitliğe nasıl dahil olacağını sınırlarıyla açıkla.

Başlangıç önerisi: `PENDING` talepler aracın kesin rezervasyonunu oluşturmaz; ancak `CONFIRMED` durumuna geçmeden önce transaction güvenliğiyle çakışma denetimi yapılır. Bu öneri ekip incelemesinde karara bağlanmalıdır.

### 2.3 Secure reservation tracking

Müşterinin hesabı veya ek doğrulaması olmadan takip koduyla rezervasyon durumunu sorgulayabileceği güvenli bir mimari tasarla.

Değerlendirilecek konular:

- Kriptografik olarak güvenli rastgele takip kodu üretimi
- Kod uzunluğu, entropy ve tahmin edilebilirlik
- Benzersizlik kontrolü ve collision davranışı
- Kodların hash veya diğer güvenli yöntemlerle saklanması
- Tenant Admin tarafından kodla arama yapılabilmesi
- Public sorgulama endpoint tasarımı
- Rate limiting ve otomatik kod deneme saldırılarına karşı önlemler
- Takip kodunun URL, log, analytics, referrer ve hata raporlarına sızmasının önlenmesi
- Takip kodlarının gerektiğinde yenilenmesi veya iptali
- Kodunu kaybeden müşteri için destek süreci
- Kodun kullanılabilirlik süresi ve kişisel veri saklama sınırları
- Geçersiz kodlarda güvenli hata davranışı

**Kesin kural:** Takip kodu bir müşteri hesabı, JWT veya authentication session değildir.

Takip kodunu bilen kişi yalnızca ilgili rezervasyonun public takip görünümüne erişebilir.

Public görünümde öncelikli bilgiler:

- Rezervasyon durumu
- Araç için sınırlı tanımlayıcı bilgiler
- Alış/iade tarih ve saatleri
- Rezervasyonun onaylanıp onaylanmadığı
- Ürün kararı doğrultusunda gösterilmesine izin verilen diğer sınırlı bilgiler

Telefon numarası, doğum tarihi, kimlik/ehliyet bilgileri ve diğer gereksiz kişisel veriler public response içinde gösterilmemelidir.

### 2.4 Tenant resolution ve authorization

- Public web veya mobil uygulamanın doğru tenant'ı nasıl belirleyeceğini tasarla.
- Mevcut Tenant slug yapısını değerlendir.
- Subdomain ve gelecekte custom domain kullanımını incele.
- Public tenant seçimini Tenant Admin authentication mekanizmasından ayrı ele al.
- Public rezervasyon sırasında tenant, vehicle, location ve extra service ilişkilerinin doğrulanmasını tasarla.
- Client tarafından gönderilen `tenantId`, fiyat ve availability verilerinin doğrudan güvenilir olmadığını belgele.
- Sunucu tarafında tenant çözümleme ve fiyat hesaplama sınırlarını tanımla.
- Tenant Admin işlemlerinde mevcut `TenantJwtAuthGuard` ve güvenilir tenant context yaklaşımını koru.
- Cross-tenant rezervasyon görüntüleme ve onaylama girişimlerini engelleyecek sorgu kurallarını belirle.
- Public tracking kodlarının başka bir tenant bağlamında sızdırılma riskini değerlendir.

### 2.5 API contract design

Gelecekte uygulanacak public ve Tenant Admin API sözleşmelerini tasarla.

**Public API tasarım konuları:**

- Tenant'a ait halka açık bilgileri görüntüleme
- Alış/iade konumlarını listeleme
- Tarih aralığına göre uygun araç sorgulama
- Araç ve ek hizmet detaylarını görüntüleme
- Sunucu tarafında rezervasyon fiyatı hesaplama
- Hesapsız rezervasyon oluşturma
- Takip koduyla rezervasyon durumunu sorgulama

**Tenant Admin API tasarım konuları:**

- Tenant rezervasyonlarını listeleme
- Rezervasyon detayını görüntüleme
- Takip koduyla tenant içi rezervasyon arama
- Rezervasyonu onaylama
- Rezervasyonu reddetme
- Yetkili müşteri kayıtlarını görüntüleme
- Gelecekte ek hizmet kataloğunu yönetme

Her önerilen API için:

- HTTP method ve route
- İş amacı
- Authentication / authorization koşulları
- Tenant resolution yöntemi
- Request DTO ve validation
- Response örnekleri
- Hata kodları ve güvenli hata mesajları
- Public ve Tenant Admin veri görünürlüğü
- Pagination, filtering ve sorting ihtiyaçları
- Idempotency yaklaşımı
- Transaction ve concurrency davranışı
- Fiyat, tarih ve tenant ownership doğrulamaları
- Güvenlik test senaryoları

belgelenmelidir.

OpenAPI/Swagger ile ileride uygulanabilecek tutarlı bir sözleşme hedeflenmelidir. Bu aşamada controller, DTO veya çalışan endpoint oluşturulmayacaktır.

### 2.6 Reservation notification architecture

Rezervasyon oluşturulduğunda ilgili tenant yöneticisinin panelinde kayıt görüntülenebilmesi ve kayıtlı e-posta adresine bildirim gönderilmesi için mimari tasarla.

- Mevcut `InvitationDelivery` ve transactional outbox yaklaşımını incele.
- Hesap aktivasyon bildirimleriyle rezervasyon bildirimlerinin farkını değerlendir.
- Ortak delivery altyapısının nasıl genişletilebileceğini karşılaştır.
- Rezervasyon kaydı ve kalıcı bildirim gönderme niyetinin tutarlılığını tasarla.
- E-posta gönderimini veritabanı transaction'ı dışında tut.
- Bildirim gönderimi başarısız olsa bile rezervasyon kaydını koru.
- Retry, duplicate delivery ve idempotency davranışını tasarla.
- Yönetici adresi değiştiğinde alıcının belirlenme politikasını değerlendir.
- Bildirim e-postalarına eklenecek kişisel verileri sınırlandır.
- Panel bildirimlerinin veri kaynağı ve okunma durumu ihtiyacını değerlendir.

Mevcut çalışan davet/aktivasyon e-posta sistemi değiştirilmemelidir.

### 2.7 Security ve testing strategy

Gelecekteki implementasyon görevleri için güvenlik ve regresyon test planı hazırla.

Özellikle:

- Cross-tenant reservation access
- Public endpoint abuse
- Tahmin edilemeyen takip kodları
- Geçersiz ve sızdırılmış takip kodları
- Rate limiting ve brute-force
- Sahte tenant/vehicle/location/extra service değerleri
- Manipüle edilmiş fiyat ve tutarlar
- Çakışan rezervasyon tarihleri
- Concurrent confirmation
- Duplicate reservation submission
- Tekrarlanan onay ve red işlemleri
- Geçersiz state transition
- E-posta gönderimi ve retry hataları
- Tarihsel müşteri ve fiyat snapshot'larının korunması
- Public response kişisel veri sızıntıları
- Mevcut Tenant authentication ve Vehicle CRUD regresyonları

Test senaryolarının amacı, gerekli veriler ve beklenen davranışları belgelenmelidir. Bu görevde çalışan entegrasyon veya E2E testleri yazılması beklenmemektedir.

## 3. Mimari dokümantasyon

Oluşturulacak dosya:

`docs/architecture/reservation-lifecycle-and-api.md`

Doküman en az şu bölümleri içermelidir:

1. Amaç ve kapsam
2. F8 domain tasarımıyla ilişki
3. Rezervasyon yaşam döngüsü ve durum geçiş diyagramı
4. Araç müsaitliği ve zaman aralığı kuralları
5. Concurrency ve transaction stratejisi
6. Takip kodu güvenlik modeli
7. Tenant resolution ve yetkilendirme
8. Public API sözleşmeleri
9. Tenant Admin API sözleşmeleri
10. Bildirim ve transactional outbox yaklaşımı
11. Güvenlik ve regresyon test planı
12. Açık mimari kararlar, alternatifler ve riskler
13. Sonraki implementasyon görevleri ve bağımlılıklar

## 4. Öğrenme hedefleri

- API-first design ve OpenAPI
- State machine ve domain lifecycle
- PostgreSQL transaction ve isolation
- Race condition ve concurrency control
- Kriptografik token güvenliği
- Capability-based erişim sınırları
- Multi-tenant authorization
- Idempotency ve retry mekanizmaları
- Transactional outbox ve eventual consistency
- Güvenlik test stratejisi

Her önemli teknik karar için alternatifler karşılaştırılmalı, seçilen yöntemin gerekçesi açıklanmalıdır.

## 5. Kabul kriterleri

- [ ] Rezervasyon durumları ve izin verilen geçişler tanımlanmış.
- [ ] PENDING rezervasyonların araç müsaitliğine etkisi karara bağlanmış.
- [ ] Tarih/saat çakışma ve availability yaklaşımı açıklanmış.
- [ ] Eş zamanlı onayların veri bütünlüğünü bozmasını önleyen uygulanabilir transaction/concurrency stratejisi seçilmiş.
- [ ] Takip kodunun üretimi, güvenliği, saklanması ve sorgulanması tasarlanmış.
- [ ] SMS, OTP veya müşteri hesabı olmadan sorgulama yaklaşımı korunmuş.
- [ ] Public ve Tenant Admin veri görünürlüğü ayrılmış.
- [ ] Public tracking response kişisel veri sınırları belirlenmiş.
- [ ] Tenant resolution ve cross-tenant güvenlik kuralları tanımlanmış.
- [ ] Public rezervasyon API sözleşmeleri hazırlanmış.
- [ ] Tenant Admin rezervasyon yönetimi API sözleşmeleri hazırlanmış.
- [ ] DTO, validation, response, hata ve idempotency kuralları açıklanmış.
- [ ] E-posta bildirimleri için güvenilir delivery yaklaşımı tasarlanmış.
- [ ] Güvenlik ve regresyon test planı hazırlanmış.
- [ ] F8 dokümanıyla çelişen karar bulunmadığı doğrulanmış.
- [ ] Gelecekteki geliştirme görevlerine aktarılacak işler tanımlanmış.
- [ ] Mimari Eda'nın incelemesine sunulmuş.
- [ ] `PROJECT_STATUS.md` ilgili görev bilgileriyle güncellenmiş.

## 6. Kapsam dışı

- Gerçek Prisma schema veya migration değişiklikleri
- Çalışan Customer / Reservation modülleri
- Public veya Tenant Admin API implementasyonu
- Gerçek takip kodu üretim sistemi
- Gerçek e-posta worker veya bildirim sistemi
- Frontend/mobil rezervasyon ekranları
- Online ödeme entegrasyonu
- Mevcut authentication altyapısının yeniden yazılması
- Gerçek E2E veya entegrasyon testleri

## 7. Bağımlılıklar

- Tamamlanmış ve incelenmiş F8 mimari dokümanı
- C serisi Tenant authentication ve isolation altyapısı
- F1–F6 Vehicle API ve veri modeli
- Mevcut Prisma schema ve güncel API sözleşmeleri
- Transactional outbox ve tenant davet mimarisi

Eda'nın aktif G serisi geliştirmelerine müdahale edilmeyecektir.

## 8. PR / Local Setup / Team Actions

- F9 için F8'den ayrı branch ve PR kullanılacaktır.
- PR açıklamasına state machine, API sözleşmesi, concurrency, güvenlik ve bildirim kararlarının özeti eklenecektir.
- Kod, migration, dependency veya `.env` değişikliği beklenmemektedir.
- Güncel `main`, F8 dokümanı ve mevcut authentication/Vehicle davranışıyla uyumluluk doğrulanacaktır.
- Eda'nın ekip durumu ve çalışmaları korunacaktır.
- Dokümandaki öneriler uygulanmış özellikler olarak sunulmayacaktır.
- Gelecekteki uygulama işleri bu PR içinde gerçekleştirilmeden, ayrı görev bağımlılıkları olarak belgelenecektir.

**Teslimat:** Sonraki backend ve frontend geliştirmelerinde temel alınabilecek `reservation-lifecycle-and-api.md` mimari ve API sözleşmesi dokümanı.

**Not:** F9 yalnızca mimari tasarım ve dokümantasyon görevidir; çalışan rezervasyon sistemi bu görev kapsamında geliştirilmez.

</details>

<details>
<summary>#63 — G1 — feature(web): Vehicle Demo Sayfalarını Tenant Admin Paneline Entegre Etme ve Tasarımı Yenileme</summary>

```text
G1 — feature(web): Vehicle Demo Sayfalarını Tenant Admin Paneline Entegre Etme ve Tasarımı Yenileme
 #63

G1 — feature(web): Vehicle Demo Sayfalarını Tenant Admin Paneline Entegre Etme ve Tasarımı Yenileme
Sorumlu: Eda
Branch: feature/g1-tenant-vehicle-navigation-design
Bağımlılık: Team Sync
Tür: Frontend / UI / Integration

Mevcut problem
D2–D4 kapsamında araç listeleme ve ekleme arayüzleri oluşturuldu. Ancak bu ekranlar şu anda bağımsız demo rotalarından görüntüleniyor:

/vehicle-demo
/vehicle-create-demo
Bu sayfalar gerçek Tenant Admin navigasyonuna bağlı değil. Kullanıcı sidebar üzerinden araç sayfalarına ulaşamıyor. Ayrıca mevcut demo tasarımının yeni Tenant Admin tasarım diliyle uyumu yetersiz.

Amaç
Mevcut Vehicle bileşenlerini koruyarak araç yönetimini Tenant Admin'in doğal bir parçasına dönüştürmek. Görünümü daha sade, profesyonel ve ürünün genel kimliğiyle tutarlı hâle getirmek.

Yapılacaklar

Mevcut Tenant Admin layout, sidebar, header ve responsive davranışını incele.

VehicleList, VehicleCard, VehicleForm ve ortak bileşenleri değerlendir.

Tenant sidebar'a 'Araçlar' menüsü ekle.

Menüden /tenant/vehicles sayfasına geçiş sağla.

Araç ekleme için /tenant/vehicles/new rotasını oluştur.

Liste ve ekleme sayfalarını mevcut Tenant layout içinde göster.

Ayrı ve kopya sidebar/header oluşturma.

Mevcut demo görsellerini Tenant Admin'in #13241f ana rengiyle uyumlu hâle getir.

Gereksiz büyük kartlar, yoğun gölgeler, aşırı border-radius ve dekoratif alanları sadeleştir.

Başlık, açıklama, birincil eylem ve filtrelerin görsel hiyerarşisini iyileştir.

Masaüstünde düzgün tablo/liste, mobilde okunabilir yerleşim sağla.

Aktif menü durumunu ve sayfalar arası navigasyonu düzenle.

Demo rotalarını ana kullanıcı akışından çıkar; test bağımlılıklarını kontrol ederek kaldırma veya yalnız geliştirme amaçlı koruma kararı ver.

Gerçek API hazır değilse mock veri kullanımını açıkça göster; kaydedildi izlenimi verme.
Tasarım beklentisi
Hedef, gösterişli bir AI dashboard şablonu değil; gerçek bir araç kiralama şirketinin her gün kullanabileceği, sade ve kaliteli bir yönetim ekranıdır.

Mevcut ortak tasarım token'ları, spacing, tipografi ve navigasyon davranışları kullanılmalı. Yeni global tasarım sistemi oluşturulmamalı.

Öğrenme hedefleri
Next.js nested layout, App Router routing, component reuse, responsive UI, visual hierarchy, erişilebilir navigasyon ve design consistency.

Kabul kriterleri

Tenant sidebar üzerinden araç listesine gidilebiliyor.

Araç listesinden araç ekleme ekranına geçilebiliyor.

Sayfalar yeni Tenant Admin layout'unu kullanıyor.

Bağımsız demo görünümüne göre tasarım belirgin biçimde iyileştirilmiş.

375px mobil genişlikte yatay taşma yok.

Mevcut Vehicle bileşenleri gereksiz yere yeniden yazılmamış.

Frontend test, TypeScript, lint ve build başarılı.

Değişikliklerin ekran görüntüleri PR'a eklenmiş.
Kapsam dışı
Gerçek Vehicle API bağlantısı, Prisma ve backend authentication değişiklikleri.

PR / Local Setup / Team Actions
Yeni route'lar, kaldırılan demo rotaları ve varsa dependency/env değişiklikleri açıklanmalı.
```

</details>

<details>
<summary>#64 — G2 — refactor(web): Vehicle Create/Edit Form UX ve Tenant Tasarım Uyumu</summary>

```text
G2 — refactor(web): Vehicle Create/Edit Form UX ve Tenant Tasarım Uyumu
 #64


G2 — refactor(web): Vehicle Create/Edit Form UX ve Tenant Tasarım Uyumu
Sorumlu: Eda
Branch: refactor/g2-vehicle-form-ux
Bağımlılıklar: G1, F1
Tür: Frontend / UX

Amaç
D3'te oluşturulmuş araç ekleme/düzenleme formunu yeniden kullanarak Tenant Admin paneline uygun, temiz ve günlük kullanımda pratik bir form deneyimi sağlamak.

Yapılacaklar

Mevcut VehicleForm.tsx ve validation kodunu incele.

Form alanlarını anlaşılır gruplara ayır: Araç Kimliği, Teknik Bilgiler, Operasyon, Fiyatlandırma.

Gerekli alanları açıkça işaretle.

Formu mobilde tek sütun, geniş ekranlarda uygun iki sütun yerleşimiyle düzenle.

Form başlıkları, yardımcı açıklamalar ve hata mesajlarını sadeleştir.

Metin, sayı, seçim ve decimal alanlarının kullanıcı deneyimini iyileştir.

Klavye kullanımı, label ilişkileri ve focus durumlarını kontrol et.

Kaydet/İptal eylemlerini tutarlı konuma yerleştir.

Kaydedilmemiş değişikliklerde yanlışlıkla çıkışı önleyen davranışı değerlendir.

Alan doğrulamalarını F1 Vehicle sözleşmesiyle uyumlu tut.

Mevcut form state ve reusable component yapısını koru.

VehicleForm.test.tsx testlerini güncelle.
Tasarım beklentisi
Minimal ama boş görünmeyen bir form hazırlanmalı. Her alanı ayrı karta koyan, fazla büyük boşluklar kullanan veya dekoratif öğelerle dikkati dağıtan bir tasarımdan kaçınılmalı.

Öğrenme hedefleri
Controlled forms, reusable components, form validation, accessibility, responsive layout ve React state yönetimi.

Kabul kriterleri

Form Tenant Admin tasarımıyla tutarlı.

Gerekli/opsiyonel alanlar açık.

Hatalı veriler anlaşılır şekilde gösteriliyor.

Mobil kullanım rahat.

Create ve edit senaryolarında aynı form bileşenleri yeniden kullanılabiliyor.

Bileşen testleri ve frontend kalite kontrolleri başarılı.
Kapsam dışı
Gerçek create/update API bağlantısı; bu G5 kapsamında yapılacak.

PR / Local Setup / Team Actions
Yeni bağımlılık eklenirse gerekçesi açıklanmalı. Route ve backend beklentileri PR'da belirtilmeli.
```

</details>

<details>
<summary>#65 — G3 — feature(web): Vehicle Listing Gerçek API Entegrasyonu</summary>

```text
G3 — feature(web): Vehicle Listing Gerçek API Entegrasyonu
 #65

G3 — feature(web): Vehicle Listing Gerçek API Entegrasyonu
Sorumlu: Eda
Branch: feature/g3-vehicle-list-api-integration
Bağımlılıklar: G1, F3
Tür: Frontend / API Integration

Amaç
D2'de geliştirilen araç listeleme ekranını mock veriden çıkararak gerçek Tenant Vehicle API üzerinden çalışan bir arayüze dönüştürmek.

Yapılacaklar

Mevcut VehicleList bileşenlerini ve mock fixture'ları incele.

F3'te tamamlanan GET /tenant/vehicles sözleşmesini kullan.

Mevcut Tenant authentication ve cookie tabanlı oturum yapısına uygun istek gönder.

Araçları API response'undan al.

API ile UI tipleri arasındaki eşleştirmeleri netleştir.

Arama, kategori ve filo durumu filtrelerini sunucu sorgularına bağla.

Pagination ve sıralama davranışını gerçek API'ye bağla.

İlk yüklenme, boş liste, sonuç bulunamadı ve hata durumlarını ayrı ele al.

Geçersiz oturum için mevcut auth yönlendirme davranışını kullan.

Sadece mock modunda çalışan başarı mesajlarını gerçek kullanıcı akışından kaldır.

API client kodunu bileşenlerden uygun ölçüde ayır.

Liste bileşeni ve API hata durumları için testler ekle.
Öğrenme hedefleri
Fetch/API client, async UI, React state, URL query parametreleri, loading/error handling ve frontend-backend contract.

Kabul kriterleri

Liste gerçek PostgreSQL araç verilerini gösteriyor.

Filtreleme ve sayfalama çalışıyor.

Sayfa yenilemeden sonra gerçek veriler korunuyor.

401/403 durumlarında doğru oturum davranışı uygulanıyor.

Mock veriler gerçek liste akışında kullanılmıyor.

Mobil arayüz düzgün.

Test, lint, TypeScript ve build başarılı.
Kapsam dışı
Araç oluşturma, güncelleme ve status değiştirme.

PR / Local Setup / Team Actions
Backend endpoint bağımlılığı, gerekli servis restart'ları ve manuel test senaryoları açıklanmalı.
```

</details>

<details>
<summary>#66 — G4 — feature(api): Tenant Vehicle Aktif/Pasif Durum Yönetimi</summary>

```text
G4 — feature(api): Tenant Vehicle Aktif/Pasif Durum Yönetimi
 #66

G4 — feature(api): Tenant Vehicle Aktif/Pasif Durum Yönetimi
Sorumlu: Eda
Branch: feature/g4-vehicle-fleet-status-api
Bağımlılık: F3
Tür: Backend / NestJS

Amaç
Eda'nın mevcut NestJS ve Tenant güvenlik mimarisi üzerinde backend geliştirme pratiği kazanması. Şirket yöneticisinin bir aracı filoda aktif veya pasif hâle getirmesini sağlayan küçük, sınırları belirli bir endpoint geliştirmek.

Endpoint
PATCH /tenant/vehicles/:id/status

Yapılacaklar

F3'teki mevcut Vehicle controller/service yapısını incele.

Yeni modül oluşturmadan ilgili endpoint'i mevcut Vehicle modülüne ekle.

F1/D1 ile uyumlu UpdateVehicleStatus DTO oluştur.

Yalnızca ACTIVE ve INACTIVE değerlerini kabul et.

tenantId değerini doğrulanmış sunucu oturumundan al.

Araç ID'sini Tenant sahipliği ile birlikte doğrula.

Farklı Tenant'a ait veya bulunmayan araç için 404 döndür.

Aynı durumun tekrar istenmesinde idempotent davranış uygula.

ACTIVE → INACTIVE için deactivatedAt alanını yönet.

INACTIVE → ACTIVE dönüşünü doğru işle.

Güncel status response'unu döndür.

Başarılı, geçersiz ve yetkisiz senaryolar için unit test yaz.

Swagger açıklamasını güncelle.
Önemli iş kuralı
ACTIVE, aracın filoda aktif olduğu anlamına gelir. Belirli tarihler arasında rezervasyona uygun olduğu anlamına gelmez.

Bu endpoint rezervasyon, kiralama veya bakım durumlarını yönetmez. Fiziksel araç silme işlemi de bu görevin kapsamında değildir.

Öğrenme hedefleri
NestJS PATCH endpoint, DTO validation, Prisma update, idempotency, HTTP 404/400 ve Tenant authorization.

Kabul kriterleri

ACTIVE/INACTIVE geçişleri çalışıyor.

Farklı Tenant'ın aracı değiştirilemiyor.

Geçersiz status değerleri reddediliyor.

Tekrarlanan istekler tutarlı davranıyor.

deactivatedAt doğru güncelleniyor.

Unit test, backend lint, TypeScript ve build başarılı.

Mustafa endpoint'i güvenlik açısından gözden geçirmiş.
Kapsam dışı
Araç DELETE, rezervasyon yönetimi ve frontend status butonları.

PR / Local Setup / Team Actions
Endpoint, DTO, testler ve backend yeniden başlatma gereksinimi açıklanmalı. Migration gerekmiyorsa açıkça belirtilmeli.
```

</details>

<details>
<summary>#67 — G5 — feature(web): Vehicle Create/Edit Gerçek API Entegrasyonu</summary>

```text
G5 — feature(web): Vehicle Create/Edit Gerçek API Entegrasyonu
 #67

G5 — feature(web): Vehicle Create/Edit Gerçek API Entegrasyonu
Sorumlu: Eda
Branch: feature/g5-vehicle-form-api-integration
Bağımlılıklar: G2, F4, F5
Tür: Frontend / Integration

Amaç
Araç ekleme ve düzenleme formlarının gerçek backend API'lerini kullanmasını sağlamak.

Sayfalar
/tenant/vehicles/new
/tenant/vehicles/[id]/edit
Yapılacaklar

G2 form bileşenlerini yeniden kullan.

POST /tenant/vehicles endpoint'ine create isteği gönder.

PATCH /tenant/vehicles/:id endpoint'ine update isteği gönder.

HTML input string değerlerini sözleşmeye uygun sayısal/decimal formatlara dönüştür.

Boş opsiyonel alanların null/undefined dönüşümünü doğru uygula.

Form gönderilirken butonu loading/disabled hâline getir.

Alan bazlı validation ve duplicate plaka hatalarını kullanıcıya göster.

401/403/404/409 cevaplarını uygun biçimde ele al.

Başarılı kayıt sonrasında kullanıcıyı ilgili araç sayfasına yönlendir.

Düzenleme formunu API'den gelen mevcut araç verisiyle doldur.

Sayfayı yenileyince verilerin kalıcı olduğunu manuel test et.

API client ve form dönüştürme kodlarını test et.
Öğrenme hedefleri
Form-to-DTO mapping, request lifecycle, HTTP error handling, React controlled inputs ve gerçek API ile veri kalıcılığı.

Kabul kriterleri

Araç ekleme formu gerçek veritabanına kayıt yapıyor.

Araç düzenleme kayıtları güncelliyor.

Sayfa yenileme sonrasında bilgiler korunuyor.

Doğrulama ve çakışma hataları anlaşılır gösteriliyor.

Tenant Admin panelinden tüm akışa erişilebiliyor.

Test, lint, TypeScript ve build başarılı.
Kapsam dışı
Dosya/fotoğraf upload, rezervasyon veya araç silme.

PR / Local Setup / Team Actions
API endpoint gereksinimleri, yeni env/dependency varsa değişiklikler ve manuel test adımları belirtilmeli.
```

</details>

<details>
<summary>#68 — G6 — feature(web): Vehicle Aktif/Pasif Yönetimi ve Kullanıcı Geri Bildirimleri</summary>

```text
G6 — feature(web): Vehicle Aktif/Pasif Yönetimi ve Kullanıcı Geri Bildirimleri
 #68


G6 — feature(web): Vehicle Aktif/Pasif Yönetimi ve Kullanıcı Geri Bildirimleri
Sorumlu: Eda
Branch: feature/g6-vehicle-status-ui
Bağımlılıklar: G4, G3, F7
Tür: Frontend / UX / API Integration

Amaç
Tenant Admin'in araç detayında veya listesinde araçları güvenli ve anlaşılır bir işlemle aktif/pasif hâle getirebilmesini sağlamak.

Yapılacaklar

Mevcut VehicleStatusBadge bileşenini kullan.

Araç detayına uygun durum değiştirme eylemi ekle.

PATCH /tenant/vehicles/:id/status endpoint'ine bağlan.

Pasife alma işlemi için anlaşılır onay/uyarı davranışı sağla.

Kullanıcıya ACTIVE durumunun 'şu an kiralanabilir' anlamına gelmediğini yanlış şekilde hissettirme.

İşlem sırasında loading/disabled durumlarını uygula.

Başarılı değişiklikten sonra ekranı güncelle.

Hata durumlarında eski doğru veriyi koru ve kullanıcıyı bilgilendir.

Yetkisiz/expired oturum senaryosunu kontrol et.

Mobilde menü ve aksiyonların kullanımını test et.

Gerekli bileşen/API etkileşimi testlerini yaz.
Tasarım beklentisi
İşlem butonları sade ve anlaşılır olmalı. Renkler tek başına durumun anlamını taşımamalı; ACTIVE/INACTIVE metin etiketleri korunmalı.

Öğrenme hedefleri
UI mutations, optimistic/pessimistic updates, async state, confirm dialogs ve accessibility.

Kabul kriterleri

Araç aktif/pasif durumu değiştirilebiliyor.

Değişiklik gerçek API'ye kaydediliyor.

Ekran durumu API sonucuyla tutarlı.

Hata durumlarında kullanıcı yanıltılmıyor.

Mobil görünüm ve testler başarılı.
Kapsam dışı
Araç DELETE veya rezervasyon statüleri.

PR / Local Setup / Team Actions
Backend sürüm bağımlılığı ve manuel test senaryoları PR'da belirtilmeli
```

</details>

<details>
<summary>#69 — G7 — feature(api): Tenant Filo Özeti ve Araç Sayıları Endpoint'i</summary>

```text
G7 — feature(api): Tenant Filo Özeti ve Araç Sayıları Endpoint'i
 #69


G7 — feature(api): Tenant Filo Özeti ve Araç Sayıları Endpoint'i
Sorumlu: Eda
Branch: feature/g7-tenant-fleet-summary-api
Bağımlılıklar: F3, G4
Tür: Backend / API

Amaç
Tenant Dashboard'da kullanılabilecek temel filo sayılarını döndüren küçük ve güvenli bir backend endpoint'i geliştirmek.

Önerilen endpoint
GET /tenant/vehicles/summary

Route'un mevcut /:id endpoint'i ile çakışmayacak şekilde tanımlandığı doğrulanmalı.

Döndürülecek bilgiler
Toplam araç sayısı.
ACTIVE araç sayısı.
INACTIVE araç sayısı.
Yapılacaklar

Mevcut Vehicle service/controller yapısını incele.

Sadece doğrulanmış Tenant Admin'in kullanabileceği summary endpoint'i ekle.

Count sorgularında Tenant filtresini zorunlu kıl.

Toplam, aktif ve pasif sayılarını veritabanından hesapla.

Boş filoda sıfır değerlerini döndür.

Response için basit bir DTO/tip oluştur.

Başka Tenant araçlarının sayıya dahil olmadığını test et.

Platform Admin ve yetkisiz isteklerin reddedildiğini kontrol et.

Swagger açıklaması ve unit testler ekle.
Önemli kural
Rezervasyon sistemi henüz hazır olmadığı için 'Şu an kirada', 'Bugün müsait' veya 'Doluluk oranı' gibi veriler uydurulmayacak.

Öğrenme hedefleri
SQL aggregate/count, Prisma filtering, controller routing, authorization, API response design ve test yazımı.

Kabul kriterleri

Endpoint çalışıyor.

Sayılar doğru Tenant'a ait.

Boş filoda doğru response dönüyor.

Yetkisiz erişim engelleniyor.

Yanlış kira/müsaitlik metrikleri üretilmiyor.

Unit test, backend lint, TypeScript ve build başarılı.

Mustafa güvenlik ve sorgu davranışını gözden geçirmiş.
Kapsam dışı
Ciro, rezervasyon sayısı, doluluk oranı veya finansal raporlar.

PR / Local Setup / Team Actions
Yeni endpoint ve yeniden başlatma/test gereksinimleri belirtilmeli.
```

</details>

<details>
<summary>#70 — G8 — feature(web): Tenant Dashboard Araç/Filo Özetinin Gerçek Verilerle Gösterilmesi</summary>

```text
G8 — feature(web): Tenant Dashboard Araç/Filo Özetinin Gerçek Verilerle Gösterilmesi
 #70

G8 — feature(web): Tenant Dashboard Araç/Filo Özetinin Gerçek Verilerle Gösterilmesi
Sorumlu: Eda
Branch: feature/g8-tenant-fleet-dashboard
Bağımlılık: G7
Tür: Frontend / Dashboard

Amaç
Tenant Admin Dashboard'unu gerçek filo verileriyle daha işlevsel hâle getirmek.

Yapılacaklar

Mevcut Tenant Dashboard ve tasarım bileşenlerini incele.

G7 filo özeti endpoint'ini kullan.

Toplam, aktif ve pasif araç sayılarını göster.

Araç yönetimi sayfasına hızlı erişim ekle.

Boş filoda kullanıcıyı araç eklemeye yönlendiren faydalı bir empty state tasarla.

Loading ve API hata durumlarını ekle.

Tenant Admin ana sayfasının mevcut bilgi hiyerarşisini koru.

Aşırı büyük, gösteriş amaçlı dashboard kartları oluşturma.

Gerçek veri bulunmayan finansal veya rezervasyon metrikleri gösterme.

Mobil ekranlarda sade ve düzgün görünüm sağla.

Component/API testlerini güncelle.
Tasarım beklentisi
Koyu yeşil Tenant Admin kimliği korunacak. Dashboard kullanıcının günlük işlerine hızlı ulaşmasını sağlayacak, gereksiz görsel yoğunluk olmayacak.

Öğrenme hedefleri
Dashboard composition, API data visualization, empty state, responsive UI ve component testing.

Kabul kriterleri

Araç sayıları gerçek API'den geliyor.

Diğer Tenant kayıtları görüntülenmiyor.

Araç listesi/ekleme sayfalarına yönlendirme çalışıyor.

Yüklenme/hata/boş veri davranışları doğru.

Mevcut Tenant Admin tasarımı korunuyor.

Frontend kalite kontrolleri başarılı.
Kapsam dışı
Kiralama gelirleri, rezervasyon analitiği veya gelişmiş grafikler.

PR / Local Setup / Team Actions
Backend endpoint bağımlılığı ve test adımları açıklanmalı.
```

</details>

<details>
<summary>#71 — G9 — test(web): Tenant Vehicle UI, Responsive ve Entegrasyon Regresyon Testleri</summary>

```text
G9 — test(web): Tenant Vehicle UI, Responsive ve Entegrasyon Regresyon Testleri
 #71



G9 — test(web): Tenant Vehicle UI, Responsive ve Entegrasyon Regresyon Testleri
Sorumlu: Eda
Branch: test/g9-tenant-vehicle-ui-regression
Bağımlılıklar: G1–G8, F6, F7
Tür: Frontend / Testing / UX

Amaç
Araç yönetimi ekranlarının yalnızca geliştirme sırasında değil, sonraki değişikliklerden sonra da güvenilir şekilde çalışmasını sağlamak.

Yapılacaklar

Tenant Admin araç listeleme, detay, ekleme ve düzenleme ekranlarını kontrol et.

Sidebar ve mobil navigasyonda araç bağlantısını doğrula.

Araç ekleme formunun required, invalid ve başarı durumlarını test et.

Edit formunun ilk değerleri doğru yüklediğini test et.

Araç filtreleme ve pagination UI davranışını doğrula.

Aktif/pasif durum değiştirme ve hata senaryolarını test et.

API 400/401/403/404/409 yanıtlarının kullanıcıya uygun yansımasını kontrol et.

Loading, empty state ve network failure davranışlarını test et.

Klavye navigasyonu, label ve temel erişilebilirlik kurallarını incele.

Mobil 375px ve masaüstü görünümü manuel doğrula.

Mevcut Vehicle component testlerini güncelle; eksik kritik davranışlara test ekle.

Backend ile gerçek araç kaydetme ve sayfa yenileme senaryolarını manuel doğrula.

Demo sayfalarının yanlışlıkla ana kullanıcı akışına dönmediğini kontrol et.

Mevcut Tenant authentication ve Platform Admin akışlarında regresyon olmadığını doğrula.
Öğrenme hedefleri
React Testing Library/Vitest veya projede kullanılan test altyapısı, UI regression, accessibility, API mocking ve manuel QA planlama.

Kabul kriterleri

Kritik araç yönetimi kullanıcı akışları doğrulanmış.

Responsive görünümde önemli sorun kalmamış.

Form ve liste testleri başarılı.

Gerçek API entegrasyonu manuel doğrulanmış.

Frontend lint, TypeScript, test ve build başarılı.

Bulunan sorunlar giderilmiş veya ayrı issue olarak kaydedilmiş.

Test sonuçları PR açıklamasına eklenmiş.
Kapsam dışı
Yeni araç özellikleri, müşteri yönetimi veya rezervasyon geliştirmeleri.

PR / Local Setup / Team Actions
Test komutları, gerekli servisler, manuel QA sonuçları ve varsa kalan bilinen sorunlar açıklanmalı.
```

</details>
