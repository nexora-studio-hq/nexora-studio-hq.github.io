
/* =====================================================
   NEXORA — SITE DATA
===================================================== */

window.SITE = {
    telegram: "https://t.me/NEXORA_Digital_Official",
    telegramBot: "https://t.me/NEXORA_AI_Employee_bot",
    youtube: "",
    whatsapp: "",
    bale: "",
    eitaa: "",
};

window.WORKS = [
    {
        key: "mcdonalds",
        title: "McDonald's",
        type: "پوستر تمرینی",
        image: "images/mcdonalds.png",
        desc: "پوستر تمرینی مک‌دونالد؛ تمرین ترکیب رنگ قرمز و زرد و طراحی تبلیغاتی."
    },
    {
        key: "nike",
        title: "Nike",
        type: "پوستر تمرینی",
        image: "images/nike.png",
        desc: "پوستر تمرینی نایک؛ تمرین تایپوگرافی ورزشی و ترکیب رنگ مشکی و سفید."
    },
    {
        key: "coffee",
        title: "Coffee Time",
        type: "پست تمرینی",
        image: "images/coffee.png",
        desc: "طراحی پست اینستاگرام کافه با فضای گرم و رنگ‌بندی قهوه‌ای."
    },
    {
        key: "game",
        title: "Game Ad",
        type: "بنر تمرینی",
        image: "images/game.png",
        desc: "بنر مفهومی بازی با تمرکز بر ایجاد حس هیجان و جلب توجه."
    },
    {
        key: "car",
        title: "Car Edit",
        type: "ویرایش تصویر",
        image: "images/car.png",
        desc: "تمرین ویرایش تصویر خودرو با اصلاح رنگ، نور و کنتراست."
    },
    {
        key: "landscape",
        title: "Landscape Edit",
        type: "ویرایش تصویر",
        image: "images/landscape.png",
        desc: "ویرایش تصویر منظره با تنظیم نور و کنتراست برای ایجاد حس سینمایی."
    },
    {
        key: "samsung",
        title: "Samsung S26 Ultra",
        type: "ویدیوی تمرینی",
        video: "videos/samsung.mp4",
        desc: "تدوین ویدیوی تبلیغاتی تمرینی با تمرکز بر ریتم و برش‌های کوتاه."
    },
    {
        key: "lindor",
        title: "LINDOR",
        type: "پوستر تمرینی",
        image: "images/lindor.png",
        desc: "پوستر تمرینی شکلات با رنگ‌بندی گرم و حس لوکس."
    },
    {
        key: "tesla",
        title: "Tesla",
        type: "پوستر تمرینی",
        image: "images/tesla.png",
        desc: "طراحی پوستر مفهومی با رویکرد مدرن و ترکیب‌بندی مینیمال."
    },
    {
        key: "nexora",
        title: "NEXORA",
        type: "طراحی برند",
        image: "images/nexora-poster.png",
        desc: "طراحی هویت بصری و پوستر برند NEXORA."
    }
];

function getWorkByKey(key) {
    if (!Array.isArray(window.WORKS)) {
        return null;
    }

    return window.WORKS.find(function (work) {
        return work.key === key;
    }) || null;
}
