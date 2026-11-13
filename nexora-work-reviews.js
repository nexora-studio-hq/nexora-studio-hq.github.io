/* NEXORA — WORK-SPECIFIC REVIEWS */
(function () {
    "use strict";

    var API_URL = "https://nexora-api.amiraliraisi73.workers.dev";
    var VALID_WORK_KEYS = [
        "mcdonalds", "nike", "coffee", "game", "car",
        "landscape", "samsung", "lindor", "tesla", "nexora"
    ];

    function byId(id) {
        return document.getElementById(id);
    }

    function faNumber(value) {
        return Number(value).toLocaleString("fa-IR");
    }

    function showMessage(list, message) {
        var item = document.createElement("p");
        item.className = "reviews-message";
        item.textContent = message;
        list.replaceChildren(item);
    }

    function createReviewCard(review) {
        var card = document.createElement("article");
        card.className = "review-card";

        var top = document.createElement("div");
        top.className = "review-card-top";

        var name = document.createElement("h3");
        name.className = "review-card-name";
        name.textContent = String(review.customer_name || "مشتری NEXORA");

        var stars = document.createElement("span");
        stars.className = "review-stars";
        var rating = Math.max(1, Math.min(5, Number(review.rating) || 0));
        stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
        stars.setAttribute("aria-label", faNumber(rating) + " از ۵ ستاره");

        var text = document.createElement("p");
        text.className = "review-card-text";
        text.textContent = String(review.review_text || "");

        top.append(name, stars);
        card.append(top, text);

        if (review.created_at) {
            var date = document.createElement("small");
            date.className = "review-date";
            var rawDate = String(review.created_at);
            var parsed = new Date(rawDate.replace(" ", "T") + (rawDate.endsWith("Z") ? "" : "Z"));
            date.textContent = isNaN(parsed.getTime())
                ? ""
                : parsed.toLocaleDateString("fa-IR");
            if (date.textContent) card.appendChild(date);
        }

        return card;
    }

    async function init() {
        var section = document.querySelector(".work-reviews[data-work-key]");
        if (!section) return;

        var workKey = section.dataset.workKey;
        if (VALID_WORK_KEYS.indexOf(workKey) === -1) {
            console.error("[NEXORA work reviews] Invalid work key.");
            return;
        }

        var list = byId("workReviewsList");
        var averageEl = byId("workReviewsAverage");
        var countEl = byId("workReviewsCount");
        var form = byId("workReviewForm");
        var nameInput = byId("workReviewName");
        var ratingInput = byId("workReviewRating");
        var textInput = byId("workReviewText");
        var statusEl = byId("workReviewStatus");
        var submitButton = byId("workReviewSubmit");

        if (!list || !averageEl || !countEl || !form ||
            !nameInput || !ratingInput || !textInput ||
            !statusEl || !submitButton) return;

        async function loadReviews() {
            showMessage(list, "در حال دریافت نظرها...");
            try {
                var response = await fetch(
                    API_URL + "/reviews?work_key=" + encodeURIComponent(workKey),
                    { method: "GET", headers: { "Accept": "application/json" } }
                );
                if (!response.ok) throw new Error("HTTP " + response.status);

                var data = await response.json();
                if (data.work_key !== workKey) {
                    throw new Error("Review category mismatch");
                }

                var reviews = Array.isArray(data.reviews) ? data.reviews : [];
                countEl.textContent = faNumber(reviews.length);

                if (!reviews.length) {
                    averageEl.textContent = "—";
                    showMessage(list, "هنوز نظری برای این نمونه‌کار منتشر نشده است. اولین نفری باش که دیدگاهش را ثبت می‌کند.");
                    return;
                }

                var total = reviews.reduce(function (sum, review) {
                    return sum + (Number(review.rating) || 0);
                }, 0);

                averageEl.textContent = (total / reviews.length).toLocaleString("fa-IR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                });

                list.replaceChildren();
                reviews.forEach(function (review) {
                    list.appendChild(createReviewCard(review));
                });
            } catch (error) {
                averageEl.textContent = "—";
                countEl.textContent = "۰";
                showMessage(list, "فعلاً دریافت نظرها ممکن نیست. لطفاً کمی بعد دوباره تلاش کن.");
                console.error("[NEXORA work reviews] Load failed:", error);
            }
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            var payload = {
                work_key: workKey,
                customer_name: nameInput.value.trim(),
                rating: Number(ratingInput.value),
                review_text: textInput.value.trim()
            };

            submitButton.disabled = true;
            statusEl.textContent = "در حال ارسال نظر...";

            try {
                var response = await fetch(API_URL + "/reviews", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                var data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.success !== true) {
                    throw new Error(data.message || "ارسال نظر انجام نشد.");
                }

                form.reset();
                statusEl.textContent = "نظر شما ثبت شد و پس از بررسی، در صورت تأیید زیر همین نمونه‌کار نمایش داده می‌شود. سپاس از همراهی‌ات!";
            } catch (error) {
                statusEl.textContent = "ارسال نظر انجام نشد. لطفاً اتصال اینترنت را بررسی کن و دوباره تلاش کن.";
                console.error("[NEXORA work reviews] Submit failed:", error);
            } finally {
                submitButton.disabled = false;
            }
        });

        await loadReviews();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
