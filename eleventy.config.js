import { execSync } from "child_process";

export default function (eleventyConfig) {
  // Passthrough copy for built assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("manifest.webmanifest");

  // Reload the dev server when Vite rebuilds the (gitignored) bundle
  eleventyConfig.setServerOptions({ watch: ["assets/script.js"] });

  // Ignore source/config files that shouldn't be in the output
  eleventyConfig.ignores.add("*.md");
  eleventyConfig.ignores.add("src/**");
  eleventyConfig.ignores.add("*.json");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("*.ts");

  // Git build revision for cache-busting (mirrors site.github.build_revision)
  let buildRevision;
  try {
    buildRevision = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
    }).trim();
  } catch {
    buildRevision = Date.now().toString();
  }

  eleventyConfig.addGlobalData("site", {
    github: { build_revision: buildRevision },
  });

  // Liquid filter: relative_url (returns path as-is for root-relative sites)
  eleventyConfig.addFilter("relative_url", (url) => url);

  return {
    dir: {
      input: ".",
      output: "_site",
    },
    htmlTemplateEngine: "liquid",
  };
}
