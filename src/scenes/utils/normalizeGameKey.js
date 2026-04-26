export function normalizeGameKey(input, fallbackText = "") {
  const rawInput = String(input || "").trim();
  const value = `${rawInput} ${fallbackText || ""}`.toLowerCase().trim();

  if (!value) return "";

  if (value.includes("1st") || value.includes("grade1") || value.includes("grade 1")) {
    if (value.includes("subtraction")) return "1st_subtraction";
    if (value.includes("addition")) return "1st_addition";
  }

  if (value.includes("2nd") || value.includes("grade2") || value.includes("grade 2")) {
    if (value.includes("place value") || value.includes("placevalue")) return "2nd_place_value";
    if (
      value.includes("fill in the blank") ||
      value.includes("fill-in-the-blank") ||
      value.includes("fill blank") ||
      value.includes("missing number")
    ) return "2nd_fill_blank";
    if (value.includes("multiplication")) return "2nd_multiplication";
    if (value.includes("subtraction")) return "2nd_subtraction";
    if (value.includes("addition")) return "2nd_addition";
  }

  if ([
    "1st_addition",
    "1st_subtraction",
    "2nd_addition",
    "2nd_subtraction",
    "2nd_fill_blank",
    "2nd_place_value",
    "2nd_multiplication",
  ].includes(rawInput)) {
    return rawInput;
  }

  return rawInput;
}
