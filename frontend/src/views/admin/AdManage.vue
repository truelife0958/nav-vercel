<template>
  <div class="ad-manage-container">
    <div class="ad-manage-wrapper">
      <div class="ad-header-section">
        <h3 class="section-title-main">添加新广告</h3>
        <form class="ad-add-form" @submit.prevent="handleAddAd">
          <input v-model="newAdImg" placeholder="广告图片链接" class="form-input" required />
          <input v-model="newAdUrl" placeholder="广告跳转链接" class="form-input" required />
          <select v-model="newAdPos" class="form-select">
            <option value="left">左侧广告</option>
            <option value="right">右侧广告</option>
          </select>
          <button class="form-btn" type="submit">添加广告</button>
        </form>
      </div>

      <div class="ad-list-section">
        <h3 class="section-title-main">左侧广告列表</h3>
        <div class="ad-table-card">
          <table class="data-table" v-if="leftAds.length > 0">
            <thead>
              <tr>
                <th>图片链接</th>
                <th>跳转链接</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ad in leftAds" :key="ad.id">
                <td><input v-model="ad.img" @blur="updateAd(ad)" class="table-input" /></td>
                <td><input v-model="ad.url" @blur="updateAd(ad)" class="table-input" /></td>
                <td><button class="delete-btn" @click="deleteAd(ad.id)">删除</button></td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-message">暂无左侧广告</div>
        </div>
      </div>

      <div class="ad-list-section">
        <h3 class="section-title-main">右侧广告列表</h3>
        <div class="ad-table-card">
          <table class="data-table" v-if="rightAds.length > 0">
            <thead>
              <tr>
                <th>图片链接</th>
                <th>跳转链接</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ad in rightAds" :key="ad.id">
                <td><input v-model="ad.img" @blur="updateAd(ad)" class="table-input" /></td>
                <td><input v-model="ad.url" @blur="updateAd(ad)" class="table-input" /></td>
                <td><button class="delete-btn" @click="deleteAd(ad.id)">删除</button></td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-message">暂无右侧广告</div>
        </div>
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

<style>
/* 使用全局样式避免 scoped 问题 */
.ad-manage-container {
  width: 100% !important;
  max-width: 1400px !important;
  margin: 0 auto !important;
  padding: 20px !important;
  background: #f5f6fa !important;
  min-height: 600px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.ad-manage-wrapper {
  width: 100% !important;
  display: block !important;
}

.section-title-main {
  text-align: left !important;
  font-size: 1.3rem !important;
  font-weight: bold !important;
  margin-bottom: 16px !important;
  color: #2566d8 !important;
  display: block !important;
}

.ad-header-section {
  margin-bottom: 32px !important;
  padding: 24px !important;
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  display: block !important;
}

.ad-header-section .section-title-main {
  color: #fff !important;
  text-align: center !important;
  margin-bottom: 20px !important;
}

.ad-list-section {
  margin-bottom: 32px !important;
  display: block !important;
}

.ad-table-card {
  width: 100% !important;
  background: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  padding: 20px !important;
  display: block !important;
}

.ad-add-form {
  display: flex !important;
  gap: 16px !important;
  justify-content: center !important;
  align-items: center !important;
  flex-wrap: wrap !important;
}

.form-input, .form-select {
  padding: 12px 16px !important;
  border-radius: 8px !important;
  border: 1px solid #d0d7e2 !important;
  background: #fff !important;
  color: #222 !important;
  font-size: 14px !important;
  flex: 1 !important;
  min-width: 200px !important;
  display: inline-block !important;
}

.form-input:focus, .form-select:focus {
  outline: 2px solid #2566d8 !important;
  border-color: #2566d8 !important;
}

.form-select {
  min-width: 120px !important;
  flex: 0 0 auto !important;
}

.form-btn {
  background: #2566d8 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 12px 24px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s !important;
  white-space: nowrap !important;
  display: inline-block !important;
}

.form-btn:hover {
  background: #174ea6 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(37, 102, 216, 0.3) !important;
}

.delete-btn {
  background: #e74c3c !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s !important;
  display: inline-block !important;
}

.delete-btn:hover {
  background: #c0392b !important;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3) !important;
}

.data-table {
  width: 100% !important;
  border-collapse: collapse !important;
  background: #fff !important;
  color: #222 !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  display: table !important;
}

.data-table th,
.data-table td {
  padding: 12px 16px !important;
  border: 1px solid #e3e6ef !important;
  text-align: left !important;
  display: table-cell !important;
}

.data-table th {
  background: #f5f7fa !important;
  color: #222 !important;
  font-weight: bold !important;
  font-size: 14px !important;
}

.table-input {
  width: 100% !important;
  background: #f9f9f9 !important;
  color: #222 !important;
  border: 1px solid #d0d7e2 !important;
  border-radius: 4px !important;
  padding: 6px 10px !important;
  font-size: 13px !important;
  display: block !important;
}

.table-input:focus {
  outline: 2px solid #2566d8 !important;
  background: #fff !important;
}

.data-table th:last-child,
.data-table td:last-child {
  text-align: center !important;
  width: 120px !important;
}

.empty-message {
  text-align: center !important;
  color: #999 !important;
  padding: 60px 20px !important;
  font-size: 16px !important;
  background: #f9f9f9 !important;
  border-radius: 8px !important;
  display: block !important;
}

@media (max-width: 768px) {
  .ad-manage-container {
    width: 100% !important;
    padding: 16px !important;
  }

  .ad-header-section {
    padding: 20px 16px !important;
  }

  .ad-add-form {
    flex-direction: column !important;
    gap: 12px !important;
  }

  .form-input,
  .form-select {
    width: 100% !important;
    min-width: 0 !important;
  }

  .form-btn {
    width: 100% !important;
  }

  .ad-table-card {
    padding: 16px !important;
    overflow-x: auto !important;
  }

  .data-table {
    font-size: 13px !important;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px !important;
    font-size: 12px !important;
  }

  .table-input {
    font-size: 12px !important;
    padding: 4px 8px !important;
  }

  .delete-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }

  .empty-message {
    padding: 40px 16px !important;
    font-size: 14px !important;
  }
}
</style>