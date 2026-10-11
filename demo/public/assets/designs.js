(() => {
  const indexGrid = document.querySelector(".index-layout .product-grid"),
    originalCards = indexGrid ? [...indexGrid.children] : [];
  document
    .querySelector(".index-layout [data-search]")
    ?.addEventListener("input", () => {
      const count = originalCards.filter((card) => !card.hidden).length;
      const nb = document.body.dataset.locale === "nb";
      document.querySelector("[data-index-results]").textContent = nb
        ? `${count} av ${originalCards.length} produkter`
        : `${count} of ${originalCards.length} products`;
    });
  document
    .querySelector("[data-index-sort]")
    ?.addEventListener("change", (event) => {
      const order = event.target.value;
      const cards = [...originalCards];
      if (order !== "featured")
        cards.sort((a, b) => {
          const price = (card) =>
            card.dataset.price === "" ? Infinity : Number(card.dataset.price);
          const left = price(a),
            right = price(b);
          if (!Number.isFinite(left) || !Number.isFinite(right))
            return Number.isFinite(left) ? -1 : Number.isFinite(right) ? 1 : 0;
          return order === "asc" ? left - right : right - left;
        });
      indexGrid.append(...cards);
    });
  document.querySelectorAll("[data-index-view]").forEach((button) =>
    button.addEventListener("click", () => {
      indexGrid?.classList.toggle(
        "list-view",
        button.dataset.indexView === "list",
      );
      document
        .querySelectorAll("[data-index-view]")
        .forEach((other) =>
          other.setAttribute("aria-pressed", String(other === button)),
        );
    }),
  );
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
