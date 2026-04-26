export const ASSIGNMENT_THEME = {
  /* ✅ 1ST GRADE — MATCH 2ND GRADE COLORS */
  "1st_addition": {
    accent: "#7ec8f8", // same as 2nd_addition
    preview: "/star_preview.png",
  },

  "1st_subtraction": {
    accent: "#f39a9a", // same as 2nd_subtraction
    preview: "/star_preview.png",
  },

  /* 2ND GRADE (UNCHANGED) */
  "2nd_addition": {
    accent: "#7ec8f8",
    preview: "/star_preview.png",
  },

  "2nd_subtraction": {
    accent: "#f39a9a",
    preview: "/star_preview.png",
  },

  "2nd_fill_blank": {
    accent: "#7fd6b5",
    preview: "/star_preview.png",
  },

  "2nd_place_value": {
    accent: "#c39cf6",
    preview: "/star_preview.png",
  },

  "2nd_multiplication": {
    accent: "#9b7be8",
    preview: "/star_preview.png",
  },
};

export function getAssignmentTheme(gameKey) {
  return ASSIGNMENT_THEME[gameKey] || {
    accent: "#7ec8f8",
    preview: "/star_preview.png",
  };
}