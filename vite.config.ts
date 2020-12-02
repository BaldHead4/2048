// @ts-ignore
import { UserConfig } from "vite";

const fs = require("fs");
const path = require("path");
const lexer = require("es-module-lexer");

const config: UserConfig = {
  optimizeDeps: {
    include: ["@ant-design/colors", "@ant-design-vue/use"],
  },
  transforms: [
    {
      test({ path, query, isBuild }) {
        return (
          path.endsWith(".vue") &&
          (isBuild ? query.type === "script" : !query.type)
        );
      },
      transform({ code }) {
        return code;
        const [imports] = lexer.parse(code);
        const antDesignComps = new Set();
        for (const position of imports) {
          const module = code.substring(position.s, position.e);
          if (module === "ant-design-vue") {
            const statement = code.substring(position.ss, position.se);
            let match;
            if ((match = statement.match(/\{(.+)\}/))) {
              const compNames = match[1]
                .split(",")
                .map((compName) => compName.trim());
              compNames.forEach((compName) => {
                const kebabName = compName
                  .replace(/[a-z][A-Z]/g, (m) => `${m[0]}-${m[1]}`)
                  .toLowerCase();
                antDesignComps.add(kebabName);
              });
            }
          }
        }
        antDesignComps.forEach((name) => {
          const cssJSPath = `ant-design-vue/es/${name}/style/css.js`;
          const cssRequire = fs.readFileSync(
            require.resolve(cssJSPath),
            "utf-8"
          );
          const [imports] = lexer.parse(cssRequire);
          for (const position of imports) {
            const cssPath = cssRequire.substring(position.s, position.e);
            let _import = `\nimport '${path.join(
              path.dirname(cssJSPath),
              cssPath
            )}';`;
            _import = _import.replace(/\\/g, "/");
            console.log(_import);
            code += _import;
          }
        });
        return code;
      },
    },
  ],
};

export default config;
