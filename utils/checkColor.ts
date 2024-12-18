const checkColor = (hsl: string): string => {
  // Parse the HSL string using regular expression
  const regex = /hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/;
  const match = hsl.match(regex);

  if (!match) {
    throw new Error("Invalid HSL format");
  }

  // Extract values from the HSL string
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10) / 100; // Convert percentage to 0-1 scale
  const l = parseInt(match[3], 10) / 100; // Convert percentage to 0-1 scale

  // Return black or white text based on luminance
  return l > 0.5 ? "#000000" : "#FFFFFF";
};

export default checkColor;
