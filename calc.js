const BASE_URL =
  'https://opensheet.elk.sh/1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';

const ref = {
  RalName: document.querySelector('.color-list'),
  RalPrise: document.querySelector('.ral-prise'),
  inputEl: document.querySelector('#search-box'),
  inputType: document.querySelector('.structure-datalist'),
  datalistColor: document.querySelector('.color-datalist'),
  inputTypeEl: document.querySelector('#search-box-structure'),
  datalistWeightEl: document.querySelector('.weight-datalist'),
  inputWeightEl: document.querySelector('#search-weight'),
  TypePrise: document.querySelector('.structure-prise'),
  inputColor: document.querySelectorAll('.colour_input'),
  // textUrl: document.querySelector('.url'),
  totalPrice: document.querySelector('.total_price'),

  colorPreview: document.querySelector('.color_preview'),
};

let data = {};
let listAllColor;
let listTypeAll;
let weights = [];
let paint;
let selectType;
let total;

parseUrlQuery();

// Вага inputWeightEl
let selectWeight;
// Ціна структури TypePrise
let selectTypePrice;
// Ціна за колір RalPrise:
let selectColorPrise;

startData(data);

// ral NCS
document
  .querySelector('.colour_management')
  .addEventListener('change', function (e) {
    const select = e.target.value;

    ref.inputEl.disabled = false;
    ref.inputEl.value = '';
    // ref.RalPrise.innerHTML = '';
    fetchColor(select, colorList);
  });

// Вибирає  тип (pain, enamel, plaster)
document
  .querySelector('.structure_select')
  .addEventListener('change', function (e) {
    selectType = e.target.value;

    ref.inputTypeEl.value = '';
    ref.inputWeightEl.value = '';
    // ref.TypePrise.innerHTML = '';
    // ref.totalPrice.innerHTML = '';
    ref.colorPreview.removeAttribute('data-w3-color');

    const inputColors = Array.from(ref.inputColor);
    inputColors.map((e) => {
      return (e.disabled = true);
    });
    ref.inputEl.value = '';
    // ref.RalPrise.innerHTML = '';

    fetchColor(selectType, typeList);
  });

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
      ? (ref.colorPreview.style.backgroundColor = filterRAL[0].hex)
      : ref.colorPreview.setAttribute('data-w3-color', `ncs(${searchQuery})`);
    w3SetColorsByAttribute();

    calcTotal();
  }
}

ref.inputEl.addEventListener('input', getNameSearchColor);

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
    ref.inputWeightEl.value = '';
    ref.TypePrise.innerHTML = '';
  }
  // ref.textUrl.innerHTML = `<a href=${filterType[0].url}>Посилання</a>`;
  ref.datalistWeightEl.innerHTML = createWeights(weights);
}

function getSearchName(ev) {
  const searchQuery = ev.target.value.trim();
  onInputChangeType(searchQuery);
}

ref.inputTypeEl.addEventListener('input', getSearchName);

function getSelectTypePrice() {
  selectWeight = ref.inputWeightEl.value;
  const inputColors = Array.from(ref.inputColor);

  inputColors.map((e) => {
    return (e.disabled = false);
  });

  selectTypePrice = paint[selectWeight];

  paint[selectWeight]
    ? (ref.TypePrise.innerHTML = selectTypePrice)
    : (ref.TypePrise.innerHTML = '');
}

ref.inputWeightEl.addEventListener('input', getSelectTypePrice);

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
  ref.datalistColor.innerHTML = createColor(color);
}

function typeList(t) {
  listTypeAll = t;
  ref.inputType.innerHTML = createType(t);
}

function calcTotal() {
  total =
    Number(selectWeight) * Number(selectColorPrise) + Number(selectTypePrice);
  ref.totalPrice.innerHTML = total;
}

// document
//   .querySelector('.button_submit')
//   .addEventListener('submit', function (e) {
//     e.preventDefault();
//     console.log('add');
//     // const formData = new FormData(form);
//     // console.log(formData);
//   });

// const handleSubmit = (e) => {
//   e.preventDefault();
//   // const formData = e.target.elements;

//   // const formData = new FormData();
//   // let response = await fetch('http://127.0.0.1:5500/', {
//   //   method: 'POST',
//   //   body: new FormData(form),
//   // });

//   // let result = await response.json();
//   // console.log(formData);
// };

// form.addEventListener('submit', handleSubmit);
// const location = window.location.toString();

function parseUrlQuery() {
  if (location.search) {
    let pair = decodeURIComponent(location.search).substr(1).split('&');
    for (let i = 0; i < pair.length; i++) {
      let param = pair[i].split('=');
      data[param[0]] = param[1];
    }
  }

  return data;
}

async function startData(data) {
  if (Object.keys(data).length !== 0) {
    document
      .querySelector(`input[value="${data.structure}"]`)
      .setAttribute('checked', true);

    await fetchColor(data.structure, typeList);
    selectType = data.structure;
    const searchStructure = data.structureSearch.replaceAll('+', ' ');

    ref.inputTypeEl.value = searchStructure;

    onInputChangeType(searchStructure);

    ref.inputWeightEl.value = data.weightSearch;

    getSelectTypePrice();
    document
      .querySelector(`input[value="${data.color}"]`)
      .setAttribute('checked', true);

    await fetchColor(data.color, colorList);

    ref.inputEl.disabled = false;

    ref.inputEl.value = data.colorSearch;
    onInputChangeColor(data.colorSearch);
  }
}

const form = document.querySelector('.calc-form');

function sendEmail(formData) {
  Email.send({
    SecureToken: 'd64bb1e5-28cc-4533-8a48-6b2beab954a0',
    To: 'mariashkam@ukr.net',
    From: 'm.p.mazurok@gmail.com',
    Subject: 'Замовлення',
    Body: `Група - ${formData.get(
      'structure'
    )}. <br/> Тип структури: - ${formData.get(
      'structureSearch'
    )}.<br/> Фасовка - ${formData.get(
      'weightSearch'
    )}. <br/> Палітра - ${formData.get('color')}.<br/> Колір - ${formData.get(
      'colorSearch'
    )}.<br/> Загальна вартість - ${total}.<br/>
    Телефон: ${formData.get('phone')}.<br/> 
    Ім'я: ${formData.get('name')}.`,
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

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
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
