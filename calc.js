const BASE_URL =
  "https://opensheet.elk.sh/1N8DJQlZo0Fi7siUASnb_H4apluo8C5U5hN1_F94Kn2g";

const ref = {
  structureChangeEl: document.querySelector(".material"),

  structureListEl: document.querySelector(".structure__list"),

  searchWeightIn: document.querySelector("#weight-search"),
  weightListEl: document.querySelector(".weight__list"),
  weightUnitEl: document.querySelector(".weight__unit"),

  priseStructureEl: document.querySelector(".structure-prise__span"),

  searchColorIn: document.querySelector("#color-search"),
  colorListEl: document.querySelector(".color__list"),

  palletChangeEl: document.querySelector(".pallet"),
  palletSelectionIn: document.querySelectorAll(".pallet__input"),

  // colorPreviewEl: document.querySelector('.color__preview'),
  colorPreviewEl: document.querySelectorAll(".color__tumb"),
  totalPriceEl: document.querySelector(".total-price__span"),
  phoneEl: document.getElementById("phone"),
  but: document.querySelector(".calc-button"),
  form: document.querySelector(".calc-form"),
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
    console.error("Error fetching data:", error);
  }
}

// Вибирає  тип (pain, quartz, plaster) та отримуємо список структур
ref.structureChangeEl.addEventListener("change", changeStructure);

function changeStructure(e) {
  resetStructures();
  resetWeights();

  // =================================

  selectMaterial = e.target.value;

  getListData(selectMaterial, getStructureList);

  if (selectMaterial === "paint") {
    ref.weightUnitEl.innerHTML = ", л.";
  } else {
    ref.weightUnitEl.innerHTML = ", кг.";
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
  noResultsText: "По вашому запиту нічого не знайдено",
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
ref.structureListEl.addEventListener("change", onInputSelectStructure);

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
      if (structureSelect[key].trim() !== "" && !isNaN(key)) {
        weights.push(key);
      }
    });
  }

  createWeightsItems(weights);
}

// Відмальовуємо фасовку

const weightsList = new Choices(ref.weightListEl, {
  allowHTML: true,
  noResultsText: "По вашому запиту нічого не знайдено",
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

ref.searchWeightIn.addEventListener("change", getSelectWeight);

// отримуємо вибрану фасовку та виводимо ціну без тонування

function getSelectWeight() {
  const palletInputs = Array.from(ref.palletSelectionIn);

  // ========

  selectWeight = weightsList.getValue(true);

  palletInputs.map((e) => {
    return (e.disabled = false);
  });

  priseStructure = structureSelect[selectWeight];

  priseStructure = structureSelect[selectWeight] || "0";
  ref.priseStructureEl.innerHTML = priseStructure;

  if (colors.getValue(true)) {
    calcTotal();
  }
}

// ===============================================================

// ral NCS

ref.palletChangeEl.addEventListener("change", changePallet);

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
  noResultsText: "По вашому запиту нічого не знайдено",
  resetScrollPosition: false,
  searchResultLimit: 50,
  renderChoiceLimit: -1,
}).disable();

function createColorItems(e) {
  let item = [];
  if (selectPallet === "ral") {
    e.map(({ number, hex }) => {
      item.push({
        value: number,
        label: `<span>${number}</span><div class='color__item-bg' style="background-color: ${hex}"></div>`,
      });
    });
  } else {
    e.map(({ number }) => {
      item.push({
        value: number,
        label: `<span>${number}</span><div class='color__item-bg' data-w3-color="ncs(${number})" ></div>`,
      });
    });
  }

  colors.setChoices(item).enable();
}

document
  .querySelector(".color__wrap .choices__inner")
  .addEventListener("click", getBgColor);

function getBgColor() {
  if (selectPallet === "ncs") {
    w3SetColorsByAttribute();
  }
}

// ======================================================

ref.searchColorIn.addEventListener("change", onInputSelectColor);

function onInputSelectColor() {
  // ref.colorPreviewEl.innerHTML = "";
  const nameColor = colors.getValue(true);
  const filterColors = colorsList.filter((col) => col.number === nameColor);

  if (filterColors.length === 1) {
    selectColorPrise = filterColors[0][selectMaterial];
    if (selectPallet === "ncs") {
      Array.from(ref.colorPreviewEl).map((e) =>
        e.setAttribute("data-w3-color", `ncs(${nameColor})`)
      );
    } else {
      Array.from(ref.colorPreviewEl).map((e) => {
        e.removeAttribute("data-w3-color");
        e.style.backgroundColor = filterColors[0].hex;
      });
    }

    // if (filterColors[0].img1) {
    //   ref.colorPreviewEl.innerHTML = ` <div class="color__tumb">
    //   <img class="color__img" src=${filterColors[0].img1} alt="color visualization" />
    // </div>
    // <div class="color__tumb">
    //   <img class="color__img" src=${filterColors[0].img2} alt="color visualization" />
    // </div>`;
    // }

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
          value: "",
          label: "Виберіть матеріал",
          selected: true,
          disabled: true,
          placeholder: true,
        },
      ],
      "value",
      "label",
      true
    );
  }
}

function resetWeights() {
  if (weights.length >= 1) {
    weightsList.setChoices(
      [
        {
          value: "",
          label: "Виберіть фасовку",
          selected: true,
          disabled: true,
          placeholder: true,
        },
      ],
      "value",
      "label",
      true
    );
    weights = [];
  }

  ref.priseStructureEl.innerHTML = "0";
  ref.totalPriceEl.innerHTML = "0";
}

function resetColor() {
  if (colorsList) {
    colors.setChoices(
      [
        {
          value: "",
          label: "Виберіть колір",
          selected: true,
          disabled: true,
          placeholder: true,
        },
      ],
      "value",
      "label",
      true
    );
  }

  ref.totalPriceEl.innerHTML = "0";
  // ref.colorPreviewEl.innerHTML = "";
}

// ========================================
// Відправка емейла

ref.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(ref.form);
  sendEmail(formData);

  ref.but.setAttribute("disabled", "disabled");
});

function sendEmail(formData) {
  Email.send({
    SecureToken: "d64bb1e5-28cc-4533-8a48-6b2beab954a0",
    To: "mariashkam@ukr.net",
    From: "m.p.mazurok@gmail.com",
    Subject: "Замовлення",
    Body: `Група - ${formData.get(
      "material"
    )}. <br/> Наменування матеріалу: - ${formData.get(
      "structureSearch"
    )}.<br/> Фасовка - ${formData.get("weightSearch")} ${
      ref.weightUnitEl.innerHTML
    } <br/> Палітра - ${formData.get("pallet")}.<br/> Колір - ${formData.get(
      "colorSearch"
    )}.<br/> Загальна вартість - ${total} грн.<br/>
    Телефон: ${formData.get("phone")}.<br/> 
    ПІБ: ${formData.get("name")}.<br/>
    Коментар:  ${formData.get("comment")}.
    `,
  }).then((message) => {
    if (message === "OK") {
      alert(
        "Дякуємо за замовлення. Наш менеджер з Вами зв\u0027яжеться найближчим часом"
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
  ref.phoneEl.value = "+38";
};

let old = 0;

ref.phoneEl.onkeydown = function () {
  let curLen = ref.phoneEl.value.length;

  if (curLen < old) {
    old--;
    return;
  }

  if (curLen === 3) ref.phoneEl.value = ref.phoneEl.value + "(";
  if (curLen === 7) ref.phoneEl.value = ref.phoneEl.value + ")-";
  if (curLen === 12) ref.phoneEl.value = ref.phoneEl.value + "-";
  if (curLen === 15) ref.phoneEl.value = ref.phoneEl.value + "-";
  if (curLen > 17)
    ref.phoneEl.value = ref.phoneEl.value.substring(
      0,
      ref.phoneEl.value.length - 1
    );

  old++;
};
// ==================================================
