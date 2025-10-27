<template>
  <div class="ad-manage" style="display: block !important; width: 90% !important; max-width: 1400px !important; margin: 0 auto !important; padding: 20px !important; background: white !important; min-height: 800px !important; position: relative !important; z-index: 1 !important;">
    <!-- 艹！调试用的明显标记 -->
    <div style="background: red; color: white; padding: 20px; font-size: 24px; margin: 20px 0;">
      ⚠️ 如果你能看到这个红色区域，说明组件加载正常！
    </div>

    <div class="ad-header" style="position: fixed !important; top: 200px !important; left: 200px !important; width: 800px !important; background: yellow !important; border: 10px solid orange !important; padding: 20px !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; overflow: visible !important; z-index: 99999 !important;">
      <h3 style="color: black !important; font-size: 32px !important; display: block !important;">🟡 这是ad-header区域（黄色） - 固定定位测试</h3>
      <form class="ad-add-row" @submit.prevent="handleAddAd" style="background: lime !important; border: 3px solid green !important; padding: 15px !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 100px !important;">
        <p style="color: black !important; font-size: 24px !important; width: 100% !important; display: block !important;">🟢 这是表单区域（绿色） - 如果你能看到这个，说明CSS没问题</p>
        <input v-model="newAdImg" placeholder="广告图片链接" class="input" />
        <input v-model="newAdUrl" placeholder="广告跳转链接" class="input" />
        <select v-model="newAdPos" class="input select-input">
          <option value="left">左侧广告</option>
          <option value="right">右侧广告</option>
        </select>
        <button class="btn" type="submit">添加广告</button>
      </form>
    </div>
    <div class="ad-section" style="background: cyan !important; border: 5px solid blue !important; padding: 20px !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 100px !important; margin-bottom: 20px !important;">
      <h3 class="section-title" style="color: black !important; font-size: 24px !important; display: block !important;">左侧广告列表（青色区域）</h3>
      <div class="ad-card">
        <table class="ad-table" v-if="leftAds.length > 0">
          <thead><tr><th>图片</th><th>跳转链接</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="ad in leftAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="input" /></td>
              <td><button class="btn btn-danger" @click="deleteAd(ad.id)">删除广告</button></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state" style="background: orange !important; color: black !important; padding: 40px 20px !important; font-size: 24px !important; font-weight: bold !important; border: 5px solid red !important; display: block !important; visibility: visible !important;">暂无左侧广告（橙色提示）</div>
      </div>
    </div>
    <div class="ad-section" style="background: pink !important; border: 5px solid purple !important; padding: 20px !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 100px !important; margin-bottom: 20px !important;">
      <h3 class="section-title" style="color: black !important; font-size: 24px !important; display: block !important;">右侧广告列表（粉色区域）</h3>
      <div class="ad-card">
        <table class="ad-table" v-if="rightAds.length > 0">
          <thead><tr><th>图片</th><th>跳转链接</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="ad in rightAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="input" /></td>
              <td><button class="btn btn-danger" @click="deleteAd(ad.id)">删除广告</button></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state" style="background: orange !important; color: black !important; padding: 40px 20px !important; font-size: 24px !important; font-weight: bold !important; border: 5px solid red !important; display: block !important; visibility: visible !important;">暂无右侧广告（橙色提示）</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAds, addAd as apiAddAd, updateAd as apiUpdateAd, deleteAd as apiDeleteAd } from '../../api';

const leftAds = ref([]);
const rightAds = ref([]);
const newAdImg = ref('');
const newAdUrl = ref('');
const newAdPos = ref('left');

onMounted(loadAds);

async function loadAds() {
  try {
    console.log('Loading ads...');
    const res = await getAds();
    console.log('Ads response:', res.data);
    leftAds.value = res.data.filter(ad => ad.position === 'left');
    rightAds.value = res.data.filter(ad => ad.position === 'right');
    console.log('Left ads:', leftAds.value);
    console.log('Right ads:', rightAds.value);
  } catch (error) {
    console.error('Failed to load ads:', error);
    alert('加载广告失败: ' + (error.response?.data?.error || error.message));
  }
}
async function handleAddAd() {
  if (!newAdImg.value || !newAdUrl.value) {
    alert('请填写广告图片链接和跳转链接');
    return;
  }
  try {
    console.log('Adding ad:', { position: newAdPos.value, img: newAdImg.value, url: newAdUrl.value });
    const response = await apiAddAd({ position: newAdPos.value, img: newAdImg.value, url: newAdUrl.value });
    console.log('Add ad response:', response);
    newAdImg.value = '';
    newAdUrl.value = '';
    newAdPos.value = 'left';
    loadAds();
  } catch (error) {
    console.error('Add ad failed:', error);
    alert('添加广告失败: ' + (error.response?.data?.error || error.message));
  }
}
async function updateAd(ad) {
  try {
    console.log('Updating ad:', ad);
    const response = await apiUpdateAd(ad.id, { img: ad.img, url: ad.url });
    console.log('Update ad response:', response);
    loadAds();
  } catch (error) {
    console.error('Update ad failed:', error);
    alert('更新广告失败: ' + (error.response?.data?.error || error.message));
  }
}
async function deleteAd(id) {
  if (!confirm('确定要删除这个广告吗？')) {
    return;
  }
  try {
    console.log('Attempting to delete ad with ID:', id);
    const response = await apiDeleteAd(id);
    console.log('Delete ad response:', response);
    if (response.data && response.data.deleted > 0) {
      alert('删除成功');
    } else {
      alert('删除失败：未找到该记录');
    }
    loadAds();
  } catch (error) {
    console.error('Delete ad failed:', error);
    alert('删除广告失败: ' + (error.response?.data?.error || error.message));
  }
}
</script>

<style scoped>
.ad-manage {
  max-width: 1400px;
  width: 90%;
  margin: 0 auto;
}
.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 32px 0 32px 0;
  letter-spacing: 2px;
  color: #222;
}
.section-title {
  text-align: left;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #2566d8;
}
.ad-header {
  min-height: 80px;
  margin-bottom: 32px;
}
.ad-section {
  margin-bottom: 32px;
}
.ad-add {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.ad-card {
  width: 98%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 20px 10px;
}
.input {
  padding: 12px 8px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  margin-right: 8px;
}
.input:focus {
  outline: 2px solid #2566d8;
}
.btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.2s;
}
.btn:hover {
  background: #174ea6;
}
.btn-danger {
  background: #e74c3c;
  display: inline-block;
  margin: 0 auto;
}
.btn-danger:hover {
  background: #c0392b;
}
.ad-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #222;
  border-radius: 8px;
  overflow: hidden;
}
.ad-table th, .ad-table td {
  padding: 10px 14px;
  border: 1px solid #e3e6ef;
}
.ad-table th {
  background: #f5f7fa;
  color: #222;
  font-weight: bold;
}
.ad-table td input {
  width: 95%;
  background: #f9f9f9;
  color: #222;
  border: 1px solid #d0d7e2;
  border-radius: 4px;
  padding: 4px 8px;
}
.ad-table th:last-child,
.ad-table td:last-child {
  text-align: center;
  vertical-align: middle;
}
.ad-add-group {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: flex-start;
}
.ad-add-block {
  background: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 24px 32px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}
.ad-add-block .section-title {
  margin-bottom: 12px;
  color: #2566d8;
  font-size: 1.1rem;
  font-weight: bold;
}
.ad-add-block .input {
  margin-bottom: 12px;
  width: 100%;
}
.ad-add-block .btn {
  width: 100%;
  font-size: 1rem;
  padding: 10px 0;
}
.ad-add-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg,#667eea,#764ba2);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 24px 32px 16px 32px;
  min-width: 600px;
}
.select-input {
  min-width: 120px;
  height: 38px;
}
.ad-add-row input[type="text"], .ad-add-row input.input {
  width: 18rem !important;
  min-width: 200px;
  max-width: 100%;
}
@media (max-width: 768px) {
  .admin-content{
    width: 92%;
  }
  .ad-manage {
    width: 100%;
    padding: 0 2vw;
  }
  .ad-header {
    height: auto;
    margin-bottom: 2rem;
  }
  .ad-add-row {
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    width: 92%;
    margin: 0 auto;
    padding: 20px !important;
  }
  .ad-section {
    width: 92%;
    margin: 0 auto 2rem auto;
  }
  .ad-card {
    width: 100%;
    padding: 12px 8px;
  }
  .ad-table {
    width: 100%;
    font-size: 14px;
    table-layout: auto;
  }
  .ad-table th, .ad-table td {
    padding: 8px 6px;
    font-size: 13px;
    word-break: break-all;
  }
  .ad-table th:first-child,
  .ad-table td:first-child {
    width: 40%;
  }
  .ad-table th:nth-child(2),
  .ad-table td:nth-child(2) {
    width: 40%;
  }
  .ad-table th:last-child,
  .ad-table td:last-child {
    width: 20%;
  }
  .ad-table td input {
    width: 100%;
    font-size: 12px;
    padding: 4px 6px;
  }
  .input, .select-input {
    width: 100%;
    min-width: 0;
    margin-right: 0;
    margin-bottom: 8px;
    font-size: 14px;
    padding: 8px;
    height: auto;
    box-sizing: border-box;
  }
  .btn {
    width: 100%;
    margin-right: 0;
    padding: 12px 0;
    font-size: 14px;
  }
  .btn-danger {
    padding: 6px 12px;
    font-size: 12px;
    width: auto;
    min-width: 60px;
  }
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 16px;
}
</style> 