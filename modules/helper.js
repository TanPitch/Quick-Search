// fix header
export function fixed_dom(box, target, offset = 0) {
  const boxDom = document.querySelector(box);
  const targetDom = boxDom.querySelector(target);
  const parentDom = targetDom.parentNode;

  const updatePlaceholder = () => {
    const targetHeight = targetDom.offsetHeight;
    placeholder.style.height = `${targetHeight}px`;

    console.log(targetHeight, targetDom)

    // update width with pad
    const parentStyles = getComputedStyle(parentDom);
    targetDom.style.width = `${
      parentDom.offsetWidth - parseFloat(parentStyles.paddingLeft) - parseFloat(parentStyles.paddingRight)
    }px`;
  };

  // placeholder
  const placeholder = document.createElement("div");
  // placeholder.style.height = `${targetDom.offsetHeight}px`;
  placeholder.style.display = "none";
  parentDom.insertBefore(placeholder, targetDom);

  const observer = new MutationObserver(updatePlaceholder);
  observer.observe(targetDom, { childList: true, subtree: true });

  // update height, initial
  updatePlaceholder();

  window.addEventListener("scroll", () => {
    const parentTop = parentDom.getBoundingClientRect().top + window.scrollY;
    const scrollPosition = window.scrollY;
    const isFixed = scrollPosition >= parentTop - offset;

    placeholder.style.display = isFixed ? "block" : "none";
    targetDom.classList.toggle("fixed-top", isFixed);

    // fix width
    targetDom.style.width = isFixed
      ? `${
          parentDom.offsetWidth -
          parseFloat(getComputedStyle(parentDom).paddingLeft) -
          parseFloat(getComputedStyle(parentDom).paddingRight)
        }px`
      : "";
  });
}
