# RentACar — Project Status

**Durum tarihi:** 26 Kasım 2026 · **Aktif seriler:** F / G
Bu dosya günlük ekip takibi içindir. Ürün ve teknoloji bilgileri [README](../../README.md), ayrıntılı görevler [ISSUE_HISTORY](ISSUE_HISTORY.md) dosyasındadır. Güncel `main`, GitHub Projects ve PR kayıtları doğrulama kaynağıdır.

## 1. Zorunlu ekip kuralları

- Her görev ayrı branch üzerinde geliştirilir; test ve kabul kriterleri doğrulanır. Her görev PR'ında bu dosyanın ilgili issue satırı ve ekip tablosu güncellenir. Yalnız kendi satırlarını değiştir; güncel `main` ile birleştirirken ekip arkadaşının kayıtlarını koru.
- PR açılmadan önce durumu `In Review` olarak yaz. PR numarası biliniyorsa kaydet. `Done` yalnız merge doğrulandıktan sonra geçerlidir; merge sonrasında GitHub Projects ve bu dosyayı küçük bir takip dokümantasyon değişikliğiyle eşitle. Bu yalnız durum eşitleyen değişiklikler tekrar bir takip PR'ı gerektirmez. PR açılmış olması merge edilmiş olduğu anlamına gelmez.
- Her yeni PR incelemesinden önce geliştirme sohbetine güncel `main` üzerindeki PROJECT_STATUS dosyasını, ilgili PR/issue bilgilerini ve gerekli kodu ver; ekip arkadaşının aktif görevini ve yeni merge'leri kontrol et. Aktif branch varsa değişiklikleri kaybetmeden `git fetch origin` ve `git show origin/main:docs/team/PROJECT_STATUS.md` ile güncel dosyayı okuyabilirsin. ChatGPT proje yüklemeleri otomatik eşitlenmez.
- PR açıklamasında test sonuçları, migration, dependency, env değişiklikleri ve diğer geliştiricinin yapacağı yerel işlemler belirtilir; gerekmiyorsa açıkça yazılır. Gizli değerler paylaşılmaz. E2E yalnız izole test veritabanında çalıştırılır.
- Yeni geliştirme sohbeti önce mevcut kodu inceler; küçük adımlarla ilerler, her kod satırını ve teknik kararın nedenini açıklar, geliştiricinin uygulamasına fırsat verir. Çalışan altyapıyı yeniden yazmaz.
- F/G serileri tamamlanınca yaklaşık 10'ar yeni issue planlanır: Mustafa yaklaşık %60 backend, Eda yaklaşık %60 frontend. Yeni görevlerin tam metinleri yalnız yeni görev grubu oluşturulduğunda ISSUE_HISTORY arşivine eklenir; her PR'da arşivi değiştirmek gerekmez. Yeni issue özetleri bu dosyaya da eklenir.

## 2. Kararlar ve takip notları

| Konu               | Not                                                                                | Durum |
| ------------------ | ---------------------------------------------------------------------------------- | ----- |
| Auth dokümanı      | Refresh token/session bilgilerini mevcut kodla uyumlu hale getir.                  | Açık  |
| Vehicle sözleşmesi | F6 sonrası gerçek DTO ve endpoint davranışlarıyla karşılaştır.                     | Açık  |
| VIN / internalCode | D1 önerisindeki unique kısıtları güncel şemada yok; karar doğrulanmalı.            | Açık  |
| F7 / G5            | Detay rotası hazır olmadan kullanıcıyı olmayan sayfaya yönlendirme.                | Açık  |
| Canlıya hazırlık   | CI/CD, rate limiting, CSRF, loglama, backup ve dependency audit değerlendirilecek. | Açık  |

## 3. Issue geçmişi

GitHub issue numarası sırasıyla; numara boşlukları PR veya aktarılmamış kayıtlardan kaynaklanabilir. `Done*` dolaylı olarak desteklenen ancak ayrı kartı doğrulanmamış durumdur. Eski 10 kartın birebir durumu kontrol edilmelidir. Arşivde 44 gönderilmiş issue vardır.

| Issue                                                  | Seri | Tek cümlelik amaç                                                      | Durum        |
| ------------------------------------------------------ | ---- | ---------------------------------------------------------------------- | ------------ |
| [#4](https://github.com/molmezses/RentACar/issues/4)   | A    | Bağımlılık güvenlik denetimi                                           | Doğrulanacak |
| [#5](https://github.com/molmezses/RentACar/issues/5)   | A    | Ekip katkı ve kurulum rehberi                                          | Doğrulanacak |
| [#6](https://github.com/molmezses/RentACar/issues/6)   | A    | OpenAPI sözleşmelerini doğrulama                                       | Doğrulanacak |
| [#9](https://github.com/molmezses/RentACar/issues/9)   | A    | Kalan geliştirme bağımlılığı riskleri                                  | Doğrulanacak |
| [#10](https://github.com/molmezses/RentACar/issues/10) | B    | Platform Admin dashboard layout                                        | Doğrulanacak |
| [#12](https://github.com/molmezses/RentACar/issues/12) | B    | Başvuru listeleme                                                      | Doğrulanacak |
| [#13](https://github.com/molmezses/RentACar/issues/13) | B    | Başvuru detay ekranı                                                   | Doğrulanacak |
| [#14](https://github.com/molmezses/RentACar/issues/14) | B    | Onay/red arayüzü                                                       | Doğrulanacak |
| [#15](https://github.com/molmezses/RentACar/issues/15) | B    | Oturum ve hata güvenliği                                               | Doğrulanacak |
| [#16](https://github.com/molmezses/RentACar/issues/16) | B    | Başvuru akışı testleri                                                 | Doğrulanacak |
| [#17](https://github.com/molmezses/RentACar/issues/17) | C1   | Tenant auth mimarisi                                                   | Done         |
| [#18](https://github.com/molmezses/RentACar/issues/18) | C2   | Tenant auth veri modeli ve outbox (issue başlığı mimari olarak kalmış) | Done         |
| [#22](https://github.com/molmezses/RentACar/issues/22) | C3   | Güvenli davet yaşam döngüsü                                            | Done         |
| [#23](https://github.com/molmezses/RentACar/issues/23) | C4   | E-posta gönderimi ve retry                                             | Done         |
| [#24](https://github.com/molmezses/RentACar/issues/24) | C5   | Hesap aktivasyonu                                                      | Done         |
| [#25](https://github.com/molmezses/RentACar/issues/25) | C6   | Tenant login ve session                                                | Done         |
| [#26](https://github.com/molmezses/RentACar/issues/26) | C7   | Tenant izolasyonu                                                      | Done         |
| [#27](https://github.com/molmezses/RentACar/issues/27) | C8   | Aktivasyon ve login UI                                                 | Done         |
| [#28](https://github.com/molmezses/RentACar/issues/28) | C9   | Korumalı dashboard                                                     | Done         |
| [#29](https://github.com/molmezses/RentACar/issues/29) | C10  | Onboarding ve izolasyon testleri                                       | Done         |
| [#35](https://github.com/molmezses/RentACar/issues/35) | D1   | Araç yönetimi araştırması ve mimari                                    | Done\*       |
| [#36](https://github.com/molmezses/RentACar/issues/36) | D4   | Araç tipleri, validasyon ve ortak UI                                   | Done\*       |
| [#37](https://github.com/molmezses/RentACar/issues/37) | D2   | Mock araç listeleme                                                    | Done\*       |
| [#38](https://github.com/molmezses/RentACar/issues/38) | D3   | Mock create/edit formu                                                 | Done\*       |
| [#46](https://github.com/molmezses/RentACar/issues/46) | E1   | Güvenli başvuru silme                                                  | Done\*       |
| [#53](https://github.com/molmezses/RentACar/issues/53) | Sync | C serisi ekip entegrasyonu                                             | Done         |
| [#54](https://github.com/molmezses/RentACar/issues/54) | F1   | Proje hafızası ve Vehicle API sözleşmesi                               | Done\*       |
| [#55](https://github.com/molmezses/RentACar/issues/55) | F2   | Vehicle Prisma modeli                                                  | Done         |
| [#56](https://github.com/molmezses/RentACar/issues/56) | F3   | Araç listeleme ve detay API                                            | Done         |
| [#57](https://github.com/molmezses/RentACar/issues/57) | F4   | Araç oluşturma API                                                     | Done         |
| [#58](https://github.com/molmezses/RentACar/issues/58) | F5   | Araç güncelleme API                                                    | Done         |
| [#59](https://github.com/molmezses/RentACar/issues/59) | F6   | Vehicle CRUD izolasyonu ve E2E                                         | Done         |
| [#60](https://github.com/molmezses/RentACar/issues/60) | F7   | Araç detay sayfası                                                     | Done         |
| [#61](https://github.com/molmezses/RentACar/issues/61) | F8   | Müşteri domain tasarımı                                                | In Progress  |
| [#62](https://github.com/molmezses/RentACar/issues/62) | F9   | Customer modeli ve temel API                                           | Backlog      |
| [#63](https://github.com/molmezses/RentACar/issues/63) | G1   | Araç sayfalarını Tenant paneline taşıma                                | Done         |
| [#64](https://github.com/molmezses/RentACar/issues/64) | G2   | Create/edit form UX                                                    | Done         |
| [#65](https://github.com/molmezses/RentACar/issues/65) | G3   | Gerçek listeleme API entegrasyonu                                      | Done         |
| [#66](https://github.com/molmezses/RentACar/issues/66) | G4   | Aktif/pasif API                                                        | Done         |
| [#67](https://github.com/molmezses/RentACar/issues/67) | G5   | Gerçek create/edit entegrasyonu                                        | In Progress  |
| [#68](https://github.com/molmezses/RentACar/issues/68) | G6   | Aktif/pasif UI                                                         | Backlog      |
| [#69](https://github.com/molmezses/RentACar/issues/69) | G7   | Filo özeti API                                                         | Backlog      |
| [#70](https://github.com/molmezses/RentACar/issues/70) | G8   | Dashboard filo özeti                                                   | Backlog      |
| [#71](https://github.com/molmezses/RentACar/issues/71) | G9   | UI ve entegrasyon regresyon testleri                                   | Backlog      |

## 4. Güncel ekip durumu

| Geliştirici | Aktif issue                                     | Durum       |
| ----------- | ----------------------------------------------- | ----------- |
| Mustaf      | F8 — #61 — Müşteri domain tasarımı              | In Progress |
| Eda         | G5 — #67 — Vehicle Create/Edit API entegrasyonu | In Progress |
