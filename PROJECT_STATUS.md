# BuildNumbers — Persistent Project Status

> آخر تحديث موثّق: **2026-08-29**
>
> هذا الملف نقطة استئناف مختصرة. GitHub (`main`, PR #56, check runs) هو مصدر الحقيقة إذا تغيرت الحالة بعد هذا السجل.

## الهوية والحالة الآمنة

- المستودع: `Hosyss/buildmeasure`
- فرع الإنتاج: `main`
- `main` المؤكد قبل إغلاق بوابات الإصدار: `616894b34033bd26039321b49dfabe2b73bc8ca9`
- فرع مرشح الإصدار: `feat/buildnumbers-rebrand-safe`
- PR الإصدار: **#56 — Rebrand public site as BuildNumbers**
- الرابط العام المقصود: `https://buildnumbers.pages.dev`
- مشروع Pages الجديد: `buildnumbers`
- مشروع Pages القديم أثناء نافذة الانتقال: `buildmeasuretools`
- قاعدة D1 الحالية: `buildmeasure-production`
- اسم الـbinding الذي يعتمد عليه التطبيق: `DB`
- إصدار التطبيق في `package.json`: `0.6.0`

لا تدمج إلى `main`، ولا تعمل Production deployment أو D1 remote migration، قبل إعادة فحص أحدث head وتحقق بوابات الإصدار. لا تعتبر نجاح Preview أو Production أقدم دليلًا أن أحدث head منشور.

## نطاق المنتج الحالي

BuildNumbers يحتوي على **13 حاسبة عامة**:

1. Multi-Shape Concrete Project Calculator
2. Concrete Calculator
3. Circular Slab Concrete Calculator
4. Footing Concrete Calculator
5. Column Concrete Calculator
6. Concrete Wall Calculator
7. Post Hole Concrete Calculator
8. Paint Calculator
9. Tile Calculator
10. Brick Calculator
11. Gravel Calculator
12. Mulch Calculator
13. Drywall Calculator

يوجد كذلك **13 دليلًا مركزًا للحاسبات** بالإضافة إلى دليل `material-estimating-basics` العام.

المنتج يدعم Imperial/Metric، تقديرات الشراء والتكلفة الاختيارية، الحفظ المحلي، Project Mode، shopping lists، cost roll-ups، copy/print/Save as PDF، feedback، وfirst-party analytics محدود يحافظ على الخصوصية. أي قدرة غير موجودة في المصدر والاختبارات لا تُعتبر منفذة لمجرد أنها مذكورة في handoff أقدم.

## خط التطوير المدمج في PR #56

تم تجميع خط التطوير المتراكم داخل PR #56، بما في ذلك PRs #57 و#58 و#59 و#60 و#61 و#62 و#69. Hardening الخاص بـPR #59 دخل عبر merge حقيقي ذي parentين ويشمل bounded streaming JSON reads لمسارات analytics والfeedback.

أثناء فحص الإصدار الحي تم اكتشاف وإصلاح regressions حقيقية مع اختبارات دائمة:

- Mobile overflow في Column Calculator عند 360px.
- رفض analytics للـlocale `en-US@posix` بـHTTP 400 رغم أنه locale صالح صادر من بيئة متصفح فعلية.
- غياب shared analytics lifecycle عن Multi-Shape Concrete Project Calculator.

## الجودة الحالية

الـCI الرسمي يشغّل TypeScript + ESLint + unit/engine tests + build + rendered tests + production dependency audit.

آخر بوابة كاملة مؤكدة قبل تحديث هذا المستند كانت **Quality Gate #457** على functional head الذي أغلق regressions أعلاه:

- **223/223** unit/engine tests
- **68/68** rendered tests
- TypeScript: PASS
- ESLint: PASS
- production build: PASS
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**

أي commit لاحق، حتى لو كان documentation-only، يجب أن يمر بالبوابة مرة أخرى قبل اعتباره head نهائيًا.

## Cloudflare / D1 evidence

تم تنفيذ read-only smoke من GitHub-hosted runners بدل الاعتماد على نجاح deploy وحده.

في مرحلة مبكرة كان Preview قديم يعيد `/api/health` = 503 لأن D1 لم يكن متاحًا في تلك البيئة. لاحقًا، على Preview أحدث مطابق لمرشح الإصدار، عاد `/api/health` = **200** مع:

- `feedbackStorage: ok`
- `analyticsStorage: ok`

كما ثبت live أن إصلاح Column أزال horizontal overflow عند 360px وأن analytics عاد **204** بدل 400. هذا يثبت سلامة الربط التشغيلي على الـPreview الذي تم فحصه، لكنه لا يساوي قراءة Cloudflare control-plane UUID؛ لا تدّعِ فحص UUID للـbinding بدون API/Dashboard evidence مستقل.

## بوابة الإصدار المتبقية

قبل دمج PR #56 إلى `main`:

1. أعد جلب `main` وPR #56 وتأكد أن الـheads لم تتغير.
2. تأكد أن Quality Gate على **أحدث head** أخضر بالكامل.
3. استخدم Cloudflare Preview منشورًا من **نفس أحدث head**، وليس Preview أقدم.
4. تحقق من `/api/health` = 200 وكلا D1 checks = `ok`.
5. نفذ live responsive/browser smoke على 360×800 و768×900 و1280×900، بدون overflow أو page errors أو first-party 4xx/5xx، وتأكد أن كل الحاسبات الـ13 ترسل analytics المقبول.
6. لا تعتبر `buildnumbers.pages.dev` يحمل أحدث candidate قبل إثبات deploy/production smoke بعد الدمج أو cutover المصرح به.
7. لا تعمل D1 remote migration؛ هذه الدفعة لا تحتاج migration جديدة.

## قواعد الاستئناف

- لا تبدأ من الصفر ولا تعيد بناء الانجن.
- قبل أي mutation، refetch الفرع المستهدف لأن جلسات أخرى قد تعمل بالتوازي.
- لا تخفف اختبارًا فاشلًا لإجبار البوابة على النجاح.
- أي bug حقيقي: أصلحه، أضف regression test مناسبًا، ثم شغّل Full Quality Gate.
- لا تنشئ Worker أو D1 أو repo بديلًا لهذا المشروع بلا قرار معماري صريح.
- لا تدّعِ نجاح Production أو browser QA من دليل CI/static فقط.

للتاريخ التفصيلي راجع `docs/PROGRESS.md` و`docs/AUDITS.md` و`CHANGELOG.md` وPR #56.