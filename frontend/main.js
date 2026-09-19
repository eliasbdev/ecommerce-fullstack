// =============================================
// 1. HAMBURGER MENU TOGGLE (Pagbukas/Sara ng Nav)
// =============================================
// Ito ang function na tinatawag ng 'onclick' sa iyong hamburger button.
function toggleMenu() {
    // Hanapin ang navigation element gamit ang ID na "mainNav"
    var nav = document.getElementById('mainNav');
    
    // Ang 'classList.toggle' ay parang switch:
    // - Kung WALANG "show" ang nav, IDADAGDAG ito (lalabas ang menu).
    // - Kung MERONG "show" ang nav, TATANGGALIN ito (magtatago ang menu).
    nav.classList.toggle('show');
}

// =============================================
// 2. EXTRA: Awtomatikong Pagsara ng Menu (Mobile)
// =============================================
// Kapag na-click ng user ang isang link (hal. Home, About) sa mobile menu,
// dapat magsara agad ang menu para hindi nakaharang sa screen.

// Hanapin ang LAHAT ng <a> (links) sa loob ng nav.
var navLinks = document.querySelectorAll('#mainNav a');

// Gamit ang loop (parang FOR loop sa C), dumaan sa bawat link.
navLinks.forEach(function(link) {
    // Lagyan ng 'event listener' ang bawat link.
    link.addEventListener('click', function() {
        // Hanapin ulit ang nav at tanggalin ang "show" para magsara.
        var nav = document.getElementById('mainNav');
        nav.classList.remove('show');
    });
});

// =============================================
// 3. CART CLICK (Para makita ang connection)
// =============================================
// Gusto mo bang malaman kung gumagana ang JavaScript kapag ni-click ang cart?
// Hanapin ang cart link gamit ang class na "cart-link".
var cartLink = document.querySelector('.cart-link');

// Kung may nakitang cart link (ibig sabihin, nasa page ito)...
if (cartLink) {
    // Lagyan ito ng 'event listener' para sa click.
    cartLink.addEventListener('click', function(event) {
        // Hindi nito pinipigilan ang pagpunta sa cart.html (gagana pa rin ang link).
        // Pero mag-iiwan ito ng mensahe sa Console (F12 -> Console tab).
        console.log('🛒 Na-click ang cart! Pupunta sa cart.html');
    });
}

// =============================================
// (BONUS) Ipakitang handa na ang JS sa Console
// =============================================
// Kapag nag-load ang page, may lalabas na mensahe sa Console.
console.log('✅ Handa na ang Eshop! Gumagana ang JavaScript.');