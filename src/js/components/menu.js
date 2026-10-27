export function initMenu(root) {
  const button = root.querySelector("[data-menu-toggle]");
  const menu = root.querySelector("[data-menu]");
  if (!button || !menu) return () => {};

  document.documentElement.classList.add("has-js");
  menu.inert = true;
  const close = (restoreFocus = false) => {
    menu.classList.remove("is-open");
    menu.inert = true;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
    if (restoreFocus) button.focus();
  };
  const toggle = () => {
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", open);
  };
  const onKey = (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open"))
      close(true);
  };
  const onClick = (event) => {
    if (event.target.closest("a")) close();
  };
  button.addEventListener("click", toggle);
  menu.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  return () => {
    button.removeEventListener("click", toggle);
    menu.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
    close();
  };
}
