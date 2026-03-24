<template>
  <NuxtLayout>
    <Html lang="en" :data-route-path="$route?.path">
      <Head>
        <Title>Solar System Dependency Dashboard</Title>
        <Meta name="language" content="en" />
        <Meta
          name="description"
          content="Interactive dashboard that visualizes repository dependency health as a solar system, with risk insights and outdated package tracking."
        />
        <Meta property="og:type" content="website" />
        <Meta property="og:site_name" content="Solar System Dependency Dashboard" />
        <Meta property="og:title" content="Solar System Dependency Dashboard" />
        <Meta
          property="og:description"
          content="Interactive dashboard that visualizes repository dependency health as a solar system, with risk insights and outdated package tracking."
        />
        <Meta property="og:image" content="/favicon.png" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content="Solar System Dependency Dashboard" />
        <Meta
          name="twitter:description"
          content="Interactive dashboard that visualizes repository dependency health as a solar system, with risk insights and outdated package tracking."
        />
        <Meta name="twitter:image" content="/favicon.png" />
        <Meta name="theme-color" content="#020617" />
        <Meta name="url" :content="`${nuxtApp?.$app_origin}${$route?.path}`" />
        <Meta property="og:url" :content="`${nuxtApp?.$app_origin}${$route?.path}`" />
        <Link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <Link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <Link rel="apple-touch-icon" type="image/png" href="/favicon.png" />
        <Link rel="apple-touch-startup-image" href="/favicon.png" />
      </Head>
    </Html>
    <NuxtAnnouncer />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
const nuxtApp = useNuxtApp();
</script>
