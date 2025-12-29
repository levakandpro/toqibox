const key = (slug) => `toqibox:reacted:${slug}`;

export function hasReacted(slug) {
  return localStorage.getItem(key(slug)) === "1";
}

export function setReacted(slug) {
  localStorage.setItem(key(slug), "1");
}
