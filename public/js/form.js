const beginOptionsCount = 3;

let optionsIndex = 0;
const options = document.querySelector("#options");
const addOptionBtn = document.querySelector("#addOption");
const removeOptionBtn = document.querySelector("#removeOption");
const form = document.querySelector("form");

addOptionBtn.addEventListener("click", (e) => {
  e.preventDefault();
  createOptionsNode();
});
removeOptionBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (optionsIndex > 1) {
    optionsIndex--;
    options.removeChild(options.lastChild);
    if (optionsIndex == 1) {
      removeOptionBtn.setAttribute("disabled", true);
    }
  }
});

for (i = 0; i < beginOptionsCount; i++) {
  createOptionsNode();
}

function createOptionsNode() {
  optionsIndex++;
  removeOptionBtn.removeAttribute("disabled");
  options.insertAdjacentHTML(
    "beforeend",
    `<li><input name="option" data-id="${optionsIndex}" placeholder="Option ${optionsIndex}" autocomplete="off" required /></li>`,
  );
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  document
    .querySelectorAll(".is-invalid")
    .forEach((e) => e.classList.remove("is-invalid"));
  const data = e.target.elements;

  let options = [];

  if (data.option instanceof HTMLInputElement) {
    options = [mapOption(data.option)];
  } else {
    options = Array.from(data.option).map(mapOption);
  }

  console.log(options);
  await fetch(e.target.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: data.title.value,
      description: data.description.value,
      options: options,
      setting: {
        voices: data.voices.value,
        worst: data.worst.checked,
        deadline: data.deadline.value,
      },
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw res;
    })
    .catch(async (res) => {
      if (res.status == 405) {
        const body = await res.json();
        for (const field in body.errors) {
          console.log("span.error[for=" + field + "]");
          document.querySelector("span.error[for=" + field + "]").innerText =
            body.errors[field][0];
          if (data[field]) data[field].classList.add("is-invalid");
        }
      }
    });
});

/**
 * @param {HTMLInputElement} node
 */
function mapOption(node) {
  return { id: Number.parseInt(node.dataset.id), text: node.value };
}
