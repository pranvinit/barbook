function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turns the model's rhyme groups (words) into character spans in the bar.
 * Models are unreliable at counting characters, so offsets are computed here.
 *
 * @param {string} text - The bar
 * @param {{ group: string, words: string[] }[]} groups
 * @returns {{ group: string, spans: [number, number][] }[]}
 */
export function buildRhymeMap(text, groups = []) {
  const taken = [];
  const overlaps = (start, end) => taken.some(([s, e]) => start < e && end > s);

  return groups
    .map(({ group, words }) => {
      const spans = [];
      for (const word of new Set(words.map((w) => w.trim()).filter(Boolean))) {
        const pattern = new RegExp(
          `(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`,
          "giu"
        );
        for (const match of text.matchAll(pattern)) {
          const start = match.index;
          const end = start + match[0].length;
          if (!overlaps(start, end)) {
            spans.push([start, end]);
            taken.push([start, end]);
          }
        }
      }
      spans.sort((a, b) => a[0] - b[0]);
      return { group, spans };
    })
    .filter(({ spans }) => spans.length >= 2);
}
