/*

TODO:

*/

// search box
const searchBox = document.querySelector("#searchBox");
const btn_clear = document.querySelector("#btn_clear");
const search_result = document.querySelector("#search_result");
btn_clear.addEventListener("click", () => {
  search_result.style.display = "none";
  searchBox.value = "";
  searchBox.focus();
});

// load data from data.json
var data = [];
// fetch("data.json")
//   .then((response) => response.text())
//   .then((el) => {
//     data = JSON.parse(el).data;
//   })
//   .catch((error) => {
//     console.error("Error fetching Data:", error);
//   });

const fetchGoogleSheet = () => {
  let SHEET_ID = "1VQF9haKweXuHXXjvA4J2WA8GcF_nepB9LnFIOSbMqFc";
  let SHEET_TITLE = "md_db";
  // let SHEET_RANGE = "A1:L2000";

  let FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}`;
  // "&range=" +
  // SHEET_RANGE;

  fetch(FULL_URL)
    .then((res) => res.text())
    .then((rep) => {
      let rawdata = JSON.parse(rep.substr(47).slice(0, -2));
      let outputdata = rawdata.table.rows;

      // dataArray
      var rowKey = ["name", "sub", "tag", "section", "dose", "md"];
      for (let i = 1; i < rawdata.table.rows.length; i++) {
        var rowData = {};
        for (let j = 0; j < rowKey.length; j++) {
          var parseObj = outputdata[i].c[j];
          var parseData = parseObj == null ? "" : parseObj.v;
          parseData = parseData == null ? "" : parseData;
          if (rowKey[j] == "section" || rowKey[j] == "tag")
            parseData = parseData.replaceAll('["', "").replaceAll('"]', "").split('","');
          rowData[rowKey[j]] = parseData;
        }

        data.push(rowData);
        // console.log(data);
      }
    })
    .catch((error) => {
      console.log("fetch google sheet fail");
    });
};
fetchGoogleSheet();

// jump to each section
function goSection(el) {
  var input_text = el.textContent.trim();
  const dict = [["Ped Dose", "Pediatric Dose"]];
  for (let i = 0; i < dict.length; i++) {
    if (dict[i][0] == input_text) {
      input_text = dict[i][1];
      break;
    }
  }

  const headers = document.querySelectorAll("h3");
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].textContent.trim() == input_text) {
      headers[i].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      break;
    }
  }
}

// page, from search lists
function selectSearch(i) {
  header.style.display = "flex";
  search_result.style.display = "none";

  // header and sections
  document.querySelector("#page_detail_header span").textContent = data[i].name;
  document.querySelector("#header_row").innerHTML = "&nbsp;";
  data[i].section.forEach((el) => {
    document.querySelector("#header_row").innerHTML += `<div onclick="goSection(this)">${el}</div>`;
  });

  // console.log(data[0].md);
  loadMD(data[i].md, "text");
}

// quick dose, from search lists TODO:
function selectCalculate(el) {
  event.stopPropagation();

  selectSearch(el);
  search_result.style.display = "none";

  const result = {};
  const element = data[el].dose.split("-");
  element.forEach((element) => {
    if (element.startsWith("#doseMax")) {
      result.dose_max = element.split("*")[1] ? element.split("*")[1] : null;
      result.dose_max_unit = element.split("*")[2] ? element.split("*")[2] : null;
    } else if (element.startsWith("#dose")) {
      const doseArray = element.split("*");
      result.dose = doseArray[1];
      result.dose_unit = doseArray[2];
      result.dose_range = doseArray[3] && doseArray[4] && doseArray[5] ? [doseArray[3], doseArray[4]] : null;
      result.dose_range_unit = doseArray[3] && doseArray[4] && doseArray[5] ? doseArray[5] : null;
    } else if (element.startsWith("#freq")) {
      result.freq = element.split("*")[1];
      result.freq_range = element.split("*")[2] ? element.split("*")[2] : null;
    } else if (element.startsWith("#amount")) {
      const amountArray = element.split("*");
      result.amount = amountArray[1];
      result.amount_unit = [amountArray[2], amountArray[3]];
    }
  });

  openCalculator(
    result.dose,
    result.dose_unit,
    result.freq,
    result.amount,
    result.amount_unit,
    result.dose_range,
    result.dose_range_unit,
    result.dose_max,
    result.dose_max_unit,
    result.freq_range
  );
}

function doSearch(input_value) {
  if (data.length <= 0) return;

  const value = input_value.toLowerCase().trim();
  const result = [];

  search_result.style.transform =
    window.scrollY > header.offsetTop + 40 ? "translateY(36px)" : "translateY(0)";

  if (value == "" || value.length < 3) {
    search_result.style.display = "none";
    return;
  } else {
    search_result.style.display = "block";

    // generate result
    search_result.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].tag.length; j++) {
        if (data[i].tag[j].includes(value)) {
          result.push({ index: i, data: data[i] });
          break;
        }
      }
      if (result.length > 4) break;
    }

    result.forEach((el) => {
      search_result.innerHTML += `<div class="found" onclick="selectSearch('${el.index}')"><div><span>${el.data.name}</span><span>${el.data.sub}</span></div><span onclick="selectCalculate('${el.index}')" class="material-symbols-outlined">function</span></div>`;
    });
  }
}
const textSearch = (el) => {
  searchBox.value = el.textContent;
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  doSearch(el.textContent);
};
const textSection = (el) => {
  goSection(el);
};
searchBox.addEventListener("click", () => {
  doSearch(searchBox.value);
});
searchBox.addEventListener("input", () => {
  doSearch(searchBox.value);
});

// fix header
const header = document.querySelector("#page_detail_header");
const content = document.querySelector("#page_content");
const btn_up = document.querySelector("#btn_up");
const btn_cal = document.querySelector("#btn_cal");
window.onscroll = () => {
  search_result.style.display = "none";
  if (window.scrollY > header.offsetTop + 44) {
    header.classList.add("sticky");
    btn_up.style.display = "block";
    btn_cal.style.transform = "translateX(-50px)";
    content.style.paddingTop = "123px";
  } else {
    header.classList.remove("sticky");
    btn_up.style.display = "none";
    btn_cal.style.transform = "";
    content.style.paddingTop = "";
  }
};

// scroll to top TEST:
btn_up.addEventListener("click", () => {
  const duration = 1000; // desired duration in milliseconds
  const startScrollY = window.scrollY;
  const startTime = performance.now();

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function scrollStepFunction(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = elapsed / duration;
    const easedProgress = easeInOut(progress);
    const scrollStep = startScrollY * (1 - easedProgress);

    if (progress < 1) {
      window.scrollTo(0, scrollStep);
      requestAnimationFrame(scrollStepFunction);
    } else {
      window.scrollTo(0, 0);
    }
  }

  requestAnimationFrame(scrollStepFunction);

  // window.scrollTo({ top: 0, behavior: "smooth" });
  // document
  //   .querySelector("#top_div")
  //   .scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  searchBox.focus();
});

// #region : load md file

// TODO: custom md code
const renderer = {
  link(href, title, text) {
    if (href.match(/@drug-/g)) {
      const result = {};
      const el = href.split("-");
      el.forEach((element) => {
        if (element.startsWith("#doseMax")) {
          result.dose_max = element.split("*")[1] ? element.split("*")[1] : null;
          result.dose_max_unit = element.split("*")[2] ? element.split("*")[2] : null;
        } else if (element.startsWith("#dose")) {
          const doseArray = element.split("*");
          result.dose = doseArray[1];
          result.dose_unit = doseArray[2];
          result.dose_range =
            doseArray[3] && doseArray[4] && doseArray[5] ? [doseArray[3], doseArray[4]] : null;
          result.dose_range_unit = doseArray[3] && doseArray[4] && doseArray[5] ? doseArray[5] : null;
        } else if (element.startsWith("#freq")) {
          result.freq = element.split("*")[1];
          result.freq_range = element.split("*")[2] ? element.split("*")[2] : null;
        } else if (element.startsWith("#amount")) {
          const amountArray = element.split("*");
          result.amount = amountArray[1];
          result.amount_unit = [amountArray[2], amountArray[3]];
        }
      });

      return `<span onclick="openCalculator(${result.dose}, '${result.dose_unit}', '${result.freq}', ${result.amount}, '${result.amount_unit}', '${result.dose_range}', '${result.dose_range_unit}', ${result.dose_max}, '${result.dose_max_unit}', '${result.freq_range}')" class="drug_dose">${text}</span>`;
    }

    switch (href) {
      case "@find":
        return `<span class="btn hover-text" onclick="textSearch(this)">${text}</span>`;
      case "@section":
        return `<span class="btn hover-text" onclick="textSection(this)">${text}</span>`;

      case "@text_grey":
        return `<span class="text-grey">${text}</span>`;
      case "@text_brown":
        return `<span class="text-brown">${text}</span>`;
      case "@text_orange":
        return `<span class="text-orange">${text}</span>`;
      case "@text_yellow":
        return `<span class="text-yellow">${text}</span>`;
      case "@text_green":
        return `<span class="text-green">${text}</span>`;
      case "@text_blue":
        return `<span class="text-blue">${text}</span>`;
      case "@text_purple":
        return `<span class="text-purple">${text}</span>`;
      case "@text_pink":
        return `<span class="text-pink">${text}</span>`;
      case "@text_red":
        return `<span class="text-red">${text}</span>`;

      case "@bg_grey":
        return `<span class="bg-grey">${text}</span>`;
      case "@bg_brown":
        return `<span class="bg-brown">${text}</span>`;
      case "@bg_orange":
        return `<span class="bg-orange">${text}</span>`;
      case "@bg_yellow":
        return `<span class="bg-yellow">${text}</span>`;
      case "@bg_green":
        return `<span class="bg-green">${text}</span>`;
      case "@bg_blue":
        return `<span class="bg-blue">${text}</span>`;
      case "@bg_purple":
        return `<span class="bg-purple">${text}</span>`;
      case "@bg_pink":
        return `<span class="bg-pink">${text}</span>`;
      case "@bg_red":
        return `<span class="bg-red">${text}</span>`;

      case "@under":
        return `<span class="text-under">${text}</span>`;

      case "@br":
        return `<br>`;
      case "@center":
        return `<center>${text}</center>`;
      case "@li":
        return `<li>${text}`;
      case "@li_sub":
        return `<ul>${text}</ul>`;

      default:
        return `<a href="${href}">${text}</a>`;
    }
  },
};
marked.use({ renderer });

// replace symbol TODO:
function loadMD(input, type = "link") {
  document.querySelector("#page_content").innerHTML = "<div id='top_div'></div>";

  if (type == "link") {
    fetch(input)
      .then((response) => response.text())
      .then((markdown) => {
        document.querySelector("#page_content").innerHTML = marked.parse(markdown);
      })
      .catch((error) => {
        console.error("Error fetching Markdown:", error);
      });
  } else if (type == "text") {
    document.querySelector("#page_content").innerHTML += marked.parse(input);
  }

  // clean blank table
  document.querySelectorAll("th").forEach((el) => {
    if (el.textContent == "") el.remove();
  });

  // replace symbol TODO:
  const symbols_dict = {
    ">=": "≥",
    "<=": "≤",
    "!=": "≠",
    "#<-)#": "↶",
    "#(->#": "↷",
    "#(<-)#": "↺",
    "#(->)#": "↻",
    "->": "→",
    "<-": "←",
    "=>": "⇒",
    "=<": "⇐",
    "|->": "↦",
    "<-|": "↤",
    "#up#": "↑",
    "#dn#": "↓",
    "#updb": "⇑",
    "#dndb": "⇓",
    "#upbar#": "↥",
    "#dnbar#": "↧",
    "#triup#": "▲",
    "#tridn#": "▼",
    "#rtlt#": "⇄",
    "#ltrt#": "⇆",
    "#updn#": "⇅",
    "#dnup#": "⇵",
    "#notlt#": "⇷",
    "#notrt#": "⇸",
  };
  document.body.querySelectorAll("*").forEach((el) => {
    if (el.nodeType === Node.ELEMENT_NODE) replaceInTextNodes(el, symbols_dict);
  });

  function replaceInTextNodes(node, dict) {
    if (node.nodeType === Node.TEXT_NODE) {
      let newText = node.textContent;
      Object.entries(dict).forEach(([key, value]) => {
        newText = newText.replaceAll(key, value);
      });
      node.textContent = newText;
    } else {
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) {
        replaceInTextNodes(children[i], dict);
      }
    }
  }
}

const mdfile =
  "https://gist.githubusercontent.com/rt2zz/e0a1d6ab2682d2c47746950b84c0b6ee/raw/83b8b4814c3417111b9b9bef86a552608506603e/markdown-sample.md";
const localmd = "md.md";
// loadMD(localmd);

// #endregion

// #region : dose calculator

var dose_wt_unit = "kg";
var dose_dose_unit = "mg";
var dose_freq_unit = "od";
var dose_amount_unit = ["mg", "ml"];

const page_dose = document.querySelector("#page_dose");
const input_wt = document.querySelectorAll("#page_dose input")[0];
const input_dose = document.querySelectorAll("#page_dose input")[1];
const input_amount = document.querySelectorAll("#page_dose input")[2];

const dose_wt_kg = document.querySelectorAll(".row_btn span")[0];
const dose_wt_lb = document.querySelectorAll(".row_btn span")[1];
const dose_dose_mg = document.querySelectorAll(".row_btn span")[2];
const dose_dose_g = document.querySelectorAll(".row_btn span")[3];
const dose_dose_mcg = document.querySelectorAll(".row_btn span")[4];
const dose_freq_od = document.querySelectorAll(".row_btn span")[5];
const dose_freq_bid = document.querySelectorAll(".row_btn span")[6];
const dose_freq_tid = document.querySelectorAll(".row_btn span")[7];
const dose_freq_qid = document.querySelectorAll(".row_btn span")[8];
const dose_freq_q4 = document.querySelectorAll(".row_btn span")[9];
const dose_freq_q3 = document.querySelectorAll(".row_btn span")[10];
const dose_freq_q2 = document.querySelectorAll(".row_btn span")[11];
const dose_freq_q1 = document.querySelectorAll(".row_btn span")[12];
const dose_amount_mg = document.querySelectorAll(".row_btn span")[13];
const dose_amount_g = document.querySelectorAll(".row_btn span")[14];
const dose_amount_mcg = document.querySelectorAll(".row_btn span")[15];
const dose_amount_ml = document.querySelectorAll(".row_btn span")[16];
const dose_amount_l = document.querySelectorAll(".row_btn span")[17];

const dose_el_alert = document.querySelectorAll(".dose_detail div")[0];
const dose_el_detail = document.querySelectorAll(".dose_detail div")[1];
const freq_el_detail = document.querySelectorAll(".dose_detail")[1];

function openCalculator(
  dose = 0,
  dose_unit = "mg",
  freq = "od",
  amount = 0,
  amount_unit = undefined,
  dose_range = "null",
  dose_range_unit = "null",
  dose_max = undefined,
  dose_max_unit = null,
  freq_range = "null"
) {
  // reset value
  input_wt.value = "";
  input_dose.value = dose == 0 ? "" : Number(dose);
  input_amount.value = amount == 0 ? "" : Number(amount);

  dose_wt_unit = "kg";
  dose_dose_unit = dose_unit;
  dose_freq_unit = freq;
  dose_amount_unit = amount_unit == undefined ? ["mg", "ml"] : amount_unit.split(",");

  dose_range_array = dose_range == "null" || dose_range == null ? null : dose_range.split(",");
  dose_range_unit = dose_range_unit == "null" || dose_range_unit == null ? null : dose_range_unit;
  dose_max = dose_max == undefined ? null : dose_max;
  dose_max_unit = dose_max == null ? null : dose_max_unit;

  dose_wt_kg.className = "selected";
  dose_wt_lb.className = "";

  dose_dose_mg.className = "";
  dose_dose_g.className = "";
  dose_dose_mcg.className = "";
  switch (dose_dose_unit) {
    case "mg":
      dose_dose_mg.className = "selected";
      break;
    case "g":
      dose_dose_g.className = "selected";
      break;
    case "mcg":
      dose_dose_mcg.className = "selected";
      break;
  }

  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  switch (dose_freq_unit) {
    case "od":
      dose_freq_od.className = "selected";
      break;
    case "bid":
      dose_freq_bid.className = "selected";
      break;
    case "tid":
      dose_freq_tid.className = "selected";
      break;
    case "qid":
      dose_freq_qid.className = "selected";
      break;
    case "q4":
      dose_freq_q4.className = "selected";
      break;
    case "q3":
      dose_freq_q3.className = "selected";
      break;
    case "q2":
      dose_freq_q2.className = "selected";
      break;
    case "q1":
      dose_freq_q1.className = "selected";
      break;
  }

  dose_amount_mg.className = "";
  dose_amount_g.className = "";
  dose_amount_mcg.className = "";
  switch (dose_amount_unit[0]) {
    case "mg":
      dose_amount_mg.className = "selected";
      break;
    case "g":
      dose_amount_g.className = "selected";
      break;
    case "mcg":
      dose_amount_mcg.className = "selected";
      break;
  }

  dose_amount_ml.className = "";
  dose_amount_l.className = "";
  switch (dose_amount_unit[1]) {
    case "ml":
      dose_amount_ml.className = "selected";
      break;
    case "l":
      dose_amount_l.className = "selected";
      break;
  }

  document.querySelectorAll(".dose_result_row div")[0].textContent = "--";
  document.querySelectorAll(".dose_result_row div")[1].textContent = "--";
  document.querySelectorAll(".dose_result_row div")[2].textContent = "--";

  document.querySelectorAll(".dose_row")[1].style.backgroundColor = "";

  dose_el_alert.textContent = dose_max == null ? "" : `* max dose ${dose_max} ${dose_max_unit}`;
  dose_el_detail.textContent =
    dose_range_array == null ? "" : `(${dose_range_array[0]} - ${dose_range_array[1]} ${dose_range_unit})`;
  freq_el_detail.textContent = freq_range == null || freq_range.trim() == "null" ? "" : `* (${freq_range})`;
  document.querySelectorAll(".dose_detail")[0].style.display =
    dose_el_alert.textContent == "" && dose_el_detail.textContent == "" ? "none" : "flex";

  page_dose.style.transition = "transform .2s ease-out";
  page_dose.style.transform = "translateX(0)";

  input_wt.focus();
}
btn_cal.addEventListener("click", () => {
  openCalculator();
});

document.querySelector("#btn_back").addEventListener("click", () => {
  page_dose.style.transform = "translateX(100%)";
});

dose_wt_kg.addEventListener("click", () => {
  dose_wt_kg.className = "selected";
  dose_wt_lb.className = "";
  dose_wt_unit = "kg";

  doCalculate();
});
dose_wt_lb.addEventListener("click", () => {
  dose_wt_kg.className = "";
  dose_wt_lb.className = "selected";
  dose_wt_unit = "lb";

  doCalculate();
});

dose_dose_mg.addEventListener("click", () => {
  dose_dose_mg.className = "selected";
  dose_dose_g.className = "";
  dose_dose_mcg.className = "";
  dose_dose_unit = "mg";

  doCalculate();
});
dose_dose_g.addEventListener("click", () => {
  dose_dose_mg.className = "";
  dose_dose_g.className = "selected";
  dose_dose_mcg.className = "";
  dose_dose_unit = "g";

  doCalculate();
});
dose_dose_mcg.addEventListener("click", () => {
  dose_dose_mg.className = "";
  dose_dose_g.className = "";
  dose_dose_mcg.className = "selected";
  dose_dose_unit = "mcg";

  doCalculate();
});

dose_freq_od.addEventListener("click", () => {
  dose_freq_od.className = "selected";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  dose_freq_unit = "od";

  doCalculate();
});
dose_freq_bid.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "selected";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  dose_freq_unit = "bid";

  doCalculate();
});
dose_freq_tid.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "selected";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  dose_freq_unit = "tid";

  doCalculate();
});
dose_freq_qid.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "selected";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  dose_freq_unit = "qid";

  doCalculate();
});
dose_freq_q4.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "selected";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  dose_freq_unit = "q4";

  doCalculate();
});
dose_freq_q3.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "selected";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "";
  dose_freq_unit = "q3";

  doCalculate();
});
dose_freq_q2.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "selected";
  dose_freq_q1.className = "";
  dose_freq_unit = "q2";

  doCalculate();
});
dose_freq_q1.addEventListener("click", () => {
  dose_freq_od.className = "";
  dose_freq_bid.className = "";
  dose_freq_tid.className = "";
  dose_freq_qid.className = "";
  dose_freq_q4.className = "";
  dose_freq_q3.className = "";
  dose_freq_q2.className = "";
  dose_freq_q1.className = "selected";
  dose_freq_unit = "q1";

  doCalculate();
});

dose_amount_mg.addEventListener("click", () => {
  dose_amount_mg.className = "selected";
  dose_amount_g.className = "";
  dose_amount_mcg.className = "";
  dose_amount_unit[0] = "mg";

  doCalculate();
});
dose_amount_g.addEventListener("click", () => {
  dose_amount_mg.className = "";
  dose_amount_g.className = "selected";
  dose_amount_mcg.className = "";
  dose_amount_unit[0] = "g";

  doCalculate();
});
dose_amount_mcg.addEventListener("click", () => {
  dose_amount_mg.className = "";
  dose_amount_g.className = "";
  dose_amount_mcg.className = "selected";
  dose_amount_unit[0] = "mcg";

  doCalculate();
});
dose_amount_ml.addEventListener("click", () => {
  dose_amount_ml.className = "selected";
  dose_amount_l.className = "";
  dose_amount_unit[1] = "ml";

  doCalculate();
});
dose_amount_l.addEventListener("click", () => {
  dose_amount_ml.className = "";
  dose_amount_l.className = "selected";
  dose_amount_unit[1] = "l";

  doCalculate();
});

input_wt.addEventListener("input", () => doCalculate());
input_dose.addEventListener("input", () => doCalculate());
input_amount.addEventListener("input", () => doCalculate());

function doCalculate() {
  const wt = dose_wt_unit == "kg" ? Number(input_wt.value) : input_wt.value * 0.45359237;
  const dose =
    dose_dose_unit == "mg"
      ? Number(input_dose.value)
      : dose_dose_unit == "g"
      ? input_dose.value * 1000
      : input_dose.value / 1000;
  var freq;
  switch (dose_freq_unit) {
    case "od":
      freq = 1;
      break;
    case "bid":
      freq = 2;
      break;
    case "tid":
      freq = 3;
      break;
    case "qid":
      freq = 4;
      break;
    case "q4":
      freq = 6;
      break;
    case "q3":
      freq = 8;
      break;
    case "q2":
      freq = 12;
      break;
    case "q1":
      freq = 24;
      break;
  }
  const amount_wt =
    dose_amount_unit[0] == "mg"
      ? Number(input_amount.value)
      : dose_amount_unit[0] == "g"
      ? input_amount.value * 1000
      : input_amount.value / 1000;

  const wtConv = (wt) => {
    return wt >= 1000
      ? `${(wt / 1000).toLocaleString()} g`
      : wt < 0.1
      ? `${(wt * 1000).toLocaleString()} mcg`
      : `${wt.toLocaleString()} mg`;
  };

  const fixedNum = (num, i = 3) => {
    return Math.round(num * Math.pow(10, i)) / Math.pow(10, i);
  };

  // overdose alert TODO:
  const get_dose_unit = dose_el_detail.textContent.match(/[a-z]+/g)
    ? dose_el_detail.textContent.match(/[a-z]+/g)[0]
    : null;
  if (get_dose_unit != null) {
    const get_dose_range = dose_el_detail.textContent.match(/\d+\.*\d+/g).map((el) => {
      switch (get_dose_unit) {
        case "mg":
          return Number(el);
          break;
        case "g":
          return Number(el) * 1000;
          break;
        case "mcg":
          return Number(el) / 1000;
          break;
      }
    });

    const alertColor = getComputedStyle(document.documentElement).getPropertyValue("--alert");
    document.querySelectorAll(".dose_row")[1].style.backgroundColor =
      dose < get_dose_range[0] || dose > get_dose_range[1] ? alertColor : "";
  }

  const perSingle = wt * dose; // single dose
  const perDay = fixedNum(perSingle * freq); // daily dose
  const singleLiquid = dose_amount_unit[1] == "ml" ? perSingle / amount_wt : (1000 * perSingle) / amount_wt;
  const dayKg = fixedNum(dose * freq); // daily dose per kg

  // show result
  document.querySelectorAll(".dose_result_row div")[0].textContent =
    perSingle == 0 ? "--" : wtConv(perSingle);
  document.querySelectorAll(".dose_result_row div")[1].textContent = perSingle == 0 ? "--" : wtConv(perDay);
  document.querySelectorAll(".dose_result_row div")[2].textContent =
    fixedNum(dayKg, 2) % 1 == 0 ? `(${fixedNum(dayKg, 2)} ${dose_dose_unit}/kg)` : "";
  document.querySelectorAll(".dose_result_row")[2].style.display =
    document.querySelectorAll(".dose_result_row div")[2].textContent == "" ? "none" : "flex";
  document.querySelectorAll(".dose_result_row div")[3].textContent =
    singleLiquid == Infinity || isNaN(singleLiquid)
      ? "--"
      : singleLiquid >= 1000
      ? `${(singleLiquid / 1000).toLocaleString()} L`
      : `${singleLiquid.toLocaleString()} mL`;
}

input_wt.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    input_dose.focus();
  }
});
input_dose.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    input_amount.focus();
  }
});

// #endregion
