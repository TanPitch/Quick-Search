function openCalculator(config) {
  const page_dose = document.querySelector("#page_dose");

  const input_wt = page_dose.querySelectorAll('input[type="number"]')[0];
  const input_dose = page_dose.querySelectorAll('input[type="number"]')[1];
  const input_amount = page_dose.querySelectorAll('input[type="number"]')[2];

  if (!config) {
    config = {
      title: "",
      instruct: "",
      dose: {
        value: 0,
        unit: "mg",
        // max: [1, true], // max dose (g), per kg(true)
      },
      freq: {
        value: "od",
      },
      concentrate: {
        value: 0,
        unit: undefined,
      },
    };
  }

  // title
  page_dose.querySelector(".title_sub").textContent = config.title || "Calculator";
  page_dose.querySelector(".title_sub").style.marginBottom = config.title ? "" : "var(--gap-xl)";
  page_dose.querySelector(".title_head").style.display = config.title ? "flex" : "none";
  page_dose.querySelector(".instruct").textContent = config.instruct;
  page_dose.querySelector(".instruct").style.display = config.instruct ? "flex" : "none";

  // reset value
  input_wt.value = "";
  input_dose.value = config.dose.value == 0 ? "" : Number(config.dose.value);
  input_amount.value = config.concentrate.value == 0 ? "" : Number(config.concentrate.value);
  page_dose.querySelectorAll('input[type="radio"]:checked').forEach((el) => (el.checked = false));
  page_dose.querySelector(`input[name="dose_wt"][value="kg"]`).checked = true;
  page_dose.querySelector(`input[name="dose_dose"][value="${config.dose.unit}"]`).checked = true;
  page_dose.querySelector(`input[name="dose_freq"][value="${config.freq.value}"]`).checked = true;
  page_dose.querySelector(
    `input[name="dose_amount1"][value="${config.concentrate.unit ? config.concentrate.unit[0] : "mg"}"]`
  ).checked = true;
  page_dose.querySelector(
    `input[name="dose_amount2"][value="${config.concentrate.unit ? config.concentrate.unit[1] : "ml"}"]`
  ).checked = true;

  const resultCalculated = () => {
    const wt_unit = page_dose.querySelector('input[name="dose_wt"]:checked').value;
    const dose_unit = page_dose.querySelector('input[name="dose_dose"]:checked').value;
    const freq_unit = page_dose.querySelector('input[name="dose_freq"]:checked').value;
    const conc_unit = config.concentrate.unit || [
      page_dose.querySelector('input[name="dose_amount1"]:checked').value,
      page_dose.querySelector('input[name="dose_amount2"]:checked').value,
    ];

    const result_singleDose = page_dose.querySelectorAll(".result .right")[0];
    const result_dailyDose = page_dose.querySelectorAll(".result .right")[1];
    const result_dailyPerWt = page_dose.querySelectorAll(".result .right")[2];
    const result_singleLiq = page_dose.querySelectorAll(".result .right")[3];

    function wtAuto(kg) {
      const units = ["kg", "g", "mg", "mcg"];
      const factors = [1, 1000, 1000000, 1000000000];
      const index = kg >= 1 ? 0 : kg >= 0.001 ? 1 : kg >= 0.000001 ? 2 : 3;

      const result = kg * factors[index];
      return `${result % 1 === 0 ? result : result.toFixed(2)} ${units[index]}`;
    }
    function volAuto(l) {
      if (l == Infinity || isNaN(l)) return "--";
      const units = ["L", "ml"];
      const factors = [1, 1000];
      const index = Math.round(l) >= 1 ? 0 : 1;

      return `${l * factors[index]} ${units[index]}`;
    }

    const adj_wt = input_wt.value * { g: 0.001, kg: 1, lb: 0.453592 }[wt_unit];
    const adj_dose = input_dose.value / { mg: 1000000, g: 1000, mcg: 1000000000 }[dose_unit];
    const adj_freq = { od: 1, bid: 2, tid: 3, qid: 4, q4: 6, q3: 8, q2: 12, q1: 24 }[freq_unit];
    const adj_amount = input_amount.value / { mg: 1000000, g: 1000, mcg: 1000000000 }[conc_unit[0]];

    result_singleDose.textContent = wtAuto(adj_wt * adj_dose);
    result_dailyDose.textContent = wtAuto(adj_wt * adj_dose * adj_freq);
    result_dailyPerWt.textContent = `(${wtAuto(adj_dose * adj_freq)}/kg/day)`;
    result_singleLiq.textContent = volAuto(
      ({ ml: 0.001, L: 1 }[conc_unit[1]] * adj_wt * adj_dose) / adj_amount
    );
  };

  resultCalculated();
  page_dose.style.transition = "transform .2s ease-out";
  page_dose.style.transform = "translateX(0)";

  input_wt.focus();

  // update result
  input_wt.addEventListener("input", resultCalculated);
  input_dose.addEventListener("input", resultCalculated);
  input_amount.addEventListener("input", resultCalculated);

  page_dose
    .querySelectorAll('input[type="radio"]')
    .forEach((el) => el.addEventListener("change", resultCalculated));
}
document.querySelector("#btn_calculator").addEventListener("click", () => {
  openCalculator();
});

document.querySelector("#btn_back").addEventListener("click", () => {
  page_dose.style.transform = "translateX(100%)";
});
