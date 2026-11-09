import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [
  { ignores: ["next-env.d.ts", ".claude/**", ".next/**", "node_modules/**", "shots/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
