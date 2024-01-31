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
  phoneEl: document.getElementById('phone'),
  but: document.querySelector('.calc-button'),
  form: document.querySelector('.calc-form'),
};

let selectMaterial;
let structureList;
let structureSelect;
let weights = [];
let selectWeight;
let priseStructure;
let colorsList;
let total;
let selectColorPrise;
// ===============================================
async function fetchData(range) {
  return await fetch(`${BASE_URL}/${range}`).then((res) => {
    if (!res.ok) {
      throw new Error(response.status);
    }
    return res.json();
  });
}

async function getListData(range, fun) {
  await fetchData(range).then(fun);
}

// Вибирає  тип (pain, enamel, plaster) та отримуємо список структур
ref.structureChangeEl.addEventListener('change', changeStructure);

function changeStructure(e) {
  selectMaterial = e.target.value;

  // reset
  ref.searchStructureIn.value = '';
  ref.searchWeightIn.value = '';
  ref.priseStructureEl.innerHTML = '0';
  ref.totalPriceEl.innerHTML = '0';
  ref.colorPreviewEl.removeAttribute('data-w3-color');
  ref.colorPreviewEl.style.backgroundColor = 'inherit';
  const palletInputs = Array.from(ref.palletSelectionIn);
  palletInputs.map((e) => {
    return (e.disabled = true);
  });
  ref.searchColorIn.value = '';
  // =================================

  getListData(selectMaterial, getStructureList);
}

// Отримання списку структур
function getStructureList(ev) {
  structureList = ev;
  ref.structureListEl.innerHTML = createStructureItem(ev);
}

// Відмальовуємо список структур
function createStructureItem(e) {
  return e
    .map(({ name }) => {
      return `
      <option>${name}</option>
          `;
    })
    .join('');
}

// ========================================================================
// Вибір назви структури

ref.searchStructureIn.addEventListener('input', getStructureName);

function getStructureName(ev) {
  const structureName = ev.target.value.trim();
  onInputSelectStructure(structureName);
}

// В залежності від вибраної структури отримуємо список доступної фасовки
function onInputSelectStructure(structureName) {
  // reset
  weights = [];
  ref.searchWeightIn.value = '';
  ref.priseStructureEl.innerHTML = '0';
  ref.totalPriceEl.innerHTML = '0';
  ref.colorPreviewEl.removeAttribute('data-w3-color');
  ref.colorPreviewEl.style.backgroundColor = 'inherit';
  ref.searchColorIn.value = '';

  // =====================================

  const filterStructureName = structureList.filter(
    (el) => el.name === structureName
  );

  if (filterStructureName.length === 1) {
    const keys = Object.keys(filterStructureName[0]);
    structureSelect = filterStructureName[0];

    for (let key of keys) {
      if (Number(key)) {
        weights.push(key);
      }
    }
  }

  ref.weightListEl.innerHTML = createWeightsItems(weights);
}

// Відмальовуємо фасовку

function createWeightsItems(elements) {
  return elements
    .map((element) => {
      return `
      <option>${element}</option>
          `;
    })
    .join('');
}

// ====================================================================
ref.searchWeightIn.addEventListener('input', getSelectWeight);

// отримуємо вибрану фасовку та виводимо ціну без тонування

function getSelectWeight() {
  // reset
  ref.priseStructureEl.innerHTML = '0';
  ref.searchColorIn.value = '';
  ref.colorPreviewEl.removeAttribute('data-w3-color');
  ref.colorPreviewEl.style.backgroundColor = 'inherit';
  ref.totalPriceEl.innerHTML = '0';

  // ========

  selectWeight = ref.searchWeightIn.value;
  const palletInputs = Array.from(ref.palletSelectionIn);
  palletInputs.map((e) => {
    return (e.disabled = false);
  });

  priseStructure = structureSelect[selectWeight];

  structureSelect[selectWeight]
    ? (ref.priseStructureEl.innerHTML = priseStructure)
    : (ref.priseStructureEl.innerHTML = '0');
}
// ===============================================================

// ral NCS

ref.palletChangeEl.addEventListener('change', changePallet);

function changePallet(e) {
  // reset
  ref.colorPreviewEl.removeAttribute('data-w3-color');
  ref.colorPreviewEl.style.backgroundColor = 'inherit';
  ref.totalPriceEl.innerHTML = '0';
  ref.searchColorIn.value = '';
  // ----------------------------------------------

  const selectPallet = e.target.value;

  ref.searchColorIn.disabled = false;

  getListData(selectPallet, getColorList);
}

function getColorList(ev) {
  colorsList = ev;
  ref.colorListEl.innerHTML = createColorItems(ev);
}

// Відмальовуєм список кольорів
function createColorItems(e) {
  return e
    .map(({ number }) => {
      return `
      <option>${number}</option>
          `;
    })
    .join('');
}

// ======================================================

ref.searchColorIn.addEventListener('input', getNameColor);
// вибирає колір
function getNameColor(ev) {
  const nameColor = ev.target.value.trim();
  onInputSelectColor(nameColor);
}

function onInputSelectColor(nameColor) {
  const filterColors = colorsList.filter((col) => col.number === nameColor);

  if (filterColors.length === 1) {
    selectColorPrise = filterColors[0][selectMaterial];

    filterColors[0].hex
      ? (ref.colorPreviewEl.style.backgroundColor = filterColors[0].hex)
      : ref.colorPreviewEl.setAttribute('data-w3-color', `ncs(${nameColor})`);
    w3SetColorsByAttribute();

    calcTotal();
  }
}
// Розрахунок загальної вартості
function calcTotal() {
  total =
    Number(selectWeight) * Number(selectColorPrise) + Number(priseStructure);
  ref.totalPriceEl.innerHTML = total;
}

// ========================================
// Відправка емейла

ref.form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(ref.form);
  sendEmail(formData);

  ref.but.setAttribute('disabled', 'disabled');
});

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
        'Дякуємо за замовдення. Наш менеджер з Вами зв\u0027яжеться найближчим часом'
      );
    } else {
      alert(message);
    }
  });
}

// 3f124145-fdbf-4716-85c1-40ef55000509
// Username: 'm.p.mazurok@gmail.com',
// Password: '8A6207DF076B383C44B4ACD5663CB241336F',

// ===============================================

ref.phoneEl.onclick = function () {
  ref.phoneEl.value = '+38';
};

let old = 0;

ref.phoneEl.onkeydown = function () {
  let curLen = ref.phoneEl.value.length;

  if (curLen < old) {
    old--;
    return;
  }

  if (curLen === 3) ref.phoneEl.value = ref.phoneEl.value + '(';
  if (curLen === 7) ref.phoneEl.value = ref.phoneEl.value + ')-';
  if (curLen === 12) ref.phoneEl.value = ref.phoneEl.value + '-';
  if (curLen === 15) ref.phoneEl.value = ref.phoneEl.value + '-';
  if (curLen > 17)
    ref.phoneEl.value = ref.phoneEl.value.substring(
      0,
      ref.phoneEl.value.length - 1
    );

  old++;
};
