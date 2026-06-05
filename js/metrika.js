/* ============================================================
   ЯНДЕКС.МЕТРИКА — счётчик посещаемости (единый источник для всех страниц)
   Номер счётчика задан в METRIKA_ID. Если поставить 0 — код полностью
   инертен: ни запросов, ни cookie. После включения один раз показывается
   уведомление о сборе анонимной статистики со ссылкой на /privacy.html.
   ============================================================ */
(function () {
  var METRIKA_ID = 109210959;
  if (!METRIKA_ID) return; /* инертно, пока счётчик не задан */

  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) { return; } }
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  ym(METRIKA_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });

  /* уведомление о сборе анонимной статистики (показывается один раз) */
  if (!localStorage.getItem('ck_ok')) {
    var b = document.createElement('div');
    b.className = 'cookie-notice';
    b.innerHTML = 'Мы используем Яндекс.Метрику для анонимной статистики посещений. ' +
      '<a href="/privacy.html">Подробнее</a>. ' +
      '<button type="button">Понятно</button>';
    document.body.appendChild(b);
    b.querySelector('button').addEventListener('click', function () {
      localStorage.setItem('ck_ok', '1'); b.remove();
    });
  }
})();
