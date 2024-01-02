export function toCapitalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toInitialLetters(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
