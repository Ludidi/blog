<template>
  <div id="gitalk-container"></div>
</template>

<script setup>
import { onMounted } from 'vue';

import Gitalk from 'gitalk';
import 'gitalk/dist/gitalk.css';

onMounted(() => {
  const gitalk = new Gitalk({
    clientID: '8d16a43c16ffb9fbba0b',
    clientSecret: 'e959daa45334b3063d3db4c6ab3c312156bc203b',
    repo: 'blog',
    owner: 'ludidi',
    admin: ['ludd'],
    id: location.pathname, // Ensure uniqueness and length less than 50
    distractionFreeMode: false, // Facebook-like distraction free mode
  });

  gitalk.render('gitalk-container');
});
</script>

<style scoped></style>
