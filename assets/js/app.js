(function () {
  "use strict";

  var root = document.documentElement;
  var themeKey = "elnazer-theme";
  var storedTheme = null;

  try {
    storedTheme = localStorage.getItem(themeKey);
  } catch (error) {
    storedTheme = null;
  }

  if (storedTheme === "light" || storedTheme === "dark") {
    root.setAttribute("data-theme", storedTheme);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var $ = function (selector, scope) {
      return (scope || document).querySelector(selector);
    };
    var $$ = function (selector, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    };

    var toast = $("#toast");
    var toastTimer = 0;

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        toast.classList.remove("show");
      }, 3200);
    }

    var themeToggle = $("#themeToggle");
    var themeColor = $('meta[name="theme-color"]');

    function applyTheme(theme, persist) {
      root.setAttribute("data-theme", theme);
      if (themeColor) {
        themeColor.setAttribute("content", theme === "light" ? "#F6EFE1" : "#101B16");
      }
      if (themeToggle) {
        var isLight = theme === "light";
        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.setAttribute(
          "aria-label",
          isLight ? "تبديل الوضع الليلي" : "تبديل الوضع النهاري"
        );
      }
      if (persist) {
        try {
          localStorage.setItem(themeKey, theme);
        } catch (error) {
          // Storage may be unavailable in private browsing.
        }
      }
    }

    applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next, true);
        showToast(next === "light" ? "تم تفعيل الوضع النهاري" : "تم تفعيل الوضع الليلي");
      });
    }

    var header = $(".site-header");
    var progress = $("#readingProgress");
    var backToTop = $("#backToTop");

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("scrolled", y > 18);
      if (backToTop) backToTop.classList.toggle("show", y > 640);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
        progress.style.width = pct.toFixed(2) + "%";
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }

    var menuToggle = $("#menuToggle");
    var mobileMenu = $("#mobileMenu");

    var menuScrollY = 0;

    function setMenu(open) {
      if (!menuToggle || !mobileMenu) return;
      var wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (open === wasOpen) return;
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
      mobileMenu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
      if (open) {
        menuScrollY = window.scrollY || window.pageYOffset;
        document.body.style.position = "fixed";
        document.body.style.top = "-" + menuScrollY + "px";
        document.body.style.width = "100%";
      } else {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, menuScrollY);
      }
    }

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function () {
        setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
      });
      $$("a", mobileMenu).forEach(function (link) {
        link.addEventListener("click", function () {
          setMenu(false);
        });
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
          setMenu(false);
          menuToggle.focus();
        }
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth > 960) setMenu(false);
      });
    }

    // Keep the whole page readable without scroll-triggered reveal effects.
    $$(".reveal").forEach(function (item) {
      item.classList.add("visible");
    });

    var tabs = $$(".preview-tab");
    var panels = $$(".preview-panel");

    function activateTab(tab, focus) {
      if (!tab) return;
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        var selected = panel.id === tab.getAttribute("aria-controls");
        panel.classList.toggle("active", selected);
        panel.hidden = !selected;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(tab, false);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowLeft") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowRight") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        activateTab(next, true);
      });
    });

    var faqItems = $$(".faq-item");
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });

    var copyButtons = $$("[data-copy]");

    function legacyCopy(text) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(area);
      return ok;
    }

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(
          function () {
            return true;
          },
          function () {
            return legacyCopy(text);
          }
        );
      }
      return Promise.resolve(legacyCopy(text));
    }

    copyButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-copy") || "";
        copyText(value).then(function (ok) {
          showToast(ok ? "تم نسخ بصمة SHA-256" : "مقدرناش ننسخ. اختار البصمة يدويًا.");
        });
      });
    });

    var androidUrl =
      "https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-arm64.apk";
    var armv7Url =
      "https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-armv7.apk";
    var windowsUrl =
      "https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-windows.zip";
    var cardsAnchor = "#downloadCards";
    var ua = navigator.userAgent || "";
    var uaDataPlatform = navigator.userAgentData && navigator.userAgentData.platform;
    var platformText = (uaDataPlatform || navigator.platform || "").toLowerCase();
    var isAndroid = /android/i.test(ua);
    var isWindows = /windows|win32|win64|wow64/i.test(ua) || platformText.indexOf("win") === 0;
    var isIOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (platformText.indexOf("mac") === 0 && navigator.maxTouchPoints > 1);

    var smartBanner = $("#smartBanner");
    var smartTitle = $("#smartTitle");
    var smartText = $("#smartText");
    var smartDownload = $("#smartDownload");

    function recommendCard(arch) {
      var card = $('.download-card[data-arch="' + arch + '"]');
      if (card) {
        card.classList.add("os-match");
        var badge = $(".recommended-badge", card);
        if (badge) badge.textContent = "الأنسب لجهازك";
      }
    }

    function activateSmartBanner() {
      if (!smartBanner || !smartTitle || !smartText || !smartDownload) return;

      if (isAndroid) {
        smartTitle.textContent = "إنت على أندرويد — ننصحك بنسخة ARM64";
        smartText.textContent =
          "دي النسخة المناسبة لمعظم الموبايلات الحديثة. لو جهازك قديم جدًا اختار ARMv7 من الكروت.";
        smartDownload.href = androidUrl;
        smartDownload.textContent = "تحميل ARM64 مباشرة";
        smartDownload.setAttribute("data-download", "arm64");
        recommendCard("arm64");
      } else if (isWindows) {
        smartTitle.textContent = "إنت على ويندوز — ننصحك بالنسخة المحمولة";
        smartText.textContent =
          "نزّل حزمة ZIP، فك الضغط، وشغّل ElNazer.exe. محتاج ويندوز 10 أو 11 بمعمارية 64-bit.";
        smartDownload.href = windowsUrl;
        smartDownload.textContent = "تحميل نسخة ويندوز";
        smartDownload.setAttribute("data-download", "windows");
        recommendCard("x64");
      } else if (isIOS) {
        smartTitle.textContent = "إنت على iPhone أو iPad";
        smartText.textContent =
          "الإصدار الحالي متاح لأندرويد وويندوز فقط. تقدر تشوف كل النسخ المتاحة من هنا.";
        smartDownload.href = cardsAnchor;
        smartDownload.textContent = "شوف النسخ المتاحة";
        smartDownload.removeAttribute("data-download");
      } else {
        var label = "جهازك";
        if (/mac/i.test(ua) || platformText.indexOf("mac") === 0) label = "ماك";
        if (/linux/i.test(ua) || platformText.indexOf("linux") === 0) label = "لينكس";
        smartTitle.textContent = "التطبيق متاح لأندرويد وويندوز";
        smartText.textContent =
          "إنت على " + label + " حاليًا. اختار النسخة اللي تناسب جهازك من الكروت تحت.";
        smartDownload.href = cardsAnchor;
        smartDownload.textContent = "اختيار النسخة";
        smartDownload.removeAttribute("data-download");
      }

      smartBanner.hidden = false;
    }

    activateSmartBanner();

    var verifyJump = $("#verifyJump");
    if (verifyJump) {
      verifyJump.addEventListener("click", function () {
        var target = $("#security");
        if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var link = target.closest("[data-download]");
      if (!link) return;
      var kind = link.getAttribute("data-download");
      var message =
        kind === "windows"
          ? "بدأ تحميل نسخة ويندوز. فك الضغط قبل تشغيل ElNazer.exe."
          : "بدأ تحميل APK. بعد ما يخلص، قارن بصمة SHA-256 قبل التثبيت.";
      window.setTimeout(function () {
        showToast(message);
      }, 400);
    });

    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    var navLinks = $$(".desktop-nav a[href^='#']");
    var spySections = navLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window && spySections.length) {
      var spyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (link) {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + entry.target.id
              );
            });
          });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
      );
      spySections.forEach(function (section) {
        spyObserver.observe(section);
      });
    }
  });
})();
