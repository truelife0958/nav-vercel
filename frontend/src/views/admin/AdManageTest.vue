<template>
  <div class="ad-manage-test">
    <h1 style="color: red; font-size: 3rem;">广告管理测试页面</h1>
    <p>如果你能看到这段文字，说明组件渲染正常</p>

    <div class="debug-info">
      <h3>调试信息：</h3>
      <p>leftAds 数量: {{ leftAds.length }}</p>
      <p>rightAds 数量: {{ rightAds.length }}</p>
      <p>加载状态: {{ loading ? '加载中...' : '已加载' }}</p>
      <p>错误信息: {{ error || '无错误' }}</p>
    </div>

    <div class="test-form" style="background: yellow; padding: 20px; margin: 20px 0;">
      <h3>测试表单（黄色背景）</h3>
      <input v-model="newAdImg" placeholder="广告图片链接" style="width: 300px; height: 40px;" />
      <input v-model="newAdUrl" placeholder="广告跳转链接" style="width: 300px; height: 40px;" />
      <button @click="testAdd" style="padding: 10px 20px; background: green; color: white;">测试添加</button>
    </div>

    <div style="background: lightblue; padding: 20px;">
      <h3>API响应原始数据：</h3>
      <pre>{{ rawData }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAds, addAd as apiAddAd } from '../../api';

const leftAds = ref([]);
const rightAds = ref([]);
const newAdImg = ref('');
const newAdUrl = ref('');
const loading = ref(true);
const error = ref('');
const rawData = ref(null);

onMounted(async () => {
  try {
    console.log('=== 开始加载广告数据 ===');
    const res = await getAds();
    console.log('API响应:', res);
    rawData.value = res.data;

    leftAds.value = res.data.filter(ad => ad.position === 'left');
    rightAds.value = res.data.filter(ad => ad.position === 'right');

    console.log('左侧广告:', leftAds.value);
    console.log('右侧广告:', rightAds.value);

    loading.value = false;
  } catch (err) {
    console.error('加载失败:', err);
    error.value = err.message;
    loading.value = false;
  }
});

function testAdd() {
  alert('测试按钮点击成功！表单值：img=' + newAdImg.value + ', url=' + newAdUrl.value);
}
</script>

<style scoped>
.ad-manage-test {
  padding: 20px;
  background: white;
  min-height: 500px;
}
.debug-info {
  background: #f0f0f0;
  padding: 15px;
  margin: 20px 0;
  border: 2px solid #333;
}
.debug-info p {
  margin: 5px 0;
  font-size: 16px;
}
</style>
