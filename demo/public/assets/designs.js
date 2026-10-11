(() => {
  const header = document.querySelector(".design-header"),
    menu = document.querySelector(".design-menu");
  menu?.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    menu.setAttribute("aria-expanded", String(open));
  });
  header?.querySelector("nav")?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      header.classList.remove("menu-open");
      menu.setAttribute("aria-expanded", "false");
    }
  });
  document.querySelectorAll("[data-amount-form]").forEach((form) =>
    form.addEventListener("change", () => {
      const selected = form.querySelector("[name=variantId]:checked");
      form.querySelector("[data-selected-amount]").textContent =
        selected?.dataset.amount || "";
    }),
  );
})();
