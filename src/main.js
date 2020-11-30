import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { Input, Modal, Button, Radio, Form } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

createApp(App)
  .use(router)
  .use(Input)
  .use(Modal)
  .use(Button)
  .use(Radio)
  .use(Form)
  .mount("#app");


