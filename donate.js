/* =========================================================
   Paint a Life - donation checkout (DEMO MODE)
   ---------------------------------------------------------
   Gateway: Lenco (https://lenco.co) - Zambian, ZMW, MTN/Airtel/Zamtel
   Mobile Money + Visa/Mastercard, popup widget "LencoPay.getPaid".
   Docs: https://lenco-api.readme.io/v2.0/reference/accept-payments

   TO GO LIVE (Paint a Life's own merchant account, never Teen Tech's):
     1. Open a Lenco business account as a registered NGO (PACRA docs).
     2. Paste the PUBLIC key below (never a secret key) and set mode:'live'.
     3. Add a tiny server/webhook to VERIFY each reference with Lenco
        before showing "thank you" (onSuccess alone is not proof).
     Monthly gifts: confirm recurring support with Lenco; otherwise use
     Flutterwave payment plans or monthly reminders.
   ========================================================= */
var GATEWAY = {
  provider: 'lenco',
  mode: 'demo',          // 'demo' | 'sandbox' | 'live'
  publicKey: '',         // [Paint a Life's Lenco PUBLIC key] - intentionally empty
  sandboxJs: 'https://pay.sandbox.lenco.co/js/v1/inline.js',
  liveJs: 'https://pay.lenco.co/js/v1/inline.js'
};
(function () {
  var f = document.getElementById('dform'); if (!f) return;
  var steps = f.querySelectorAll('.stp'), dots = f.querySelectorAll('.steps span'), cur = 1;
  var q = new URLSearchParams(location.search);
  if (q.get('cause') === 'academy') f.cause.value = 'academy';
  function val(n) { var e = f.querySelector('input[name=' + n + ']:checked'); return e ? e.value : ''; }
  function amount() { var a = val('amt'); return a === 'custom' ? parseFloat(document.getElementById('ca').value) : parseFloat(a); }
  function summary() {
    var causeTxt = f.cause.value === 'academy' ? 'Paint a Life Academy' : 'the General fund';
    return 'K' + amount() + (val('freq') === 'monthly' ? ' every month' : ' one-off') + ' to ' + causeTxt;
  }
  function go(n) {
    cur = n; steps.forEach(function (s) { s.hidden = +s.dataset.s !== n; });
    dots.forEach(function (d, i) { d.classList.toggle('on', i < n); });
    if (n === 3) { document.getElementById('sum').textContent = summary(); }
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  f.addEventListener('change', function (e) {
    if (e.target.name === 'amt') document.getElementById('custom').hidden = e.target.value !== 'custom';
    if (e.target.name === 'pm') { var c = e.target.value === 'card'; document.getElementById('mmf').hidden = c; document.getElementById('cardf').hidden = !c; }
  });
  f.querySelectorAll('.nx').forEach(function (b) { b.onclick = function () {
    if (cur === 1 && !(amount() >= 10)) { alert('Please enter an amount of at least K10.'); return; }
    if (cur === 2) { var n = document.getElementById('dn'), e = document.getElementById('de');
      if (!n.value.trim() || !e.checkValidity() || !e.value) { alert('Please add your name and a valid email.'); return; } }
    go(cur + 1);
  }; });
  f.querySelectorAll('.bk').forEach(function (b) { b.onclick = function () { go(cur - 1); }; });
  document.getElementById('again').onclick = function () { f.reset(); document.getElementById('custom').hidden = true; go(1); };
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var pm = val('pm');
    if (pm !== 'card' && !/^0?(9[5-7]|7[5-7])\d{7}$/.test(document.getElementById('dp').value.replace(/\D/g, '').replace(/^260/, '0'))) {
      alert('Please enter a Zambian mobile number, e.g. 097XXXXXXX.'); return; }
    var payload = {
      key: GATEWAY.publicKey, reference: 'PAL-' + Date.now(), email: document.getElementById('de').value,
      amount: amount(), currency: 'ZMW', label: 'Paint a Life Initiative',
      channels: pm === 'card' ? ['card'] : ['mobile-money'],
      customer: { firstName: document.getElementById('dn').value, phone: document.getElementById('dp').value }
    };
    if (GATEWAY.mode === 'demo' || !GATEWAY.publicKey) {          // DEMO: nothing is sent anywhere
      document.getElementById('dsum').textContent = 'You chose ' + summary() + ' via ' +
        ({ mtn: 'MTN MoMo', airtel: 'Airtel Money', card: 'card' })[pm] + '. Reference ' + payload.reference + '.';
      go(4); return;
    }
    // LIVE/SANDBOX (only after Paint a Life adds its own key)
    var s = document.createElement('script'); s.src = GATEWAY.mode === 'live' ? GATEWAY.liveJs : GATEWAY.sandboxJs;
    s.onload = function () { payload.onSuccess = function (r) { /* TODO: verify r.reference on your server first */ };
      payload.onClose = function () {}; window.LencoPay.getPaid(payload); };
    document.head.appendChild(s);
  });
})();
