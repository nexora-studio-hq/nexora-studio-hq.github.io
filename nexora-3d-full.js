
/* =====================================================
   NEXORA — LIGHTWEIGHT 3D ORB
   Canvas-based 3D-inspired effect, no external library
===================================================== */

(function () {
    "use strict";

    function initNexora3D() {
        var canvas = document.getElementById("nx3d");

        if (!canvas) return;

        var ctx = canvas.getContext("2d");

        if (!ctx) return;

        var reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        var width = 0;
        var height = 0;
        var pixelRatio = 1;

        var particles = [];
        var connections = [];

        var pointerX = 0;
        var pointerY = 0;
        var rotationX = 0;
        var rotationY = 0;

        var animationId = null;
        var paused = false;
        var startTime = performance.now();

        var particleCount = 190;

        function createSphere() {
            particles = [];
            connections = [];

            var goldenAngle = Math.PI * (3 - Math.sqrt(5));

            for (var i = 0; i < particleCount; i++) {
                var y = 1 - (i / (particleCount - 1)) * 2;
                var radius = Math.sqrt(1 - y * y);
                var theta = goldenAngle * i;

                particles.push({
                    x: Math.cos(theta) * radius,
                    y: y,
                    z: Math.sin(theta) * radius,
                    size: 0.65 + Math.random() * 1.15
                });
            }

            /* پیوند میان نقطه‌های مجاور روی گوی */
            for (var a = 0; a < particles.length; a++) {
                for (var b = a + 1; b < particles.length; b++) {
                    var dx = particles[a].x - particles[b].x;
                    var dy = particles[a].y - particles[b].y;
                    var dz = particles[a].z - particles[b].z;

                    var distance = Math.sqrt(
                        dx * dx + dy * dy + dz * dz
                    );

                    if (distance < 0.29) {
                        connections.push([a, b]);
                    }
                }
            }
        }

        function resize() {
            var rect = canvas.getBoundingClientRect();

            width = Math.max(1, rect.width);
            height = Math.max(1, rect.height);

            pixelRatio = Math.min(
                window.devicePixelRatio || 1,
                1.6
            );

            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);

            ctx.setTransform(
                pixelRatio, 0,
                0, pixelRatio,
                0, 0
            );

            render(0);
        }

        function render(time) {
            ctx.clearRect(0, 0, width, height);

            if (!width || !height) return;

            var mobile = width < 650;

            var centerX = mobile
                ? width * 0.5
                : width * 0.74;

            var centerY = height * 0.47;

            var globeRadius = mobile
                ? Math.min(width * 0.31, height * 0.27)
                : Math.min(width * 0.2, height * 0.35);

            globeRadius = Math.max(65, globeRadius);

            var slowTime = reducedMotion ? 0 : time * 0.00014;

            rotationY = slowTime + pointerX * 0.18;
            rotationX = pointerY * 0.12 +
                (reducedMotion ? 0 : Math.sin(time * 0.00025) * 0.06);

            var cosY = Math.cos(rotationY);
            var sinY = Math.sin(rotationY);
            var cosX = Math.cos(rotationX);
            var sinX = Math.sin(rotationX);

            var projected = [];

            particles.forEach(function (particle) {
                var x1 = particle.x * cosY -
                    particle.z * sinY;

                var z1 = particle.x * sinY +
                    particle.z * cosY;

                var y1 = particle.y * cosX -
                    z1 * sinX;

                var z2 = particle.y * sinX +
                    z1 * cosX;

                var perspective = 1.75 / (2.8 - z2 * 0.46);

                projected.push({
                    x: centerX + x1 * globeRadius * perspective,
                    y: centerY + y1 * globeRadius * perspective,
                    z: z2,
                    size: particle.size * perspective
                });
            });

            /* هالهٔ ملایم پشت کره */
            var glow = ctx.createRadialGradient(
                centerX, centerY, globeRadius * 0.04,
                centerX, centerY, globeRadius * 1.6
            );

            glow.addColorStop(0, "rgba(80, 145, 255, 0.12)");
            glow.addColorStop(0.48, "rgba(100, 160, 255, 0.045)");
            glow.addColorStop(1, "rgba(100, 160, 255, 0)");

            ctx.beginPath();
            ctx.fillStyle = glow;
            ctx.arc(
                centerX, centerY,
                globeRadius * 1.6,
                0, Math.PI * 2
            );
            ctx.fill();

            /* خطوط کم‌رنگ */
            ctx.lineWidth = 0.65;

            connections.forEach(function (edge) {
                var a = projected[edge[0]];
                var b = projected[edge[1]];

                var depth = (a.z + b.z) * 0.5;

                if (depth < -0.45) return;

                var alpha = 0.035 + (depth + 1) * 0.055;

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);

                ctx.strokeStyle =
                    "rgba(50, 105, 205, " + alpha + ")";

                ctx.stroke();
            });

            /* نقاط روی سطح کره */
            projected.sort(function (a, b) {
                return a.z - b.z;
            });

            projected.forEach(function (point) {
                var depth = Math.max(0.12, (point.z + 1) / 2);
                var radius = Math.max(0.5, point.size * depth);

                ctx.beginPath();
                ctx.arc(
                    point.x,
                    point.y,
                    radius,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = point.z > 0
                    ? "rgba(65, 123, 220, " + (0.14 + depth * 0.45) + ")"
                    : "rgba(110, 145, 200, " + (0.08 + depth * 0.16) + ")";

                ctx.fill();
            });

            /* حلقه‌های محیطی */
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationY * 0.18);

            ctx.beginPath();
            ctx.ellipse(
                0, 0,
                globeRadius * 1.18,
                globeRadius * 0.36,
                -0.16,
                0, Math.PI * 2
            );

            ctx.strokeStyle = "rgba(75, 125, 210, 0.12)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        function frame(now) {
            animationId = null;

            if (paused || document.hidden) {
                return;
            }

            render(now);

            if (!reducedMotion) {
                animationId = requestAnimationFrame(frame);
            }
        }

        function start() {
            if (animationId !== null) return;

            if (reducedMotion) {
                render(performance.now());
                return;
            }

            animationId = requestAnimationFrame(frame);
        }

        function stop() {
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        canvas.addEventListener("pointermove", function (event) {
            var rect = canvas.getBoundingClientRect();

            pointerX = (
                (event.clientX - rect.left) / rect.width - 0.5
            ) * 2;

            pointerY = (
                (event.clientY - rect.top) / rect.height - 0.5
            ) * 2;

            if (reducedMotion) {
                render(performance.now());
            }
        }, { passive: true });

        canvas.addEventListener("pointerleave", function () {
            pointerX = 0;
            pointerY = 0;
        });

        /* شیب بسیار ظریف کارت‌ها با موس */
        if (
            !reducedMotion &&
            !window.matchMedia("(pointer: coarse)").matches
        ) {
            document.addEventListener("pointermove", function (event) {
                var card = event.target.closest &&
                    event.target.closest(".p-card, .service-card");

                if (!card) return;

                var rect = card.getBoundingClientRect();

                var x = (event.clientX - rect.left) / rect.width - 0.5;
                var y = (event.clientY - rect.top) / rect.height - 0.5;

                card.style.transform =
                    "perspective(1000px) rotateY(" +
                    (x * 2).toFixed(2) +
                    "deg) rotateX(" +
                    (-y * 2).toFixed(2) +
                    "deg) translateY(-2px)";
            }, { passive: true });

            document.addEventListener("pointerout", function (event) {
                var card = event.target.closest &&
                    event.target.closest(".p-card, .service-card");

                if (
                    card &&
                    event.relatedTarget &&
                    !card.contains(event.relatedTarget)
                ) {
                    card.style.transform = "";
                }
            });
        }

        document.addEventListener("visibilitychange", function () {
            paused = document.hidden;

            if (paused) {
                stop();
            } else {
                start();
            }
        });

        window.addEventListener("resize", resize, {
            passive: true
        });

        createSphere();
        resize();
        start();

        console.info("[NEXORA 3D] جلوه سه‌بعدی سبک فعال شد.");
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initNexora3D,
            { once: true }
        );
    } else {
        initNexora3D();
    }
})();
