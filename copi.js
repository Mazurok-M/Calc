// 'https://opensheet.elk.sh/1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';
// const baseImg = `./img/foto.png`;

// ==========================================================================================

// const API_KEY = 'AIzaSyDohOM_n40285L0LR1U14ICvBE0ZPZu3NQ';

// const DISCOVERY_DOC =
//   'https://sheets.googleapis.com/$discovery/rest?version=v4';

// const SPREADSHEET_ID = '1NEsvoEKcd_KShdoSBLzsTN6jgqXe0Kf9IpzYEy01eKI';

// const RANGE = 'List';

// listPriseRal();
// const start = () => {
//   gapi.client
//     .init({
//       apiKey: API_KEY,
//       discoveryDocs: [DISCOVERY_DOC],
//     })
//     .then(() => {
//       return gapi.client.sheets.spreadsheets.values.get({
//         spreadsheetId: SPREADSHEET_ID,
//         range: RANGE,
//       });
//     })
//     .then((response) => {
//       const loadedData = response.result.values;
//       console.log(loadedData);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// gapi.load('client', start);

/* <script src="https://apis.google.com/js/client.js"></script> */

// ===============================================

// function parseUrlQuery() {
//   if (location.search) {
//     let pair = decodeURIComponent(location.search).substr(1).split('&');
//     for (let i = 0; i < pair.length; i++) {
//       let param = pair[i].split('=');
//       data[param[0]] = param[1];
//     }
//   }

//   return data;
// }

// async function startData(data) {
//   if (Object.keys(data).length !== 0) {
//     document
//       .querySelector(`input[value="${data.structure}"]`)
//       .setAttribute("checked", true);

//     await fetchColor(data.structure, typeList);
//     selectType = data.structure;
//     const searchStructure = data.structureSearch.replaceAll("+", " ");

//     ref.searchStructureIn.value = searchStructure;

//     onInputChangeType(searchStructure);

//     ref.searchWeightIn.value = data.weightSearch;

//     getSelectTypePrice();
//     document
//       .querySelector(`input[value="${data.color}"]`)
//       .setAttribute("checked", true);

//     await fetchColor(data.color, colorList);

//     ref.searchColorIn.disabled = false;

//     ref.searchColorIn.value = data.colorSearch;
//     onInputChangeColor(data.colorSearch);
//   }
// }
