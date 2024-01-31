const BASE_URL =
  'https://opensheet.elk.sh/1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';

const ref = {
  structureChangeEl: document.querySelector('.material'),

  searchStructureIn: document.querySelector('#structure-search'),
  structureListEl: document.querySelector('.structure__list'),

  searchWeightIn: document.querySelector('#weight-search'),
  weightListEl: document.querySelector('.weight__list'),

  priseStructureEl: document.querySelector('.structure-prise__span'),

  searchColorIn: document.querySelector('#color-search'),
  colorListEl: document.querySelector('.color__list'),

  palletChangeEl: document.querySelector('.pallet'),
  palletSelectionIn: document.querySelectorAll('.pallet__input'),

  colorPreviewEl: document.querySelector('.color__preview'),
  totalPriceEl: document.querySelector('.total-price__span'),
  form: document.querySelector('.calc-form'),
};

let data = {};
let listAllColor;
let listTypeAll;
let weights = [];
let paint;
let selectType;
let total;

// parseUrlQuery();

// Вага searchWeightIn
let selectWeight;
// Ціна структури priseStructureEl
let selectTypePrice;
// Ціна за колір RalPrise:
let selectColorPrise;
// ===============================================

// ral NCS

ref.palletChangeEl.addEventListener('change', changePallet);

function changePallet(e) {
  const select = e.target.value;

  ref.searchColorIn.disabled = false;
  ref.searchColorIn.value = '';

  fetchColor(select, colorList);
}

// --------------------------------------------
// Вибирає  тип (pain, enamel, plaster)
ref.structureChangeEl.addEventListener('change', changeStructure);

function changeStructure(e) {
  selectType = e.target.value;

  ref.searchStructureIn.value = '';
  ref.searchWeightIn.value = '';
  // ref.priseStructureEl.innerHTML = '';
  // ref.totalPriceEl.innerHTML = '';
  ref.colorPreviewEl.removeAttribute('data-w3-color');

  const inputColors = Array.from(ref.palletSelectionIn);
  inputColors.map((e) => {
    return (e.disabled = true);
  });
  ref.searchColorIn.value = '';

  fetchColor(selectType, typeList);
}
// ========================================================================
// вибирає колір
function getNameSearchColor(ev) {
  const searchQuery = ev.target.value.trim();
  onInputChangeColor(searchQuery);
}

function onInputChangeColor(searchQuery) {
  const filterRAL = listAllColor.filter((col) => col.number === searchQuery);

  if (filterRAL.length === 1) {
    selectColorPrise = filterRAL[0][selectType];

    filterRAL[0].hex
      ? (ref.colorPreviewEl.style.backgroundColor = filterRAL[0].hex)
      : ref.colorPreviewEl.setAttribute('data-w3-color', `ncs(${searchQuery})`);
    w3SetColorsByAttribute();

    calcTotal();
  }
}

ref.searchColorIn.addEventListener('input', getNameSearchColor);

// Назва структури
function onInputChangeType(searchQuery) {
  weights = [];

  const filterType = listTypeAll.filter((el) => el.name === searchQuery);

  if (filterType.length === 1) {
    const keys = Object.keys(filterType[0]);
    paint = filterType[0];

    for (let key of keys) {
      if (Number(key)) {
        weights.push(key);
      }
    }
  } else {
    ref.searchWeightIn.value = '';
    ref.priseStructureEl.innerHTML = '';
  }

  ref.weightListEl.innerHTML = createWeights(weights);
}

function getSearchName(ev) {
  const searchQuery = ev.target.value.trim();
  onInputChangeType(searchQuery);
}

ref.searchStructureIn.addEventListener('input', getSearchName);

function getSelectTypePrice() {
  selectWeight = ref.searchWeightIn.value;
  const inputColors = Array.from(ref.palletSelectionIn);

  inputColors.map((e) => {
    return (e.disabled = false);
  });

  selectTypePrice = paint[selectWeight];

  paint[selectWeight]
    ? (ref.priseStructureEl.innerHTML = selectTypePrice)
    : (ref.priseStructureEl.innerHTML = '');
}

ref.searchWeightIn.addEventListener('input', getSelectTypePrice);

async function listPriseRal(range) {
  return await fetch(`${BASE_URL}/${range}`).then((res) => {
    if (!res.ok) {
      throw new Error(response.status);
    }
    return res.json();
  });
}

function createColor(e) {
  return e
    .map(({ number }) => {
      return `
      <option>${number}</option>
          `;
    })
    .join('');
}

function createType(e) {
  return e
    .map(({ name }) => {
      return `
      <option>${name}</option>
          `;
    })
    .join('');
}

function createWeights(elements) {
  return elements
    .map((element) => {
      return `
      <option>${element}</option>
          `;
    })
    .join('');
}

async function fetchColor(e, f) {
  await listPriseRal(e).then(f);
}

function colorList(color) {
  listAllColor = color;
  ref.colorListEl.innerHTML = createColor(color);
}

function typeList(t) {
  listTypeAll = t;
  ref.structureListEl.innerHTML = createType(t);
}

function calcTotal() {
  total =
    Number(selectWeight) * Number(selectColorPrise) + Number(selectTypePrice);
  ref.totalPriceEl.innerHTML = total;
}

function sendEmail(formData) {
  Email.send({
    SecureToken: 'd64bb1e5-28cc-4533-8a48-6b2beab954a0',
    To: 'mariashkam@ukr.net',
    From: 'm.p.mazurok@gmail.com',
    Subject: 'Замовлення',
    Body: `Група - ${formData.get(
      'material'
    )}. <br/> Тип структури: - ${formData.get(
      'structureSearch'
    )}.<br/> Фасовка - ${formData.get(
      'weightSearch'
    )}. <br/> Палітра - ${formData.get('pallet')}.<br/> Колір - ${formData.get(
      'colorSearch'
    )}.<br/> Загальна вартість - ${total}.<br/>
    Телефон: ${formData.get('phone')}.<br/> 
    ПІБ: ${formData.get('name')}.`,
  }).then((message) => {
    if (message === 'OK') {
      alert(
        `Ваше замовлення прийняте. Наш менеджер з Вами зв\u0027яжеться найближчим часом`
      );
    } else {
      alert(message);
    }
  });
}

ref.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(ref.form);
  sendEmail(formData);
});

// 3f124145-fdbf-4716-85c1-40ef55000509
// Username: 'm.p.mazurok@gmail.com',
// Password: '8A6207DF076B383C44B4ACD5663CB241336F',

// ===============================================

const phoneEl = document.getElementById('phone');

phoneEl.onclick = function () {
  phoneEl.value = '+38';
};

let old = 0;

phoneEl.onkeydown = function () {
  let curLen = phoneEl.value.length;

  if (curLen < old) {
    old--;
    return;
  }

  if (curLen === 3) phoneEl.value = phoneEl.value + '(';

  if (curLen === 7) phoneEl.value = phoneEl.value + ')-';

  if (curLen === 12) phoneEl.value = phoneEl.value + '-';

  if (curLen === 15) phoneEl.value = phoneEl.value + '-';

  if (curLen > 17)
    phoneEl.value = phoneEl.value.substring(0, phoneEl.value.length - 1);

  old++;
};
