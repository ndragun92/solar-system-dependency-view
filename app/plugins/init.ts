export default defineNuxtPlugin((nuxtApp) => {
  const host = useRequestURL();
  nuxtApp.provide("app_origin", host.origin);
  nuxtApp.provide("app_hostname", host.hostname);
});
