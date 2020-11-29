// @ts-ignore
import { UserConfig } from "vite";

const config: UserConfig = {
  optimizeDeps: {
    include: ["@ant-design/colors", "@ant-design-vue/use"],
  },
  
};

export default config;
