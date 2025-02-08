import * as mdcal from "./modules/mdcal.js";
import * as dose from "./modules/dose.js";
import * as engine from "./modules/engine.js"

/*

TODO:
[ ] clean the code
[ ] make sure that image will work

*/

// scroll to top
const btn_scrollTop = document.querySelector("#btn_scrollTop");
const btn_calculator = document.querySelector("#btn_calculator");
window.onscroll = () => {
    const condition = window.scrollY > 44;
    btn_scrollTop.style.display = condition ? "block" : "none";
    btn_calculator.style.transform = condition ? "translateX(-50px)" : "";
    btn_calculator.style.opacity = condition ? "0.7" : "1";
};
btn_scrollTop.addEventListener("click", () => {
    const duration = 800; // duration (ms)
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

    searchBox.focus();
});

// color theme
const btn_easter = document.querySelector("#btn_easter");
btn_easter.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
});

// TODO:
// btn_easter.addEventListener("contextmenu", (e) => {
//   e.preventDefault();
//   const search_custom = document.querySelector("#search_custom");
//   const stat = search_custom.style.display;
//   search_custom.style.display = stat != "flex" ? "flex" : "none";
// });

// DEBUG:
// var doc_data1 = {
//     title: "sample title",
//     type: "md",
//     data: "this is md text",
// };
// var doc_data2 = {
//     title: "creatinine clearance",
//     type: "mdcal",
//     data: {
//         version: "1.0.0",
//         title: "Creatinine Clearance (Cockcroft-Gault Equation)",
//         subtitle: "Calculates CrCl according to the Cockcroft-Gault equation.",
//         instruct: {
//             title: "INSTRUCTIONS",
//             subtitle: "For use in patients with stable renal function to estimate creatinine clearance.",
//         },
//         details: {
//             when: `Patients with acute burns.`,
//             pitfalls:
//                 "<li>The Parkland Formula is a validated and effective approach to initial fluid resuscitation in the acutely burned patient.<li>Overly aggressive fluid resuscitation, termed “fluid creep”, is well documented in critical care literature. Factors that may lead to fluid creep include lack of physician observation of endpoints (i.e. urine output), increased opioid use and the emergency nature of goal-directed resuscitation.<li>Patients with inhalational and electrical burns, as well as children and the elderly, may require more or less fluid resuscitation than is predicted by the formula.",
//             why: "<li>The Parkland Formula has been endorsed by the American Burn Association.<li>It has been shown to appropriately restore intravascular volume and limit the development of hypovolemic shock.",
//             evidence: "evidence",
//         },
//         inputs: [
//             {
//                 title: "Gender",
//                 subtitle: "",
//                 type: "radio",
//                 value: "",
//                 choices: [
//                     {
//                         title: "Female",
//                         subtitle: "",
//                         value: 45.5,
//                     },
//                     {
//                         title: "Male",
//                         subtitle: "",
//                         value: 50,
//                     },
//                 ],
//             },
//             {
//                 title: "Age",
//                 subtitle: "",
//                 type: "number",
//                 value: "",
//                 placeholder: "",
//                 unit: [
//                     {
//                         unit: "years",
//                         multiply: 1,
//                     },
//                 ],
//             },
//             {
//                 title: "Weight",
//                 subtitle: "",
//                 type: "number",
//                 value: "",
//                 placeholder: "1 - 150",
//                 unit: [
//                     {
//                         unit: "kg",
//                         multiply: 1,
//                     },
//                     {
//                         unit: "lbs",
//                         multiply: 2.2,
//                     },
//                 ],
//             },
//             {
//                 title: "Creatinine",
//                 subtitle: "",
//                 type: "number",
//                 value: "",
//                 placeholder: "0.7 - 1.3",
//                 unit: [
//                     {
//                         unit: "mg/dL",
//                         multiply: 1,
//                     },
//                     {
//                         unit: "µmol/L",
//                         multiply: 2.2,
//                     },
//                 ],
//             },
//             {
//                 title: "The Cockcroft-Gault Equation may be inaccurate depending on a patient's body weight and BMI; by providing additional height, we can calculate BMI and provide a modified estimate and range.",
//                 subtitle: "",
//                 type: "text",
//             },
//             {
//                 title: "Height",
//                 subtitle: "",
//                 type: "number",
//                 value: "",
//                 placeholder: "",
//                 unit: [
//                     {
//                         unit: "cm",
//                         multiply: 1,
//                     },
//                     {
//                         unit: "m",
//                         multiply: 0.01,
//                     },
//                 ],
//             },
//             {
//                 title: "Height",
//                 subtitle: "",
//                 type: "number",
//                 value: "",
//                 placeholder: "",
//                 unit: [
//                     {
//                         unit: "cm",
//                         multiply: 1,
//                     },
//                     {
//                         unit: "m",
//                         multiply: 0.01,
//                     },
//                 ],
//             },
//             {
//                 title: "Height",
//                 subtitle: "",
//                 type: "number",
//                 value: "",
//                 placeholder: "",
//                 unit: [
//                     {
//                         unit: "cm",
//                         multiply: 1,
//                     },
//                     {
//                         unit: "m",
//                         multiply: 0.01,
//                     },
//                 ],
//             },
//         ],
//         results: [
//             {
//                 title: {
//                     data: "${1}$[ L]",
//                     type: "eval",
//                 },
//                 subtitle: {
//                     data: "this is test text",
//                     type: "text",
//                 },
//                 display: {
//                     mode: "show",
//                 },
//             },
//             {
//                 title: {
//                     data: "${2}*${3}*4+${6}$[ Wha wha]",
//                     type: "eval",
//                 },
//                 subtitle: {
//                     data: "this is test text",
//                     type: "text",
//                 },
//                 display: {
//                     mode: "toggle",
//                     condition: [">=", 100],
//                     data: "${2}*${3}*4+${6}",
//                 },
//             },
//             {
//                 title: {
//                     data: "${2}*${3}*4+${6}$[ Hide]",
//                     type: "eval",
//                 },
//                 subtitle: {
//                     data: "hide this",
//                     type: "text",
//                 },
//                 display: {
//                     mode: "hide",
//                     condition: [">=", 100],
//                     data: "${2}*${3}*4+${6}",
//                 },
//             },
//         ],
//     },
// };
