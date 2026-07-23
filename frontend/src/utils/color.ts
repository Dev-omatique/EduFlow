/**
 * Convertit une couleur hexadécimale en une version plus pâle et solide (mélangée avec du blanc).
 * @param hex Le code hexadécimal d'origine (ex: "#FF5733")
 * @param weight Le poids du blanc à ajouter (ex: 0.85 pour un fond très pastel)
 * @returns Un code hexadécimal plein (ex: "#faece8")
 */
export function getPastelHex(hex: string | null | undefined, weight: number = 0.85): string {
  if (!hex) return 'transparent';

  let cleanHex = hex.replace('#', '').trim();

  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }

  if (cleanHex.length !== 6) {
    return hex;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Mélange progressif avec le blanc (255, 255, 255)
  const pastelR = Math.round(r + (255 - r) * weight);
  const pastelG = Math.round(g + (255 - g) * weight);
  const pastelB = Math.round(b + (255 - b) * weight);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(pastelR)}${toHex(pastelG)}${toHex(pastelB)}`;
}