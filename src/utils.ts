export function toCapitalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitialLetters(name: string): string {
  return name.split(' ').map((word) => word.charAt(0).toUpperCase()).join('');
}
