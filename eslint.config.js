import react from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{ts,tsx}"] ,
    plugins: { react },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off"
    }
  }
];
