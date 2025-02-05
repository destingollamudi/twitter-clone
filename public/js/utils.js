// Random PFP Generator
export function getRandomPfp() {
  const pfpArray = [
    '/img/pfp1.svg',
    '/img/pfp2.svg',
    '/img/pfp3.svg',
    '/img/pfp4.svg',
    '/img/pfp5.svg'
  ];
  const randomIndex = Math.floor(Math.random() * pfpArray.length);
  return pfpArray[randomIndex];
}
