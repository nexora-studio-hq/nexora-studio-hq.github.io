/* NEXORA — CUSTOMER REVIEWS API */
(function () {
    "use strict";

    var API_URL = "https://nexora-api.amiraliraisi73.workers.dev";
    var list = document.getElementById("reviewsList");
    var form = document.getElementById("reviewForm");
    if (!list || !form) return;

    var averageEl = document.getElementById("reviewsAverage");
    var countEl = document.getElementById("reviewsCount");
    var statusEl = document.getElementById("reviewStatus");
    var submitButton = document.getElementById("reviewSubmit");

    function faNumber(value) {
        return Number(value).toLocaleString("fa-IR");
    }

    function showMessage(message) {
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
        stars.setAttribute("aria-label", faNumber(review.rating) + " از ۵ ستاره");
        var rating = Math.max(1, Math.min(5, Number(review.rating) || 0));
        stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

        var text = document.createElement("p");
        text.className = "review-card-text";
        text.textContent = String(review.review_text || "");

        top.append(name, stars);
        card.append(top, text);

        if (review.created_at) {
            var date = document.createElement("small");
            date.className = "review-date";
            var parsed = new Date(String(review.created_at).replace(" ", "T") + (String(review.created_at).endsWith("Z") ? "" : "Z"));
            date.textContent = isNaN(parsed.getTime())
                ? ""
                : parsed.toLocaleDateString("fa-IR");
            if (date.textContent) card.appendChild(date);
        }

        return card;
    }

    async function loadReviews() {
        showMessage("در حال دریافت نظرها...");
        try {
            var response = await fetch(API_URL + "/reviews", {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) throw new Error("HTTP " + response.status);

            var data = await response.json();
            var reviews = Array.isArray(data.reviews) ? data.reviews : [];

            countEl.textContent = faNumber(reviews.length);
            if (!reviews.length) {
                averageEl.textContent = "—";
                showMessage("هنوز نظری منتشر نشده است. اولین نفری باش که تجربه‌اش را ثبت می‌کند.");
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
            showMessage("فعلاً دریافت نظرها ممکن نیست. لطفاً کمی بعد دوباره تلاش کن.");
            console.error("[NEXORA reviews] Load failed:", error);
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;

        var payload = {
            customer_name: document.getElementById("reviewName").value.trim(),
            rating: Number(document.getElementById("reviewRating").value),
            review_text: document.getElementById("reviewText").value.trim()
        };

        if (!payload.customer_name || payload.review_text.length < 5) {
            statusEl.textContent = "لطفاً نام و نظر خود را کامل وارد کن.";
            return;
        }

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
            if (!response.ok || data.success === false) {
                throw new Error(data.message || "ارسال نظر انجام نشد.");
            }

            form.reset();
            statusEl.textContent = "نظر شما ثبت شد و پس از بررسی، در صورت تأیید در سایت نمایش داده می‌شود. سپاس از همراهی‌ات!";
        } catch (error) {
            statusEl.textContent = "ارسال نظر انجام نشد. لطفاً اتصال اینترنت را بررسی کن و دوباره تلاش کن.";
            console.error("[NEXORA reviews] Submit failed:", error);
        } finally {
            submitButton.disabled = false;
        }
    });

    loadReviews();
})();