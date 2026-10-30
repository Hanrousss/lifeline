# Лицензии и уведомления

Проверка ссылок на общие условия: **29 октября 2026 года**. Этот файл описывает происхождение и известные условия; он не присваивает пакету новую общую лицензию и не меняет условия исходных материалов.

## Код, тексты, изображения оригинальной игры

Сохранённые [официальные условия](https://1in8b.life/en/terms/) находятся в `raw/1in8b.life/en/terms/index.html`. В разделе Copyright and new works оператор заявляет авторские права на код, текст и изображения; отдельного открытого LICENSE для исходного репозитория не найдено. Разрешение на стримы/видео сформулировано отдельно и не является общей лицензией на исходный код.

Пакет подготовлен для заявленного автором восстановления и переноса собственного проекта. Новая MIT/Apache/GPL-лицензия на игровой код здесь не выдана. Права на сторонние данные и шрифты описываются отдельно.

## Инструменты восстановления

В архиве нет `node_modules`, но сохранены уведомления зависимостей:

| Компонент | Версия | Лицензия / файл |
|---|---|---|
| Acorn | 8.15.0 | MIT, `licenses/acorn-LICENSE.txt` |
| Prettier | 3.6.2 | MIT, `licenses/prettier-LICENSE.txt` и `prettier-THIRD-PARTY-NOTICES.md` |
| Node.js | Проверено с 24.16.0; runtime не включён | [Официальная лицензия Node.js](https://github.com/nodejs/node/blob/main/LICENSE), отдельные сторонние компоненты имеют свои уведомления |

Эти зависимости добавлены для чтения/проверки опубликованных сборок. Из их лицензий не следует MIT-лицензия на игровой код.

## Шрифты

`fonts.css` и `album.css` объявляют Hahmlet, IBM Plex Sans KR, IBM Plex Mono, IBM Plex Sans Arabic и Nanum Pen Script. Сохранены 665 WOFF2-файлов. Для этих семейств добавлены полные официальные тексты **SIL Open Font License 1.1**, полученные из репозитория Google Fonts:

| Семейство | Текст лицензии и upstream |
|---|---|
| Hahmlet | `licenses/fonts/hahmlet-OFL.txt`, [upstream](https://github.com/google/fonts/blob/main/ofl/hahmlet/OFL.txt) |
| IBM Plex Sans KR | `licenses/fonts/ibmplexsanskr-OFL.txt`, [upstream](https://github.com/google/fonts/blob/main/ofl/ibmplexsanskr/OFL.txt) |
| IBM Plex Mono | `licenses/fonts/ibmplexmono-OFL.txt`, [upstream](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt) |
| IBM Plex Sans Arabic | `licenses/fonts/ibmplexsansarabic-OFL.txt`, [upstream](https://github.com/google/fonts/blob/main/ofl/ibmplexsansarabic/OFL.txt) |
| Nanum Pen Script | `licenses/fonts/nanumpenscript-OFL.txt`, [upstream](https://github.com/google/fonts/blob/main/ofl/nanumpenscript/OFL.txt) |

Уведомления upstream получены при упаковке; побайтное соответствие игровых subset-файлов конкретному upstream-коммиту не установлено. Сохранять copyright/reserved-font-name уведомления. Системные fallback-шрифты в CSS не включены как отдельные файлы.

## Статистика

| Источник | Подтверждённая общая информация | Граница подтверждения |
|---|---|---|
| UN Population Division | [Data Portal API](https://population.un.org/dataportalapi/index.html) указывает **CC BY 3.0 IGO**; [World Population Prospects 2024](https://population.un.org/wpp/) — заявленный игрой источник | Полная привязка конкретных значений игры к выгрузке/редакции не восстановлена |
| World Bank Open Data | [Условия данных](https://data.worldbank.org/summary-terms-of-use): **CC BY 4.0**, если metadata не устанавливают иное, с дополнительными условиями | Есть сторонние ряды с отдельными условиями; нельзя автоматически распространить общую лицензию на любой игровой параметр |
| WHO datasets на data.who.int | [Условия](https://data.who.int/about/data/terms-and-conditions): **CC BY 4.0**, если не указано иное, с дополнительными условиями | Это условия datasets на указанной площадке; они не заменяют условия публикаций WHO, MMEIG и материалов других правообладателей |
| Остальные поставщики из `DATA-SOURCES.md` и подписей фактов | Названия/источники сохранены | Конкретные лицензии использованных выпусков и рядов полностью не восстановлены; статус **не установлен** |

Атрибуции поставщиков и оригинальные подписи фактов сохранены. Обновления условий, опубликованные после копирования игры, сами по себе не доказывают, какие права действовали на её историческую выгрузку. В пакет не включены заново скачанные полные статистические базы поставщиков; включены данные из сохранённого клиента.
