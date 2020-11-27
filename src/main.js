import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import router from "./router";

import { Input, Modal, Button, Radio, Form } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
// import 'ant-design-vue/lib/input/style/css';
// import 'ant-design-vue/lib/modal/style/css';
// import 'ant-design-vue/lib/button/style/css';
// import 'ant-design-vue/lib/radio/style/css';
// import 'ant-design-vue/lib/form/style/css';

createApp(App)
  .use(router)
  .use(Input)
  .use(Modal)
  .use(Button)
  .use(Radio)
  .use(Form)
  .mount("#app");
