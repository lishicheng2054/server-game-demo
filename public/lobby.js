const filterButtons = document.querySelectorAll("[data-filter]");
const gameCards = document.querySelectorAll("[data-category]");

function applyFilter(filter) {
  gameCards.forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.hidden = !shouldShow;
  });

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyFilter(button.dataset.filter);
  });
});
