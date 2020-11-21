import { createRouter, createWebHashHistory } from "vue-router";
// 1. Define route components.
// These can be imported from other files
import index from "../views/index.vue";
import online from "../views/online.vue";

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  {
    path: "/",
    component: index,
  },
  {
    path: "/online",
    component: online,
  },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

const routePathSet = new Set(routes.map((value) => value.path));

//路由守卫
router.beforeEach((to, from, next) => {
  if (!routePathSet.has(to.path)) {
    next({
      path: "/",
    });
  } else {
    next();
  }
});

export default router;
