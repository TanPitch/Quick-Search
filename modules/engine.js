import { loadMD } from "./md.js";
import { gen_mdcal } from "./mdcal.js";

const url_search =
    "https://script.google.com/macros/s/AKfycbw5IoLW7iPUvHZd0q2CEK9A3yfx0pncDyZa2o4Jzg6kteCldameK3V0wZW2rVWNtZYk/exec";

const page_loader = document.querySelector("#page_loader");
page_loader.style.display = "flex";

var doc_tag = []; // tag for searching
var doc_data = {}; // display data

var fetchTag = false;

const header = document.querySelector("#page_detail_header");
const content = document.querySelector("#page_content");
const searchBox = document.querySelector("#searchBox");
const btn_clear = document.querySelector("#btn_clear");
const search_result = document.querySelector("#search_result");

// fetch search data
fetch(url_search, {
    redirect: "follow",
    method: "POST",
    body: JSON.stringify({ command: "index" }),
    headers: {
        "Content-type": "text/plain;charset=utf-8",
    },
})
    .then((res) => res.text())
    .then((rep) => {
        doc_tag = [...JSON.parse(rep).data.data];
        fetchTag = true;
        page_loader.style.display = "none";
    })
    .catch((error) => {
        console.log("fetch search lists fail");
    });

// create search result
function tags_search(input_value) {
    if (!fetchTag) return;
    if (doc_tag.length <= 0) return;

    const value = input_value.toLowerCase().trim();
    const result = [];

    search_result.style.transform =
        window.scrollY > header.offsetTop + 40 ? "translateY(36px)" : "translateY(0)";

    search_result.style.display = "none";
    if (value == "" || value.length < 3) return;

    // generate result
    search_result.style.display = "block";
    search_result.innerHTML = "";
    for (var i in doc_tag) {
        if (doc_tag[i].tags.some((item) => item.includes(value))) {
            result.push({ index: Number(i), value: doc_tag[i] });
        }
        if (result.length > 4) break;
    }

    result.forEach((el) => {
        const calculator = `<span onclick="selectCalculate('${el.index}')" class="material-symbols-outlined">function</span>`;
        search_result.innerHTML += `<div class="found" data-index="${el.index}">
      <div><span>${el.value.title}</span><span>${el.value.subtitle}</span></div>
      ${el.value.option.calculator ? calculator : ""}`;
    });
    search_result.querySelectorAll("div.found").forEach((el) => {
        el.addEventListener("click", () => generate_main(el.getAttribute("data-index")));
    });
}
searchBox.addEventListener("input", () => {
    tags_search(searchBox.value);
});

// clear search result
btn_clear.addEventListener("click", () => {
    search_result.style.display = "none";
    searchBox.value = "";
    searchBox.focus();
});

// fetch data
function generate_main(i) {
    if (!fetchTag) return;
    page_loader.style.display = "flex";

    doc_data = [];

    fetch(url_search, {
        redirect: "follow",
        method: "POST",
        body: JSON.stringify({ command: "data", index: i }),
        headers: {
            "Content-type": "text/plain;charset=utf-8",
        },
    })
        .then((res) => res.text())
        .then((rep) => {
            doc_data = JSON.parse(rep).data;
            page_loader.style.display = "none";

            header.style.display = "flex";
            search_result.style.display = "none";

            const page_detail = document.querySelector("#page_detail");
            const page_mdcal = document.querySelector("#page_mdcal");

            page_detail.style.display = "none";
            page_mdcal.style.display = "none";

            // header and sections
            document.querySelector("#page_detail_header span").textContent = doc_data.title;
            document.querySelector("#header_row").innerHTML = "&nbsp;";

            // data[i].section.forEach((el) => {
            //   document.querySelector("#header_row").innerHTML += `<div onclick="goSection(this)">${el}</div>`;
            // });

            // console.log(data[0].md);
            // btn_cal.style.display = data[i].dose.trim() == "" ? "none" : "flex";
            // console.log(doc_data.data);
            // loadMD(doc_data.data, "text");

            switch (doc_data.type) {
                case "md":
                    loadMD(doc_data.data, "text");
                    page_detail.style.display = "flex";
                    break;
                case "mdcal":
                    gen_mdcal(doc_data.data);
                    page_mdcal.style.display = "flex";
                    break;
            }
        })
        .catch((error) => {
            console.log("fetch data fail");
            alert("Can't get data from server");
            page_loader.style.display = "none";
        });
}
