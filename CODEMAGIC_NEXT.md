# Codemagic

تمت إضافة `codemagic.yaml` إلى جذر المشروع.

هذا workflow ينشئ مجلد Android أثناء البناء عبر `npx cap add android` ثم يشغّل `npx cap sync android` ويبني APK تجريبي.

Codemagic يجب أن يقرأ `codemagic.yaml` من جذر مستودع GitHub.
بعد نجاح البناء غير الموقّع، نضيف Keystore لإنتاج APK/AAB موقّع للنشر.
