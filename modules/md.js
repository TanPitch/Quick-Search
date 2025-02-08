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
                    result.dose_range_unit =
                        doseArray[3] && doseArray[4] && doseArray[5] ? doseArray[5] : null;
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
export async function loadMD(input, type = "link") {
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

    tableStyle();
    largeImage();
}

// replace code for Mermaid
document.addEventListener("DOMContentLoaded", () => {
    const mermaidCodeElements = document.querySelectorAll("code.language-mermaid");
    mermaidCodeElements.forEach((element) => {
        const code = element.textContent;
        const container = document.createElement("div");
        container.className = "mermaid";
        container.textContent = code;
        element.replaceWith(container);
    });
});

// style the table
function tableStyle() {
    document.querySelectorAll("table").forEach((table) => {
        let alignToTop = false;
        table.querySelectorAll("tbody td").forEach((td) => {
            const lines = td.innerHTML.split(/<li>|<\/li>|\r\n|\r|\n/);
            if (lines.length > 10) {
                alignToTop = true;
                return;
            }
        });

        table.querySelectorAll("tbody td").forEach((td) => {
            if (alignToTop) td.style.verticalAlign = "top";
            else td.style.verticalAlign = "middle";
        });

        var tds = table.querySelectorAll("tbody td");
        tds.forEach(function (td) {
            td.style.whiteSpace = "nowrap";
            var textWidth = td.offsetWidth;
            if (textWidth <= 250) {
                td.style.minWidth = textWidth + "px";
            } else {
                td.style.minWidth = "280px";
                td.style.maxWidth = "400px";
                td.style.whiteSpace = "wrap";
            }
        });
        var tableWidth = table.offsetWidth;

        if (tableWidth > 300) {
            table.style.width = "auto";

            // Create a new div wrapper
            var divWrapper = document.createElement("div");
            divWrapper.style.width = "100%";
            divWrapper.style.overflowX = "auto";
            divWrapper.appendChild(table.cloneNode(true)); // Clone the table and append to the wrapper
            table.parentNode.replaceChild(divWrapper, table); // Replace the original container with the wrapper
        } else {
            tds.forEach((td) => {
                td.style.maxWidth = "none";
            });
            table.style.width = "auto";
            table.style.overflowX = "hidden";
        }
    });
}

// FIXME:
function largeImage() {
    const images = document.querySelectorAll("img");
    const fullscreenContainer = document.getElementById("fullscreen-container");
    const fullscreenImage = document.getElementById("fullscreen-image");
    const closeBtn = document.getElementById("close-btn");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomResetBtn = document.querySelector("#zoom-reset");

    let scale = 1;
    let panX = 0;
    let panY = 0;
    let initialDistance = null;
    let initialScale = 1;
    let lastCenterX = 0;
    let lastCenterY = 0;
    let startPanX = 0;
    let startPanY = 0;

    images.forEach((image) => {
        image.addEventListener("click", () => {
            fullscreenImage.src = image.src;
            fullscreenImage.onload = () => {
                fullscreenContainer.style.display = "flex";
                setTimeout(() => {
                    fullscreenContainer.style.opacity = "1";
                    resetImage();
                }, 10);
            };
        });
    });

    closeBtn.addEventListener("click", () => {
        fullscreenContainer.style.opacity = "0";
        setTimeout(() => {
            fullscreenContainer.style.display = "none";
        }, 300);
    });

    zoomInBtn.addEventListener("click", () => {
        fullscreenImage.style.transition = "all 0.2s";
        zoomImage(1.1);
    });

    zoomOutBtn.addEventListener("click", () => {
        fullscreenImage.style.transition = "all 0.2s";
        zoomImage(0.9);
    });

    zoomResetBtn.addEventListener("click", () => {
        fullscreenImage.style.transition = "";
        resetImage();
    });

    fullscreenImage.addEventListener("mousedown", startPan);
    fullscreenImage.addEventListener("touchstart", startPan, { passive: false });

    fullscreenImage.addEventListener("touchmove", handlePinch, { passive: false });

    fullscreenContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        scale -= e.deltaY / 300;
        scale = Math.max(scale, 1);
        updateImageTransform();
    });

    function startPan(e) {
        fullscreenImage.style.transition = "";
        e.preventDefault();
        startPanX = panX;
        startPanY = panY;
        let startX = e.clientX || e.touches[0].clientX;
        let startY = e.clientY || e.touches[0].clientY;

        const moveHandler = (moveEvent) => {
            let moveX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
            let moveY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
            panX = startPanX + moveX - startX;
            panY = startPanY + moveY - startY;
            constrainPan();
            updateImageTransform();
        };

        const endHandler = () => {
            document.removeEventListener("mousemove", moveHandler);
            document.removeEventListener("mouseup", endHandler);
            document.removeEventListener("touchmove", moveHandler);
            document.removeEventListener("touchend", endHandler);
        };

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", endHandler);
        document.addEventListener("touchmove", moveHandler, { passive: false });
        document.addEventListener("touchend", endHandler);
    }

    function handlePinch(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;

            if (initialDistance === null) {
                initialDistance = currentDistance;
                initialScale = scale;
                lastCenterX = centerX;
                lastCenterY = centerY;
            } else {
                const scaleChange = currentDistance / initialDistance;
                scale = initialScale * scaleChange;
                const panChangeX = (centerX - lastCenterX) / scale;
                const panChangeY = (centerY - lastCenterY) / scale;
                panX += panChangeX;
                panY += panChangeY;
                lastCenterX = centerX;
                lastCenterY = centerY;
                constrainPan();
                updateImageTransform();
            }
        }
    }

    function zoomImage(factor) {
        const containerRect = fullscreenContainer.getBoundingClientRect();
        const imageRect = fullscreenImage.getBoundingClientRect();

        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const offsetX = (centerX - imageRect.left) / scale;
        const offsetY = (centerY - imageRect.top) / scale;

        scale *= factor;

        panX -= offsetX * (factor - 1);
        panY -= offsetY * (factor - 1);

        constrainPan();
        updateImageTransform();
    }

    function constrainPan() {
        const imageWidth = fullscreenImage.naturalWidth * scale;
        const imageHeight = fullscreenImage.naturalHeight * scale;
        const containerWidth = fullscreenContainer.clientWidth;
        const containerHeight = fullscreenContainer.clientHeight;

        const maxPanX = (imageWidth - containerWidth) / 2;
        const maxPanY = (imageHeight - containerHeight) / 2;

        panX = Math.min(Math.max(panX, -maxPanX), maxPanX);
        panY = Math.min(Math.max(panY, -maxPanY), maxPanY);
    }

    function updateImageTransform() {
        fullscreenImage.style.transform = `scale(${scale}) translate(${panX / scale}px, ${panY / scale}px)`;
    }

    function resetImage() {
        scale = 1;
        panX = 0;
        panY = 0;
        initialDistance = null;
        initialScale = 1;
        lastCenterX = 0;
        lastCenterY = 0;
        startPanX = 0;
        startPanY = 0;
        fullscreenImage.style.transition = "";
        updateImageTransform();
    }
}
