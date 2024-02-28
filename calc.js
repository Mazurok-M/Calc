const BASE_URL =
  'https://opensheet.elk.sh/1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';

const ref = {
  lang: document.documentElement.lang,
  structureChangeEl: document.querySelector('.material'),

  structureListEl: document.querySelector('.structure__list'),

  searchWeightIn: document.querySelector('#weight-search'),
  weightListEl: document.querySelector('.weight__list'),
  weightUnitEl: document.querySelector('.weight__unit'),

  priseStructureEl: document.querySelector('.structure-prise__span'),

  searchColorIn: document.querySelector('#color-search'),
  colorListEl: document.querySelector('.color__list'),

  palletChangeEl: document.querySelector('.pallet'),
  palletSelectionIn: document.querySelectorAll('.pallet__input'),

  colorPreviewEl: document.querySelectorAll('.color__tumb'),
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
let selectPallet;
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
  try {
    const data = await fetchData(range);
    fun(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Вибирає  тип (pain, quartz, plaster) та отримуємо список структур
ref.structureChangeEl.addEventListener('change', changeStructure);

function changeStructure(e) {
  resetStructures();
  resetWeights();

  // =================================

  selectMaterial = e.target.value;

  getListData(selectMaterial, getStructureList);

  if (selectMaterial === 'plaster') {
    ref.weightUnitEl.innerHTML = ' кг.';
  } else {
    ref.weightUnitEl.innerHTML = ' л.';
  }
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
  // const baseImg = `/content/uploads/images/foto.png`;
  const baseImg = `./img/foto.png`;

  const item = e.map(({ name, img_url }) => ({
    value: name,

    label: `<img src=${
      img_url || baseImg
    } alt=${name} width="30"/> <span>${name} </span> `,
  }));
  structures.setChoices(item);
}

// ========================================================================
// Вибір назви структури
ref.structureListEl.addEventListener('change', onInputSelectStructure);

// В залежності від вибраної структури отримуємо список доступної фасовки
function onInputSelectStructure() {
  // reset
  resetWeights();

  // =====================================
  const structureName = structures.getValue(true);

  const filterStructureName = structureList.filter(
    (el) => el.name.trim() === structureName
  );

  if (filterStructureName.length === 1) {
    structureSelect = filterStructureName[0];

    Object.keys(structureSelect).forEach((key) => {
      if (structureSelect[key].trim() !== '' && !isNaN(key)) {
        weights.push(key);
      }
    });
  }

  createWeightsItems(weights);
}

// Відмальовуємо фасовку

const weightsList = new Choices(ref.weightListEl, {
  allowHTML: true,
  noResultsText: 'По вашому запиту нічого не знайдено',
  resetScrollPosition: false,
  searchResultLimit: 5,
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
  const palletInputs = Array.from(ref.palletSelectionIn);

  // ========

  selectWeight = weightsList.getValue(true);

  palletInputs.map((e) => {
    return (e.disabled = false);
  });

  priseStructure = structureSelect[selectWeight];

  priseStructure = structureSelect[selectWeight] || '0';
  ref.priseStructureEl.innerHTML = priseStructure;

  if (colors.getValue(true)) {
    calcTotal();
  }
}

// ===============================================================

// ral NCS

ref.palletChangeEl.addEventListener('change', changePallet);

function changePallet(e) {
  // reset
  resetColor();

  // ----------------------------------------------

  selectPallet = e.target.value;

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
  searchResultLimit: 50,
  renderChoiceLimit: -1,
}).disable();

function createColorItems(e) {
  let item = [];
  e.map(({ number, hex }) => {
    item.push({
      value: number,
      label: `<span>${number}</span><div class='color__item-bg' style="background-color: ${hex}"></div>`,
    });
  });

  colors.setChoices(item).enable();
}

// ======================================================

ref.searchColorIn.addEventListener('change', onInputSelectColor);

function onInputSelectColor() {
  // ref.colorPreviewEl.innerHTML = "";
  const nameColor = colors.getValue(true);
  const filterColors = colorsList.filter((col) => col.number === nameColor);

  if (filterColors.length === 1) {
    selectColorPrise = filterColors[0][selectMaterial];
    Array.from(ref.colorPreviewEl).map((e) => {
      e.style.backgroundColor = filterColors[0].hex;
    });

    calcTotal();
  }
}

// Розрахунок загальної вартості
function calcTotal() {
  if (Number(selectWeight) === 0.4) {
    total = 0.5 * Number(selectColorPrise) + Number(priseStructure);
  } else {
    total =
      Number(selectWeight) * Number(selectColorPrise) + Number(priseStructure);
  }

  ref.totalPriceEl.innerHTML = total;
}

// Скидання =========================

function resetStructures() {
  if (structureList) {
    structures.setChoices(
      [
        {
          value: '',
          label: 'Виберіть матеріал',
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
          label: 'Виберіть фасовку',
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

  ref.priseStructureEl.innerHTML = '0';
  ref.totalPriceEl.innerHTML = '0';
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

  ref.totalPriceEl.innerHTML = '0';
}

// ========================================
// Відправка емейла

ref.form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(ref.form);
  sendEmail(formData);
  // sendTelegram(formData);

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
    )}. <br/> Наменування матеріалу: - ${formData.get(
      'structureSearch'
    )}.<br/> Фасовка - ${formData.get('weightSearch')}${
      ref.weightUnitEl.innerHTML
    } <br/> Палітра - ${formData.get('pallet')}.<br/> Колір - ${formData.get(
      'colorSearch'
    )}.<br/> Загальна вартість - ${total} грн.<br/>
    <br/>
    Дані замовника:
    <br/>
    Телефон: ${formData.get('phone')}.<br/>
    ПІБ: ${formData.get('name')}.<br/>
    Коментар:  ${formData.get('comment')}.
    `,
  }).then((message) => {
    if (message === 'OK') {
      if (ref.lang === 'ru') {
        alert(
          `Спасибо за заказ:
    ${formData.get('structureSearch')} - ${formData.get('weightSearch')}${
            ref.weightUnitEl.innerHTML
          }
    Цвет - ${formData.get('colorSearch')}
    Общая стоимость - ${total} грн.\nНаш менеджер с Вами свяжется в ближайшее время
    `
        );
      } else {
        alert(
          `Дякуємо за замовлення:
    ${formData.get('structureSearch')} - ${formData.get('weightSearch')}${
            ref.weightUnitEl.innerHTML
          }
    Колір - ${formData.get('colorSearch')}
    Загальна вартість - ${total} грн.\nНаш менеджер з Вами зв\u0027яжеться найближчим часом
    `
        );
      }
    } else {
      alert(message);
    }
  });
}

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

// Відправка в телеграм

// const TOCEN = 'tocen';
// const CHAT_ID = 'id';
// const TELEGRAM_URL = `https://api.telegram.org/bot${TOCEN}/sendMessage`;

// async function sendTelegram(formData) {
//   try {
//     await fetch(TELEGRAM_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         chat_id: CHAT_ID,
//         parse_mode: 'html',
//         text: `Група - ${formData.get(
//           'material'
//         )}.\nНаменування матеріалу: - ${formData.get(
//           'structureSearch'
//         )}.\nФасовка - ${formData.get('weightSearch')}${
//           ref.weightUnitEl.innerHTML
//         }\nПалітра - ${formData.get('pallet')}.\nКолір - ${formData.get(
//           'colorSearch'
//         )}.\nЗагальна вартість - ${total} грн.\n \nДані замовника:\n      Телефон:  ${formData.get(
//           'phone'
//         )}.\n      ПІБ:  ${formData.get(
//           'name'
//         )}.\n      Коментар:  ${formData.get('comment')}`,
//       }),
//     });
//   } catch (error) {
//     console.error('Помилка:', error);
//   }
// }
