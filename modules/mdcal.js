import * as helper from './helper.js'

// TODO: data structure
// const data = {
//   version: "1.0.0",
//   title: "Creatinine Clearance (Cockcroft-Gault Equation)",
//   subtitle: "Calculates CrCl according to the Cockcroft-Gault equation.",
//   instruct: {
//     title: "INSTRUCTIONS",
//     subtitle: "For use in patients with stable renal function to estimate creatinine clearance.",
//   },
//   details: {
//     when: `Patients with acute burns.`,
//     pitfalls:
//       "<li>The Parkland Formula is a validated and effective approach to initial fluid resuscitation in the acutely burned patient.<li>Overly aggressive fluid resuscitation, termed “fluid creep”, is well documented in critical care literature. Factors that may lead to fluid creep include lack of physician observation of endpoints (i.e. urine output), increased opioid use and the emergency nature of goal-directed resuscitation.<li>Patients with inhalational and electrical burns, as well as children and the elderly, may require more or less fluid resuscitation than is predicted by the formula.",
//     why: "<li>The Parkland Formula has been endorsed by the American Burn Association.<li>It has been shown to appropriately restore intravascular volume and limit the development of hypovolemic shock.",
//     evidence: "evidence",
//   },
//   inputs: [
//     {
//       title: "Gender",
//       subtitle: "",
//       type: "radio",
//       value: "",
//       choices: [
//         {
//           title: "Female",
//           subtitle: "",
//           value: 45.5,
//         },
//         {
//           title: "Male",
//           subtitle: "",
//           value: 50,
//         },
//       ],
//     },
//     {
//       title: "Age",
//       subtitle: "",
//       type: "number",
//       value: "",
//       placeholder: "",
//       unit: [
//         {
//           unit: "years",
//           multiply: 1,
//         },
//       ],
//     },
//     {
//       title: "Weight",
//       subtitle: "",
//       type: "number",
//       value: "",
//       placeholder: "1 - 150",
//       unit: [
//         {
//           unit: "kg",
//           multiply: 1,
//         },
//         {
//           unit: "lbs",
//           multiply: 2.2,
//         },
//       ],
//     },
//     {
//       title: "Creatinine",
//       subtitle: "",
//       type: "number",
//       value: "",
//       placeholder: "0.7 - 1.3",
//       unit: [
//         {
//           unit: "mg/dL",
//           multiply: 1,
//         },
//         {
//           unit: "µmol/L",
//           multiply: 2.2,
//         },
//       ],
//     },
//     {
//       title:
//         "The Cockcroft-Gault Equation may be inaccurate depending on a patient's body weight and BMI; by providing additional height, we can calculate BMI and provide a modified estimate and range.",
//       subtitle: "",
//       type: "text",
//     },
//     {
//       title: "Height",
//       subtitle: "",
//       type: "number",
//       value: "",
//       placeholder: "",
//       unit: [
//         {
//           unit: "cm",
//           multiply: 1,
//         },
//         {
//           unit: "m",
//           multiply: 0.01,
//         },
//       ],
//     },
//     {
//       title: "Height",
//       subtitle: "",
//       type: "number",
//       value: "",
//       placeholder: "",
//       unit: [
//         {
//           unit: "cm",
//           multiply: 1,
//         },
//         {
//           unit: "m",
//           multiply: 0.01,
//         },
//       ],
//     },
//     {
//       title: "Height",
//       subtitle: "",
//       type: "number",
//       value: "",
//       placeholder: "",
//       unit: [
//         {
//           unit: "cm",
//           multiply: 1,
//         },
//         {
//           unit: "m",
//           multiply: 0.01,
//         },
//       ],
//     },
//   ],
//   results: [
//     {
//       title: {
//         data: "${1}$[ L]",
//         type: "eval",
//       },
//       subtitle: {
//         data: "this is test text",
//         type: "text",
//       },
//       display: {
//         mode: "show",
//       },
//     },
//     {
//       title: {
//         data: "${2}*${3}*4+${6}$[ Wha wha]",
//         type: "eval",
//       },
//       subtitle: {
//         data: "this is test text",
//         type: "text",
//       },
//       display: {
//         mode: "toggle",
//         condition: [">=", 100],
//         data: "${2}*${3}*4+${6}",
//       },
//     },
//     {
//       title: {
//         data: "${2}*${3}*4+${6}$[ Hide]",
//         type: "eval",
//       },
//       subtitle: {
//         data: "hide this",
//         type: "text",
//       },
//       display: {
//         mode: "hide",
//         condition: [">=", 100],
//         data: "${2}*${3}*4+${6}",
//       },
//     },
//   ],
// };

// generate all data
export function gen_mdcal(data) {
  const page_mdcal = document.querySelector("#page_mdcal");
  page_mdcal.style.display = "flex";

  // title
  const title_head = page_mdcal.querySelector(".title .title_head");
  const title_sub = page_mdcal.querySelector(".title .title_sub");

  title_head.innerHTML = data.title;
  title_sub.style.display = data.subtitle.length > 0 ? "flex" : "none";
  title_sub.innerHTML = data.subtitle;

  // instruct
  const instruct = page_mdcal.querySelector(".instruct");
  const instruct_head = instruct.querySelector(".instruct_head");
  const instruct_sub = instruct.querySelector(".instruct_sub");
  instruct_head.innerHTML = data.instruct.title;
  instruct_sub.innerHTML = data.instruct.subtitle;
  instruct.style.display = data.instruct.title.length > 0 ? "block" : "none";

  // body
  const mdcal_body = page_mdcal.querySelector(".mdcal_body");
  mdcal_body.innerHTML = "";
  for (let i in data.inputs) {
    const input = data.inputs[i];

    // generate subtitle DOM if it exists
    const subtitle_dom =
      input.subtitle && input.subtitle.length > 0 ? `<span class="txt-s">${input.subtitle}</span>` : "";

    // generate title
    const title_dom = `<div class="col"><span>${input.title}</span>${subtitle_dom}</div>`;

    // generate button/input
    let btn_dom = "";
    switch (input.type) {
      case "number": {
        // Unit display for multiple units
        const btnRow_dom =
          input.unit && input.unit.length > 1
            ? `<div class="row width-s pad-m btn swbtn">
                     <span>${input.unit[0].unit}</span>
                     <span class="material-symbols-outlined" style="font-size: small;">unfold_more</span>
                   </div>`
            : `<div class="row width-s pad-m btn">
                     <span>${input.unit[0]?.unit || ""}</span>
                   </div>`;

        // Value and placeholder for input
        const input_value = input.value && input.value.length > 0 ? ` value="${Number(input.value)}"` : "";
        const input_placeholder =
          input.placeholder && input.placeholder.length > 0 ? ` placeholder="${input.placeholder}"` : "";

        btn_dom = `<div class="row right">
                          <input type="number"${input_value}${input_placeholder}>${btnRow_dom}
                       </div>`;
        break;
      }

      case "text": {
        btn_dom = ``;
        break;
      }

      case "radio": {
        // Radio button choices
        let radio_dom = "";
        for (let choiceIndex in input.choices) {
          const choice = input.choices[choiceIndex];
          const choice_subtitle =
            choice.subtitle && choice.subtitle.length > 0
              ? `<span class="txt-s pad-side-m">${choice.subtitle}</span>`
              : "";

          radio_dom += `<input type="radio" id="mdcal_radio_${i}-${choiceIndex}" name="mdcal_radio_${i}" 
                                  ${Number(input.value) === Number(choiceIndex) ? "checked" : ""}>
                              <label for="mdcal_radio_${i}-${choiceIndex}">
                                  <span>${choice.title}</span>${choice_subtitle}
                              </label>`;
        }
        btn_dom = `<div class="row_btn">${radio_dom}</div>`;
        break;
      }

      default:
        console.warn(`Unsupported input type: ${input.type}`);
        break;
    }

    mdcal_body.innerHTML += `<div class="row${
      input.type == "text" ? " text" : ""
    }">${title_dom}${btn_dom}</div>`;
  }

  // toggle unit
  const toggle_btns = Array.from(mdcal_body.querySelectorAll(".swbtn"));
  toggle_btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const current_input_index = Array.from(mdcal_body.childNodes).findIndex(
        (item) => item == btn.parentElement.parentElement
      );

      const current_unit = btn.children[0].textContent.trim();
      const current_unit_index = data.inputs[current_input_index].unit.findIndex(
        (item) => item.unit == current_unit
      );
      const current_value =
        Number(btn.parentNode.querySelector("input").value) /
        data.inputs[current_input_index].unit[current_unit_index].multiply;

      const next_unit_index =
        current_unit_index < data.inputs[current_input_index].unit.length - 1 ? current_unit_index + 1 : 0;
      const next_unit = data.inputs[current_input_index].unit[next_unit_index].unit;
      const next_value = current_value * data.inputs[current_input_index].unit[next_unit_index].multiply;

      btn.children[0].textContent = next_unit;
      btn.parentNode.querySelector("input").value = next_value;
    });
    // update result
    result_mdcal(data);
  });

  // update result when input change
  const inputs = mdcal_body.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => result_mdcal(data));
  });

  // next step
  const nextStep = page_mdcal.querySelector(".next div.body");
  nextStep.innerHTML = marked.parse("# Marked in the browser\n\nRendered by **marked**.");

  // detail
  const detail = page_mdcal.querySelector(".detail");
  const detail_body = detail.querySelector(".body");
  detail.querySelector(".row").addEventListener("click", () => {
    const detailShown = detail.style.maxHeight === "24px" || !detail.style.maxHeight;
    detail.style.maxHeight = detailShown ? detail.scrollHeight + "px" : "24px";

    const arrow = detail.querySelector(".row span.right");
    arrow.style.transform = detailShown ? "rotate(180deg)" : "";
  });
  detail.querySelectorAll(".fuse_btn input").forEach((btn) => {
    btn.addEventListener("click", () => {
      detail_body.innerHTML = "";
      detail_body.innerHTML = marked.parse(data.details[btn.value]);
      detail.style.maxHeight = detail.scrollHeight + "px";
    });
  });
  detail_body.innerHTML = marked.parse(data.details.when);
}

// render out the result
function result_mdcal(data) {
  const page_mdcal = document.querySelector("#page_mdcal");
  const mdcal_body = page_mdcal.querySelector(".mdcal_body");
  const result_body = page_mdcal.querySelector(".result");

  result_body.innerHTML = "";
  for (let j in data.results) {
    // generate result
    function gen_result(input_data) {
      // console.log(input_data)
      var output_data = "";
      switch (input_data.type) {
        case "text":
          output_data = input_data.data;
          break;

        case "eval":
          // update formula
          var formula_text = input_data.data;
          const value_placeholders = formula_text.match(/\$\{(\d+)\}/g);
          if (value_placeholders) {
            for (let i of value_placeholders) {
              const index = Number(i.replace("${", "").replace("}", "")) - 1;
              const input = mdcal_body.childNodes[index];

              // get input value
              if (input.innerHTML.includes('input type="number"')) {
                const unit = input.querySelector(".btn").children[0].textContent.trim();
                const unit_index = data.inputs[index].unit.findIndex((x) => x.unit == unit);
                const unit_multiply = data.inputs[index].unit[unit_index].multiply;
                const value = Number(input.querySelector("input").value) * unit_multiply;
                formula_text = formula_text.replace(i, value);
              } else if (input.innerHTML.includes('input type="radio"')) {
                const selectedRadio = input.querySelector(`input[type="radio"]:checked`);
                const radios = Array.from(input.querySelectorAll(`input[type="radio"]`));
                const value = data.inputs[index].choices[radios.indexOf(selectedRadio)].value;
                formula_text = formula_text.replace(i, value);
              }
            }
          }

          // update string
          const text_placeholders = formula_text.match(/\$\[([^\]]+)\]/g);
          const text_part = text_placeholders ? text_placeholders[0].replace("$[", "").replace("]", "") : "";
          output_data = String(eval(formula_text.replace(/\$\[([^\]]+)\]/g, ""))) + text_part;
          break;

        case "elif":
          // update formula
          var formula_text = input_data.data.data;
          const value_placeholders_elif = formula_text.match(/\$\{(\d+)\}/g);
          if (value_placeholders_elif) {
            for (let i of value_placeholders_elif) {
              const index = Number(i.replace("${", "").replace("}", "")) - 1;
              const input = mdcal_body.childNodes[index];

              // get input value
              if (input.innerHTML.includes('input type="number"')) {
                const value = Number(input.querySelector("input").value);
                formula_text = formula_text.replace(i, value);
              } else if (input.innerHTML.includes('input type="radio"')) {
                const selectedRadio = input.querySelector(`input[type="radio"]:checked`);
                const radios = Array.from(input.querySelectorAll(`input[type="radio"]`));
                const value = data.inputs[index].choices[radios.indexOf(selectedRadio)].value;
                formula_text = formula_text.replace(i, value);
              }
            }
          }
          const formula_value = eval(formula_text);

          // functional if else
          function elifGen(inputValue) {
            for (let i = 0; i < input_data.data.text.length; i++) {
              const [value, condition, description] = input_data.data.text[i];

              // last one
              if (i === input_data.data.text.length - 1) {
                if (condition) {
                  if (inputValue <= value) return description;
                } else {
                  if (inputValue < value) return description;
                }
              } else {
                if (condition) {
                  if (inputValue >= value) return description;
                } else {
                  if (inputValue > value) return description;
                }
              }
            }
            return "";
          }
          output_data = elifGen(formula_value);
          break;

        default:
          break;
      }
      // console.log(output_data)
      return output_data;
    }

    const result = data.results[j];

    // check if show result or not
    if (result.display.mode == "none") continue;
    switch (result.display.mode) {
      case "hide":
        continue;
      case "toggle":
        const toggle_value = Number(gen_result({ data: result.display.data, type: "eval" }));
        var toggle_result = false;
        switch (result.display.condition[0]) {
          case ">":
            toggle_result = toggle_value > result.display.condition[1];
            break;
          case ">=":
            toggle_result = toggle_value >= result.display.condition[1];
            break;
          case "<":
            toggle_result = toggle_value < result.display.condition[1];
            break;
          case "<=":
            toggle_result = toggle_value <= result.display.condition[1];
            break;
          case "=":
            toggle_result = toggle_value == result.display.condition[1];
            break;

          default:
            break;
        }
        if (!toggle_result) continue;
        break;

      default:
        break;
    }

    gen_result(result.title);
    gen_result(result.subtitle);

    result_body.innerHTML += `<div><div class="head">${gen_result(result.title)}</div>
        ${gen_result(result.subtitle)}</div>`;
  }
}

// fix header - run when complete loaded
document.addEventListener("DOMContentLoaded", () => {
    helper.fixed_dom("#page_mdcal", ".title_head", 0);
});

// TODO: usage
// gen_mdcal(data);