<template>
  <div class="ad-manage">
    <div class="ad-header">
      <h3 class="section-title">添加新广告</h3>
      <form class="ad-add-row" @submit.prevent="handleAddAd">
        <input v-model="newAdImg" placeholder="广告图片链接" class="input" />
        <input v-model="newAdUrl" placeholder="广告跳转链接" class="input" />
        <select v-model="newAdPos" class="input select-input">
          <option value="left">左侧广告</option>
          <option value="right">右侧广告</option>
        </select>
        <button class="btn" type="submit">添加广告</button>
      </form>
    </div>

    <div class="ad-section">
      <h3 class="section-title">左侧广告列表</h3>
      <div class="ad-card">
        <table class="ad-table" v-if="leftAds.length > 0">
          <thead>
            <tr>
              <th>图片链接</th>
              <th>跳转链接</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in leftAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="input" /></td>
              <td><button class="btn btn-danger" @click="deleteAd(ad.id)">删除</button></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">暂无左侧广告</div>
      </div>
    </div>

    <div class="ad-section">
      <h3 class="section-title">右侧广告列表</h3>
      <div class="ad-card">
        <table class="ad-table" v-if="rightAds.length > 0">
          <thead>
            <tr>
              <th>图片链接</th>
              <th>跳转链接</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in rightAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="input" /></td>
              <td><button class="btn btn-danger" @click="deleteAd(ad.id)">删除</button></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">暂无右侧广告</div>
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
    alert('添加成功！');
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
    const response = await apiUpdateAd(ad.id, { position: ad.position, img: ad.img, url: ad.url });
    console.log('Update ad response:', response);
    alert('更新成功！');
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
  padding: 20px;
}

.section-title {
  text-align: left;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: #2566d8;
}

.ad-header {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.ad-header .section-title {
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

.ad-section {
  margin-bottom: 32px;
}

.ad-card {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.ad-add-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
}

.input:focus {
  outline: 2px solid #2566d8;
  border-color: #2566d8;
}

.select-input {
  min-width: 120px;
  flex: 0 0 auto;
}

.btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn:hover {
  background: #174ea6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 102, 216, 0.3);
}

.btn-danger {
  background: #e74c3c;
  padding: 8px 16px;
}

.btn-danger:hover {
  background: #c0392b;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.ad-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #222;
  border-radius: 8px;
  overflow: hidden;
}

.ad-table th,
.ad-table td {
  padding: 12px 16px;
  border: 1px solid #e3e6ef;
  text-align: left;
}

.ad-table th {
  background: #f5f7fa;
  color: #222;
  font-weight: bold;
  font-size: 14px;
}

.ad-table td input {
  width: 100%;
  background: #f9f9f9;
  color: #222;
  border: 1px solid #d0d7e2;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
}

.ad-table td input:focus {
  outline: 2px solid #2566d8;
  background: #fff;
}

.ad-table th:last-child,
.ad-table td:last-child {
  text-align: center;
  width: 120px;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 60px 20px;
  font-size: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .ad-manage {
    width: 95%;
    padding: 16px;
  }

  .ad-header {
    padding: 20px 16px;
  }

  .ad-add-row {
    flex-direction: column;
    gap: 12px;
  }

  .input,
  .select-input {
    width: 100%;
    min-width: 0;
  }

  .btn {
    width: 100%;
  }

  .ad-card {
    padding: 16px;
    overflow-x: auto;
  }

  .ad-table {
    font-size: 13px;
  }

  .ad-table th,
  .ad-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .ad-table td input {
    font-size: 12px;
    padding: 4px 8px;
  }

  .btn-danger {
    padding: 6px 12px;
    font-size: 12px;
  }

  .empty-state {
    padding: 40px 16px;
    font-size: 14px;
  }
}
</style>