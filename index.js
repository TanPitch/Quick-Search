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
function selectSearch(el) {
  header.style.display = "flex";
  search_result.style.display = "none";

  // header and sections
  document.querySelector("#page_detail_header span").textContent = data[0].name;
  document.querySelector("#header_row").innerHTML = "&nbsp;";
  data[0].section.forEach((el) => {
    document.querySelector("#header_row").innerHTML += `<div onclick="goSection(this)">${el}</div>`;
  });

  // console.log(data[0].md);
  loadMD(data[0].md, "text");
}

// quick dose, from search lists
function selectCalculate(el) {
  event.stopPropagation();

  // console.log(data[el].dose);
  selectSearch(el);
  search_result.style.display = "none";

  const dose = Number(data[el].dose.split("-")[0].split("*")[0]);
  const dose_unit = data[el].dose.split("-")[0].split("*")[1];
  const freq = data[0].dose.split("-")[1];

  var amount = null;
  var amount_unit = null;
  if (data[el].dose.split("-")[2] != null) {
    amount = Number(data[el].dose.split("-")[2].split("*")[0]);
    amount_unit = data[el].dose.split("-")[2].split("*")[1];
    openCalculator(dose, dose_unit, freq, amount, amount_unit.split("/"));
  } else openCalculator(dose, dose_unit, freq);
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
  doSearch(el.textContent);
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

// scroll to top
btn_up.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  searchBox.focus();
});

// #region : load md file

// TODO: custom md code
const renderer = {
  link(href, title, text) {
    if (href.match(/@drug-[0-9]/g)) {
      const dose = Number(href.split("-")[1].split("*")[0]);
      const dose_unit = href.split("-")[1].split("*")[1];
      const freq = href.split("-")[2];

      var amount = null;
      var amount_unit = null;
      if (href.split("-")[3] != null) {
        amount = Number(href.split("-")[3].split("*")[0]);
        amount_unit = href.split("-")[3].split("*")[1];
        return `<span onclick="openCalculator(${dose}, '${dose_unit}', '${freq}', ${amount}, ['${
          amount_unit.split("/")[0]
        }','${amount_unit.split("/")[1]}'])" class="drug_dose">${text}</span>`;
      }

      return `<span onclick="openCalculator(${dose}, '${dose_unit}', '${freq}')" class="drug_dose">${text}</span>`;
    }

    switch (href) {
      case "@find":
        return `<span class="btn hover-text" onclick="textSearch(this)">${text}</span>`;
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

      case "@br":
        return `<br>`;
      case "@center":
        return `<center>${text}</center>`;
      case "@li":
        return `<li>${text}`;

      default:
        return `<a href="${href}">${text}</a>`;
    }
  },
};
marked.use({ renderer });

// replace symbol TODO:
function loadMD(input, type = "link") {
  document.querySelector("#page_content").innerHTML = "";

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
    document.querySelector("#page_content").innerHTML = marked.parse(input);
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
    "#up#": "↑",
    "#dn#": "↓",
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

function openCalculator(dose = 0, dose_unit = "mg", freq = "od", amount = 0, amount_unit = ["mg", "ml"]) {
  // reset value
  input_wt.value = "";
  input_dose.value = dose == 0 ? "" : Number(dose);
  input_amount.value = amount == 0 ? "" : Number(amount);

  dose_wt_unit = "kg";
  dose_dose_unit = dose_unit;
  dose_freq_unit = freq;
  dose_amount_unit = amount_unit;

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
  const perSingle = wt * dose;
  const perDay = perSingle * freq;
  const singleLiquid = dose_amount_unit[1] == "ml" ? perSingle / amount_wt : (1000 * perSingle) / amount_wt;

  // show result
  document.querySelectorAll(".dose_result_row div")[0].textContent =
    perSingle == 0 ? "--" : wtConv(perSingle);
  document.querySelectorAll(".dose_result_row div")[1].textContent = perSingle == 0 ? "--" : wtConv(perDay);
  document.querySelectorAll(".dose_result_row div")[2].textContent =
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
