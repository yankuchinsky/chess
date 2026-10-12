export const getImage = (type: string) => {
  return require(`./${type}.png`).default;
}

export default getImage;