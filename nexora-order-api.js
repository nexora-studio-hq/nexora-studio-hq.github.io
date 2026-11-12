/* NEXORA website order API connector
 * Endpoint intentionally left blank until the Activepieces webhook is
 * configured with authentication + validation and tested. Never put tokens here.
 */
(function () {
  "use strict";
  const form = document.getElementById("orderForm");
  if (!form) return;
  const service = document.getElementById("orderService");
  const name = document.getElementById("orderName");
  const contact = document.getElementById("orderContact");
  const description = document.getElementById("orderDescription");
  const preview = document.getElementById("orderPreview");
  const status = document.getElementById("orderStatus");
  const honeypot = document.getElementById("website");

  const API_URL = ""; // Add the verified HTTPS Activepieces webhook URL here later.

  function message() {
    preview.value = [
      "سلام، برای ثبت سفارش در NEXORA پیام می‌دهم.",
      "",
      "خدمت: " + service.value,
      "نام: " + (name.value.trim() || "ثبت نشده"),
      "راه ارتباطی: " + (contact.value.trim() || "ثبت نشده"),
      "توضیحات: " + description.value.trim()
    ].join("\n");
  }
  [service, name, contact, description].forEach(el => {
    el.addEventListener("input", message);
    el.addEventListener("change", message);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    message();
    if (honeypot && honeypot.value.trim()) {
      status.textContent = "درخواست ثبت نشد.";
      return;
    }
    if (!API_URL) {
      status.textContent = "اتصال API هنوز در حالت آماده‌سازی است؛ فعلاً متن سفارش آماده شده، اما ارسال واقعی فعال نیست.";
      return;
    }
    const payload = {
      service: service.value,
      name: name.value.trim().slice(0, 120),
      contact: contact.value.trim().slice(0, 120),
      details: description.value.trim().slice(0, 4000)
    };
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    status.textContent = "در حال ارسال درخواست…";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      status.textContent = "درخواست ارسال شد. تیم NEXORA آن را بررسی می‌کند.";
      form.reset();
      preview.value = "";
    } catch (error) {
      status.textContent = "ارسال انجام نشد؛ لطفاً بعداً دوباره تلاش کن.";
    } finally {
      if (button) button.disabled = false;
    }
  });
  message();
})();
