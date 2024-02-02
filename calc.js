const BASE_URL =
  'https://opensheet.elk.sh/1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';

const ref = {
  structureChangeEl: document.querySelector('.material'),

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
  resetStructures();
  resetWeights();
  resetColor();

  // =================================

  selectMaterial = e.target.value;

  getListData(selectMaterial, getStructureList);
}

// Отримання списку структур
function getStructureList(ev) {
  structureList = ev;
  createStructureItem(ev);
}

// Відмальовуємо список структур

const structures = new Choices(ref.structureListEl, {
  allowHTML: true,
  noResultsText: 'По вашому запиту нічого не знайдено',
  resetScrollPosition: false,
  searchResultLimit: 10,
});

function createStructureItem(e) {
  let item = [];

  e.map(({ name }) => {
    item.push({ value: name, label: name });
  });
  structures.setChoices(item);
}

// ========================================================================
// Вибір назви структури
ref.structureListEl.addEventListener('change', onInputSelectStructure);

// В залежності від вибраної структури отримуємо список доступної фасовки
function onInputSelectStructure() {
  // reset
  resetWeights();
  resetColor();

  // =====================================
  const structureName = structures.getValue(true);

  const filterStructureName = structureList.filter(
    (el) => el.name === structureName
  );

  if (filterStructureName.length === 1) {
    const keys = Object.keys(filterStructureName[0]);
    structureSelect = filterStructureName[0];

    for (let key of keys) {
      console.log(weights);
      if (Number(key)) {
        weights.push(key);
      }
    }
  }

  createWeightsItems(weights);
}

// Відмальовуємо фасовку

const weightsList = new Choices(ref.weightListEl, {
  allowHTML: true,
  noResultsText: 'По вашому запиту нічого не знайдено',
  resetScrollPosition: false,
  searchResultLimit: 5,
  // removeItemButton: true,
});

function createWeightsItems(weights) {
  let item = [];

  weights.map((weight) => {
    item.push({ value: weight, label: weight });
  });

  weightsList.setChoices(item);
}

// ====================================================================

ref.searchWeightIn.addEventListener('change', getSelectWeight);

// отримуємо вибрану фасовку та виводимо ціну без тонування

function getSelectWeight() {
  // reset

  resetColor();
  const palletInputs = Array.from(ref.palletSelectionIn);
  palletInputs.map((e) => {
    return (e.checked = false);
  });
  ref.priseStructureEl.innerHTML = '0';

  // ========

  selectWeight = weightsList.getValue(true);

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
  resetColor();

  // ----------------------------------------------

  const selectPallet = e.target.value;

  getListData(selectPallet, getColorList);
}

function getColorList(ev) {
  colorsList = ev;
  createColorItems(ev);
}

// Відмальовуєм список кольорів
const colors = new Choices(ref.colorListEl, {
  allowHTML: true,
  noResultsText: 'По вашому запиту нічого не знайдено',
  resetScrollPosition: false,
  searchResultLimit: 10,
  // removeItemButton: true,
});

function createColorItems(e) {
  let item = [];

  e.map(({ number }) => {
    item.push({ value: number, label: number });
  });
  colors.setChoices(item);
}

// ======================================================

ref.searchColorIn.addEventListener('change', onInputSelectColor);

function onInputSelectColor() {
  const nameColor = colors.getValue(true);
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

// Скидання =========================

function resetStructures() {
  if (structureList) {
    structures.setChoices(
      [
        {
          value: '',
          label: 'Виберіть тип',
          selected: true,
          disabled: true,
          placeholder: true,
        },
      ],
      'value',
      'label',
      true
    );
  }
}

function resetWeights() {
  if (weights.length >= 1) {
    weightsList.setChoices(
      [
        {
          value: '',
          label: 'Виберіть вагу',
          selected: true,
          disabled: true,
          placeholder: true,
        },
      ],
      'value',
      'label',
      true
    );
    weights = [];
  }

  const palletInputs = Array.from(ref.palletSelectionIn);
  palletInputs.map((e) => {
    return (e.disabled = true), (e.checked = false);
  });

  ref.priseStructureEl.innerHTML = '0';
}

function resetColor() {
  if (colorsList) {
    colors.setChoices(
      [
        {
          value: '',
          label: 'Виберіть колір',
          selected: true,
          disabled: true,
          placeholder: true,
        },
      ],
      'value',
      'label',
      true
    );
  }

  ref.colorPreviewEl.removeAttribute('data-w3-color');
  ref.colorPreviewEl.style.backgroundColor = 'inherit';
  ref.totalPriceEl.innerHTML = '0';
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
    )} кг.л. <br/> Палітра - ${formData.get(
      'pallet'
    )}.<br/> Колір - ${formData.get(
      'colorSearch'
    )}.<br/> Загальна вартість - ${total} грн.<br/>
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
// ==================================================
