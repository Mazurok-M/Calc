const BASE_URL =
  'https://opensheet.elk.sh/1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';

const ref = {
  RalName: document.querySelector('.color-list'),
  RalPrise: document.querySelector('.ral-prise'),
  inputEl: document.querySelector('#search-box'),
  inputType: document.querySelector('.type-datalist'),
  datalistColor: document.querySelector('.color-datalist'),
  inputTypeEl: document.querySelector('#search-box-type'),
  datalistWeightEl: document.querySelector('.weight-datalist'),
  inputWeightEl: document.querySelector('#search-weight'),
  TypePrise: document.querySelector('.type-prise'),
  inputColor: document.querySelectorAll('.colour_input'),
  textUrl: document.querySelector('.url'),
  totalPrice: document.querySelector('.total_price'),
  buttonCalc: document.querySelector('.button_calc'),
};

let listAllColor;
let listTypeAll;
let weights = [];
let paint;
let selectType;
let total = 0;

// Вага inputWeightEl
let selectWeight;
// Ціна структури TypePrise
let selectTypePrice;
// Ціна за колір RalPrise:
let selectColorPrise;

document
  .querySelector('.colour_management')
  .addEventListener('change', function (e) {
    const select = e.target.value;
    ref.inputEl.disabled = false;
    ref.inputEl.value = '';
    ref.RalPrise.innerHTML = '';
    fetchColor(select, colorList);
  });

document.querySelector('.type_select').addEventListener('change', function (e) {
  selectType = e.target.value;
  ref.inputTypeEl.value = '';
  ref.inputWeightEl.value = '';
  ref.TypePrise.innerHTML = '';
  ref.totalPrice.innerHTML = '';

  const inputColors = Array.from(ref.inputColor);
  inputColors.map((e) => {
    return (e.disabled = true);
  });
  ref.inputEl.value = '';
  ref.RalPrise.innerHTML = '';

  fetchColor(selectType, typeList);
});

function onInputChangeRAL(ev) {
  const searchQuery = ev.target.value.trim();

  const filterRAL = listAllColor.filter((col) => col.number === searchQuery);

  if (filterRAL.length === 1) {
    selectColorPrise = filterRAL[0][selectType];
    ref.RalPrise.innerHTML = filterRAL[0][selectType];
  } else {
    ref.RalPrise.innerHTML = '';
  }
}

ref.inputEl.addEventListener('input', onInputChangeRAL);

function onInputChangeType(ev) {
  weights = [];

  const searchQuery = ev.target.value.trim();

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
  ref.textUrl.innerHTML = `<a href=${filterType[0].url}>Посилання</a>`;
  ref.datalistWeightEl.innerHTML = createWeights(weights);
}

ref.inputTypeEl.addEventListener('input', onInputChangeType);

ref.inputWeightEl.addEventListener('input', function () {
  selectWeight = ref.inputWeightEl.value;

  const inputColors = Array.from(ref.inputColor);

  inputColors.map((e) => {
    return (e.disabled = false);
  });
  selectTypePrice = paint[selectWeight];
  paint[selectWeight]
    ? (ref.TypePrise.innerHTML = paint[selectWeight])
    : (ref.TypePrise.innerHTML = '');
});

const listPriseRal = (range) => {
  return fetch(`${BASE_URL}/${range}`).then((res) => {
    if (!res.ok) {
      throw new Error(response.status);
    }
    return res.json();
  });
};

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

function fetchColor(e, f) {
  listPriseRal(e).then(f);
}

function colorList(color) {
  listAllColor = color;
  ref.datalistColor.innerHTML = createColor(color);
}

function typeList(t) {
  listTypeAll = t;
  ref.inputType.innerHTML = createType(t);
}

function calcTotal(event) {
  // console.log(event);
  event.preventDefault();
  total =
    Number(selectWeight) * Number(selectColorPrise) + Number(selectTypePrice);
  ref.totalPrice.innerHTML = total;
}

ref.buttonCalc.addEventListener('click', calcTotal);
