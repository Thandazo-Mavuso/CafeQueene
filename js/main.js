/* ==========================================
   Café Queene — main.js
   One script shared by every page. Each part only runs on the
   page that needs it, so it is safe to load everywhere.

   Contents
   1. Start-up (runs when the page has loaded)
   2. Mobile navigation (all pages)
   3. Dynamic menu: search, filter and sort (menu.html)
   4. Forms: validation, AJAX and email builder (enquiry.html, contact.html)
   ========================================== */

/* ==========================================
   1. START-UP
   ========================================== */
document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initMenu();
  initForms();
});

/* ==========================================
   2. MOBILE NAVIGATION
   ========================================== */
/* ---------- Mobile navigation (hamburger) ----------
   The button toggles the "is-open" class on the nav list and keeps
   aria-expanded in sync so screen readers announce the menu state. */
function initMobileNav() {
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('primary-nav');

  if (!toggle || !menu) {
    return;
  }

  function setOpen(isOpen) {
    menu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  /* Escape closes the menu and returns focus to the button */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  /* If the window is widened back to desktop, reset the menu */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      setOpen(false);
    }
  });
}


/* ==========================================
   3. DYNAMIC MENU (menu.html)
   Loads the menu from a JavaScript array and adds search,
   category filtering and sorting.
   ========================================== */
/* ---------- Menu data ----------
   Each item has a category, name, description and price in rand. */
var MENU_ITEMS = [
  { id: 1, category: "coffee", name: "Espresso / Americano", description: "Rich, smooth and robust everyday house blend.", price: 30 },
  { id: 2, category: "coffee", name: "Flat White / Cappuccino", description: "Double shot espresso with micro-foamed textured milk.", price: 38 },
  { id: 3, category: "coffee", name: "Café Latte", description: "Smooth espresso poured over steamed milk with a light foam top.", price: 42 },
  { id: 4, category: "coffee", name: "Hot Chocolate / Chai Latte", description: "Rich artisanal cocoa or spiced comforting tea blend.", price: 45 },
  { id: 5, category: "coffee", name: "Iced Coffee", description: "Chilled espresso over ice with fresh milk — smooth and refreshing.", price: 42 },
  { id: 6, category: "coffee", name: "Fresh Orange Juice", description: "Freshly squeezed orange juice, made to order.", price: 35 },
  { id: 7, category: "breakfast", name: "Queene's Signature Breakfast", description: "Two eggs your way, sourdough toast, bacon, grilled mushrooms, and artisanal pork sausage.", price: 95 },
  { id: 8, category: "breakfast", name: "Avocado & Feta Toast", description: "Smashed seasonal avo, crumbled feta, lemon drizzle, and toasted seeds on thick sourdough.", price: 75 },
  { id: 9, category: "breakfast", name: "Garden Avocado Toast", description: "Smashed avocado on grilled toast with sprouts, mixed seeds, and fresh basil.", price: 70 },
  { id: 10, category: "breakfast", name: "Croissant & Preserves", description: "Freshly baked buttery flaky croissant served with butter and local berry jam.", price: 45 },
  { id: 11, category: "breakfast", name: "Granola & Yogurt Bowl", description: "House-baked toasted honey granola, double-cream Greek yogurt, and fresh seasonal berries.", price: 65 },
  { id: 12, category: "breakfast", name: "Fluffy Pancake Stack", description: "Three stacked buttermilk pancakes with maple syrup, whipped cream, and fresh berries.", price: 70 },
  { id: 13, category: "breakfast", name: "Berry Pancake Stack", description: "Fluffy pancakes dusted with icing sugar, topped with fresh blueberries and raspberries.", price: 75 },
  { id: 14, category: "breakfast", name: "Classic French Toast", description: "Thick-cut brioche dipped and pan-fried golden, dusted with icing sugar, banana and berries.", price: 70 },
  { id: 15, category: "breakfast", name: "Petite French Toast", description: "A smaller, golden-fried French toast with butter and maple syrup — perfect with a coffee.", price: 55 },
  { id: 16, category: "lunch", name: "Grilled Chicken & Avo Wrap", description: "Tender grilled chicken breast, fresh avocado, crisp greens, and house mayo wrapped in a toasted tortilla.", price: 85 },
  { id: 17, category: "lunch", name: "Classic Toasted Toastie", description: "Choice of cheese & tomato, ham & cheese, or chicken mayo on artisanal farm bread.", price: 60 },
  { id: 18, category: "fast-food", name: "Queene's Burger", description: "Beef patty with bacon, melted cheese, a fried egg, and rocket on a toasted bun, served with fries.", price: 110 },
  { id: 19, category: "fast-food", name: "Cheese Burger Combo", description: "Classic cheese burger and fries, paired with an iced coffee of your choice.", price: 130 },
  { id: 20, category: "fast-food", name: "Golden Fries", description: "Crispy, golden fries served with a side of tomato sauce.", price: 35 },
  { id: 21, category: "snacks", name: "Blueberry Crumble Muffin", description: "Soft-baked muffin studded with blueberries and topped with a sweet crumble.", price: 35 },
  { id: 22, category: "snacks", name: "Double Chocolate Chip Cookie", description: "A large, chewy cookie loaded with chocolate chips — perfect with a coffee.", price: 30 },
];

var CATEGORY_LABELS = {
  'coffee': 'Coffee & Drinks',
  'breakfast': 'All-Day Breakfast',
  'lunch': 'Lunch & Plates',
  'fast-food': 'Fast Food',
  'snacks': 'Snacks & Sweets'
};

/* Current state of the controls */
var state = {
  query: '',
  category: 'all',
  sort: 'menu'
};

/* Runs only on menu.html (the page that has the search box) */
function initMenu() {
  if (!document.getElementById('menu-search')) {
    return;
  }
  setupControls();
  renderMenu();
}

/* ---------- Controls ---------- */
function setupControls() {
  var searchInput = document.getElementById('menu-search');
  var sortSelect = document.getElementById('menu-sort');
  var filterButtons = document.querySelectorAll('.filter-btn');
  var clearButton = document.getElementById('menu-clear');

  /* Search runs on every keystroke */
  searchInput.addEventListener('input', function () {
    state.query = searchInput.value.trim().toLowerCase();
    renderMenu();
  });

  /* Category buttons: only one is active (aria-pressed) at a time */
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      state.category = button.getAttribute('data-category');
      filterButtons.forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === button));
      });
      renderMenu();
    });
  });

  sortSelect.addEventListener('change', function () {
    state.sort = sortSelect.value;
    renderMenu();
  });

  /* "Clear search and filters" button in the empty-state message */
  clearButton.addEventListener('click', function () {
    state.query = '';
    state.category = 'all';
    state.sort = 'menu';
    searchInput.value = '';
    sortSelect.value = 'menu';
    filterButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-category') === 'all'));
    });
    renderMenu();
    searchInput.focus();
  });
}

/* ---------- Filtering and sorting ---------- */
function getVisibleItems() {
  var results = MENU_ITEMS.filter(function (item) {
    var matchesCategory = state.category === 'all' || item.category === state.category;
    var text = (item.name + ' ' + item.description).toLowerCase();
    var matchesQuery = state.query === '' || text.indexOf(state.query) !== -1;
    return matchesCategory && matchesQuery;
  });

  if (state.sort === 'price-low') {
    results.sort(function (a, b) { return a.price - b.price; });
  } else if (state.sort === 'price-high') {
    results.sort(function (a, b) { return b.price - a.price; });
  } else if (state.sort === 'name') {
    results.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }
  /* "menu" keeps the original order of the array */

  return results;
}

/* ---------- Rendering (DOM manipulation) ---------- */
function renderMenu() {
  var visible = getVisibleItems();
  var sections = document.querySelectorAll('.menu-section');
  var searching = state.query !== '';

  sections.forEach(function (section) {
    var category = section.getAttribute('data-category');
    var list = section.querySelector('.menu-list');
    var sectionItems = visible.filter(function (item) {
      return item.category === category;
    });

    /* Remove the old items, then build the new ones */
    list.textContent = '';
    sectionItems.forEach(function (item) {
      list.appendChild(buildMenuItem(item));
    });

    /* Hide sections with no matches, and hide the big photo while searching */
    section.hidden = sectionItems.length === 0;
    section.classList.toggle('is-searching', searching);
  });

  updateStatus(visible.length);
}

function buildMenuItem(item) {
  var row = document.createElement('li');
  row.className = 'menu-item';

  var body = document.createElement('div');

  var name = document.createElement('h3');
  name.className = 'menu-item__name';
  name.textContent = item.name;

  var description = document.createElement('p');
  description.className = 'menu-item__desc';
  description.textContent = item.description;

  body.appendChild(name);
  body.appendChild(description);

  var price = document.createElement('span');
  price.className = 'menu-item__price';
  price.textContent = 'R' + item.price;

  row.appendChild(body);
  row.appendChild(price);
  return row;
}

/* Result count (announced to screen readers) and the empty-state message */
function updateStatus(count) {
  var status = document.getElementById('menu-status');
  var empty = document.getElementById('menu-empty');

  if (count === 0) {
    status.textContent = 'No menu items found.';
  } else if (count === 1) {
    status.textContent = 'Showing 1 menu item.';
  } else {
    status.textContent = 'Showing ' + count + ' of ' + MENU_ITEMS.length + ' menu items.';
  }

  empty.hidden = count !== 0;
}


/* ==========================================
   4. FORMS (enquiry.html and contact.html)
   Client-side validation. enquiry.html is sent with AJAX and shows
   an instant response; contact.html builds an email to send.
   ========================================== */
/* ---------- Settings you may need to change ---------- */

/* AJAX endpoint for the enquiry form. Create a free form at formspree.io and
   replace YOUR_FORM_ID in enquiry.html (the form's action attribute).
   While the action still contains YOUR_FORM_ID the page runs in demo mode:
   it validates and shows the response, but nothing is actually sent. */
var DEMO_MARKER = 'YOUR_FORM_ID';

/* Where contact-form emails are addressed, by branch */
var BRANCH_EMAILS = {
  middelburg: 'middelburg@cafequeene.co.za',
  nelspruit: 'nelspruit@cafequeene.co.za'
};

var BRANCH_NAMES = {
  middelburg: 'Café Queene Middelburg',
  nelspruit: 'Café Queene Nelspruit'
};

/* Opening hours by day of the week (0 = Sunday) */
var OPENING_HOURS = {
  0: '8:00 AM – 4:00 PM',
  1: '7:00 AM – 6:00 PM',
  2: '7:00 AM – 6:00 PM',
  3: '7:00 AM – 6:00 PM',
  4: '7:00 AM – 6:00 PM',
  5: '7:00 AM – 6:00 PM',
  6: '7:00 AM – 6:00 PM'
};

/* Estimated costs used for the instant enquiry response (rand) */
var PRICES = {
  groupPerPerson: 85,
  eventDeposit: 500,
  eventPerPerson: 120,
  platterPrice: 450,
  platterServes: 8
};

/* Runs on enquiry.html and contact.html (the pages that have a form) */
function initForms() {
  var enquiryForm = document.getElementById('enquiry-form');
  var contactForm = document.getElementById('contact-form');

  if (enquiryForm) {
    initEnquiryForm(enquiryForm);
  }
  if (contactForm) {
    initContactForm(contactForm);
  }
}

/* ==========================================
   Validation rules
   Each rule gets the trimmed value and the field, and returns an error
   message, or an empty string when the value is valid.
   A field picks its rule with data-rule="..." in the HTML.
   ========================================== */
var RULES = {
  name: function (value) {
    if (value === '') { return 'Please enter your name.'; }
    if (value.length < 2) { return 'Your name must be at least 2 characters.'; }
    if (value.length > 60) { return 'Your name must be 60 characters or fewer.'; }
    if (!/^[A-Za-zÀ-ÿ' -]+$/.test(value)) {
      return 'Your name can only contain letters, spaces, hyphens and apostrophes.';
    }
    return '';
  },

  email: function (value) {
    if (value === '') { return 'Please enter your email address.'; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Please enter a valid email address, like name@example.com.';
    }
    return '';
  },

  /* South African numbers: 0821234567 or +27821234567 (spaces and dashes allowed) */
  phone: function (value, field) {
    if (value === '') {
      return field.required ? 'Please enter your phone number.' : '';
    }
    var digits = value.replace(/[\s-]/g, '');
    if (!/^(\+27|0)[1-9][0-9]{8}$/.test(digits)) {
      return 'Enter a South African number, like 082 123 4567 or +27 82 123 4567.';
    }
    return '';
  },

  select: function (value) {
    return value === '' ? 'Please choose an option from the list.' : '';
  },

  date: function (value, field) {
    if (value === '') {
      return field.required ? 'Please choose a date.' : '';
    }
    var chosen = parseDate(value);
    if (!chosen) { return 'Please enter a valid date.'; }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var limit = new Date(today);
    limit.setFullYear(limit.getFullYear() + 1);

    if (chosen < today) { return 'The date cannot be in the past.'; }
    if (chosen > limit) { return 'Please choose a date within the next 12 months.'; }
    return '';
  },

  guests: function (value, field) {
    if (value === '') {
      return field.required ? 'Please enter the number of guests.' : '';
    }
    var number = Number(value);
    if (!/^[0-9]+$/.test(value) || number < 1 || number > 50) {
      return 'Enter a whole number of guests between 1 and 50.';
    }
    return '';
  },

  message: function (value) {
    if (value === '') { return 'Please type your message.'; }
    if (value.length < 10) { return 'Your message must be at least 10 characters (' + value.length + ' so far).'; }
    if (value.length > 500) { return 'Your message must be 500 characters or fewer.'; }
    return '';
  }
};

/* Turn "2026-11-07" into a Date at local midnight, or null if it is not a real date */
function parseDate(value) {
  var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) { return null; }
  var year = Number(match[1]);
  var month = Number(match[2]) - 1;
  var day = Number(match[3]);
  var date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

/* ---------- Showing and clearing errors ---------- */
function getErrorBox(field) {
  return document.getElementById(field.id + '-error');
}

function showError(field, message) {
  var box = getErrorBox(field);
  field.setAttribute('aria-invalid', 'true');
  if (box) {
    box.textContent = message;
  }
}

function clearError(field) {
  var box = getErrorBox(field);
  field.removeAttribute('aria-invalid');
  if (box) {
    box.textContent = '';
  }
}

/* Validate one field. Returns true when it is valid. */
function validateField(field) {
  var ruleName = field.getAttribute('data-rule');
  if (!ruleName || !RULES[ruleName]) {
    return true;
  }
  var message = RULES[ruleName](field.value.trim(), field);
  if (message) {
    showError(field, message);
    return false;
  }
  clearError(field);
  return true;
}

/* Validate the whole form. Focuses the first invalid field. */
function validateForm(form) {
  var fields = form.querySelectorAll('[data-rule]');
  var firstInvalid = null;

  fields.forEach(function (field) {
    if (!validateField(field) && !firstInvalid) {
      firstInvalid = field;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }
  return true;
}

/* Live feedback: check a field when the user leaves it, and re-check while
   they type once an error is showing. */
function attachLiveValidation(form) {
  form.querySelectorAll('[data-rule]').forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });
    var eventName = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, function () {
      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(field);
      }
    });
  });
}

/* Live character counter for the message box */
function attachCounter(textarea, counter, max) {
  function update() {
    counter.textContent = textarea.value.length + ' / ' + max + ' characters';
  }
  textarea.addEventListener('input', update);
  update();
}

/* Small helper for building elements */
function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) { node.className = className; }
  if (text !== undefined) { node.textContent = text; }
  return node;
}

function formatDate(date) {
  return date.toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatRand(amount) {
  return 'R' + amount.toLocaleString('en-ZA');
}

/* ==========================================
   ENQUIRY FORM (enquiry.html)
   ========================================== */
function initEnquiryForm(form) {
  var typeSelect = document.getElementById('enquiry-type');
  var dateField = document.getElementById('date');
  var guestsField = document.getElementById('guests');
  var message = document.getElementById('message');

  form.setAttribute('novalidate', 'novalidate');

  /* The earliest bookable date is today */
  var today = new Date();
  dateField.min = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  attachLiveValidation(form);
  attachCounter(message, document.getElementById('message-count'), 500);

  /* Date and guests are only required for enquiries that need a booking */
  typeSelect.addEventListener('change', function () {
    var needsBooking = typeSelect.value !== '' && typeSelect.value !== 'general';
    dateField.required = needsBooking;
    guestsField.required = needsBooking;
    document.querySelectorAll('.optional-tag').forEach(function (tag) {
      tag.hidden = needsBooking;
    });
    clearError(dateField);
    clearError(guestsField);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    /* Hidden spam trap: real people never fill this in */
    if (form.elements['website'].value !== '') {
      return;
    }
    if (!validateForm(form)) {
      return;
    }
    sendEnquiry(form);
  });

  document.getElementById('enquiry-again').addEventListener('click', function () {
    form.reset();
    form.hidden = false;
    document.getElementById('enquiry-result').hidden = true;
    document.getElementById('message-count').textContent = '0 / 500 characters';
    document.getElementById('name').focus();
  });
}

/* AJAX submission: send the form data in the background with fetch(),
   so the page does not reload. */
function sendEnquiry(form) {
  var button = form.querySelector('button[type="submit"]');
  var formError = document.getElementById('form-error');
  var data = new FormData(form);
  var demoMode = form.action.indexOf(DEMO_MARKER) !== -1;

  formError.textContent = '';
  button.disabled = true;
  button.textContent = 'Sending…';

  var request;
  if (demoMode) {
    /* Demo mode: pretend the server answered after a short delay */
    console.warn('Demo mode: set a real form action in enquiry.html to send enquiries.');
    request = new Promise(function (resolve) {
      setTimeout(resolve, 700);
    });
  } else {
    request = fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Server answered with status ' + response.status);
      }
    });
  }

  request
    .then(function () {
      showEnquiryResponse(form);
    })
    .catch(function () {
      formError.textContent =
        'Sorry, we could not send your enquiry. Please check your internet connection and try again, ' +
        'or call us on +27 76 156 4860 (Middelburg) or +27 82 514 1290 (Nelspruit).';
    })
    .then(function () {
      button.disabled = false;
      button.textContent = 'Submit Enquiry';
    });
}

/* Build the instant response about cost and availability */
function showEnquiryResponse(form) {
  var type = form.elements['enquiry_type'].value;
  var branch = form.elements['branch'].value;
  var guests = Number(form.elements['guests'].value) || 0;
  var dateValue = form.elements['date'].value;
  var name = form.elements['name'].value.trim().split(' ')[0];
  var date = dateValue ? parseDate(dateValue) : null;

  var cost = '';
  var typeLabel = '';

  if (type === 'study') {
    typeLabel = 'Study or work table';
    cost = 'Free to book, with no minimum spend. We simply ask that you order something every couple of hours.';
    if (guests > 4) {
      cost += ' For more than 4 people, a group booking is a better fit.';
    }
  } else if (type === 'group') {
    typeLabel = 'Group booking';
    cost = 'Estimated minimum spend of ' + formatRand(PRICES.groupPerPerson) + ' per person' +
      (guests ? ', about ' + formatRand(PRICES.groupPerPerson * guests) + ' for ' + guests + ' guests.' : '.');
  } else if (type === 'event') {
    typeLabel = 'Private event';
    cost = 'A ' + formatRand(PRICES.eventDeposit) + ' deposit secures the date. Food and drinks start from ' +
      formatRand(PRICES.eventPerPerson) + ' per person' +
      (guests ? ', about ' + formatRand(PRICES.eventPerPerson * guests) + ' for ' + guests + ' guests.' : '.');
  } else if (type === 'catering') {
    typeLabel = 'Catering';
    var platters = Math.max(1, Math.ceil(guests / PRICES.platterServes));
    cost = 'Platters are ' + formatRand(PRICES.platterPrice) + ' each and serve about ' + PRICES.platterServes + ' people. ' +
      'For ' + guests + ' guests that is about ' + platters + ' platter' + (platters > 1 ? 's' : '') +
      ', roughly ' + formatRand(platters * PRICES.platterPrice) + '.';
  } else {
    typeLabel = 'General question';
    cost = 'No cost. Asking us a question is always free.';
  }

  var availability;
  if (date) {
    availability = 'On ' + formatDate(date) + ' our ' + (branch === 'nelspruit' ? 'Nelspruit' : 'Middelburg') +
      ' branch is open ' + OPENING_HOURS[date.getDay()] + '. Your slot is not reserved until we confirm it by email.';
  } else {
    availability = 'Both branches are open Monday to Saturday 7:00 AM – 6:00 PM and Sunday 8:00 AM – 4:00 PM.';
  }

  var result = document.getElementById('enquiry-result');
  var body = document.getElementById('enquiry-result-body');
  body.textContent = '';

  body.appendChild(el('h2', 'form-result__title', 'Thank you, ' + name + '!'));
  body.appendChild(el('p', '', 'We have received your ' + typeLabel.toLowerCase() + ' enquiry for ' +
    (branch === 'nelspruit' ? 'Nelspruit' : 'Middelburg') + '. Here is what you need to know:'));

  var list = el('dl', 'form-result__list');
  list.appendChild(el('dt', '', 'Estimated cost'));
  list.appendChild(el('dd', '', cost));
  list.appendChild(el('dt', '', 'Availability'));
  list.appendChild(el('dd', '', availability));
  list.appendChild(el('dt', '', 'What happens next'));
  list.appendChild(el('dd', '', 'A team member will reply to ' + form.elements['email'].value.trim() +
    ' within one working day to confirm the details.'));
  body.appendChild(list);

  form.hidden = true;
  result.hidden = false;
  result.focus();
}

/* ==========================================
   CONTACT FORM (contact.html)
   Validated, then compiled into an email for the visitor to send.
   ========================================== */
function initContactForm(form) {
  var message = document.getElementById('contact-message');

  form.setAttribute('novalidate', 'novalidate');
  attachLiveValidation(form);
  attachCounter(message, document.getElementById('contact-message-count'), 500);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (form.elements['website'].value !== '') {
      return;
    }
    if (!validateForm(form)) {
      return;
    }
    showEmailPreview(form);
  });

  document.getElementById('contact-edit').addEventListener('click', function () {
    form.hidden = false;
    document.getElementById('email-preview').hidden = true;
    document.getElementById('contact-name').focus();
  });
}

function showEmailPreview(form) {
  var name = form.elements['name'].value.trim();
  var email = form.elements['email'].value.trim();
  var phone = form.elements['phone'].value.trim();
  var branch = form.elements['branch'].value;
  var typeSelect = form.elements['message_type'];
  var typeLabel = typeSelect.options[typeSelect.selectedIndex].text;
  var text = form.elements['message'].value.trim();

  var to = BRANCH_EMAILS[branch];
  var subject = typeLabel + ' from ' + name;
  var body = 'Hi ' + BRANCH_NAMES[branch] + ' team,\n\n' + text +
    '\n\n---\nName: ' + name +
    '\nEmail: ' + email +
    '\nPhone: ' + (phone || 'not given') +
    '\nMessage type: ' + typeLabel;

  /* mailto: link that opens the visitor's email app with everything filled in */
  var link = 'mailto:' + to +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(body);

  document.getElementById('preview-to').textContent = to;
  document.getElementById('preview-subject').textContent = subject;
  document.getElementById('preview-body').textContent = body;
  document.getElementById('preview-send').setAttribute('href', link);

  var preview = document.getElementById('email-preview');
  form.hidden = true;
  preview.hidden = false;
  preview.focus();
}