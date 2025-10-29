<template>
  <div class="menu-manage">
    <div class="menu-header">
      <div class="header-content">
        <h2 class="page-title">管理主菜单和子菜单</h2>
      </div>
      <div class="menu-add">
        <input v-model="newMenuName" placeholder="请输入主菜单名称" class="input" />
        <button class="btn btn-primary" @click="addMenu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加主菜单
        </button>
      </div>
    </div>
    
    <div class="menu-content">
      <div class="menu-list">
        <div v-for="menu in menus" :key="menu.id" class="menu-item">
          <!-- 主菜单 -->
          <div class="main-menu">
            <div class="menu-info">
              <div class="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                </svg>
              </div>
              <input v-model="menu.name" @blur="updateMenu(menu)" class="menu-name-input" />
              <div class="menu-order">
                <span class="order-label">排序</span>
                <input v-model.number="menu.sort_order" type="number" @blur="updateMenu(menu)" class="order-input" />
              </div>
            </div>
            <div class="menu-actions">
              <button class="btn btn-icon expand-btn" @click="toggleSubMenu(menu.id)" :title="menu.showSubMenu ? '收起子菜单' : '展开子菜单'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              <button class="btn btn-danger btn-icon" @click="deleteMenu(menu.id)" title="删除主菜单">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 子菜单区域 -->
          <div class="sub-menu-section" :class="{ 'expanded': menu.showSubMenu }">
            <div class="sub-menu-header">
              <div class="sub-menu-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H1l8-8 8 8h-8v8z"/>
                </svg>
                子菜单 ({{ menu.subMenus?.length || 0 }})
              </div>
              <button class="btn btn-sm btn-outline" @click="addSubMenu(menu.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                添加子菜单
              </button>
            </div>

            <!-- 批量操作工具栏 -->
            <SubMenuBatchToolbar
              v-if="menu.showSubMenu && currentMenuId === menu.id"
              :subMenus="currentSubMenus"
              :selectedSubMenus="selectedSubMenus"
              :isAllSelected="isAllSelected"
              :menus="menus.filter(m => m.id !== menu.id)"
              v-model:batchMoveMenuId="batchMoveMenuId"
              @toggle-select-all="toggleSelectAll"
              @execute-batch-move="executeBatchMove"
              @batch-delete="batchDeleteSubMenus"
            />
            
            <div class="sub-menu-list" v-if="menu.subMenus && menu.subMenus.length > 0">
              <div v-for="subMenu in menu.subMenus" :key="subMenu.id" class="sub-menu-item">
                <!-- 复选框 -->
                <label class="sub-menu-checkbox" v-if="currentMenuId === menu.id">
                  <input
                    type="checkbox"
                    :checked="selectedSubMenus.includes(subMenu.id)"
                    @change="toggleSubMenuSelection(subMenu.id)"
                    class="checkbox-input"
                  />
                  <span class="checkmark"></span>
                </label>
                
                <div class="sub-menu-info">
                  <div class="sub-menu-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  </div>
                  <input v-model="subMenu.name" @blur="updateSubMenu(subMenu)" class="sub-menu-name-input" />
                  <div class="sub-menu-order">
                    <input v-model.number="subMenu.sort_order" type="number" @blur="updateSubMenu(subMenu)" class="order-input" />
                  </div>
                </div>
                <div class="sub-menu-actions">
                  <button class="btn btn-danger btn-icon btn-sm" @click="deleteSubMenu(subMenu.id)" title="删除子菜单">
                    <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-sub-menu">
              <!-- <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M9 11H1l8-8 8 8h-8v8z"/>
              </svg> -->
              <p>暂无子菜单</p>
              <button class="btn btn-sm btn-outline" @click="addSubMenu(menu.id)">添加第一个子菜单</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  getMenus,
  addMenu as apiAddMenu,
  updateMenu as apiUpdateMenu,
  deleteMenu as apiDeleteMenu,
  addSubMenu as apiAddSubMenu,
  updateSubMenu as apiUpdateSubMenu,
  deleteSubMenu as apiDeleteSubMenu
} from '../../api';
import SubMenuBatchToolbar from '../../components/SubMenuBatchToolbar.vue';

const menus = ref([]);
const newMenuName = ref('');

// 批量操作状态
const selectedSubMenus = ref([]);
const batchMoveMenuId = ref('');
const currentMenuId = ref(null); // 当前展开的菜单ID

// 计算属性
const currentSubMenus = computed(() => {
  if (!currentMenuId.value) return [];
  const menu = menus.value.find(m => m.id === currentMenuId.value);
  return menu?.subMenus || [];
});

const isAllSelected = computed(() => {
  return currentSubMenus.value.length > 0 &&
         selectedSubMenus.value.length === currentSubMenus.value.length;
});

onMounted(loadMenus);

async function loadMenus() {
  const res = await getMenus();
  menus.value = res.data.map(menu => ({
    ...menu,
    showSubMenu: false // 添加展开状态
  }));
}

async function addMenu() {
  if (!newMenuName.value.trim()) return;
  const maxOrder = menus.value.length
    ? Math.max(...menus.value.map(m => m.sort_order || 0))
    : 0;
  await apiAddMenu({ name: newMenuName.value.trim(), sort_order: maxOrder + 1 });
  newMenuName.value = '';
  loadMenus();
}

async function updateMenu(menu) {
  await apiUpdateMenu(menu.id, { name: menu.name, sort_order: menu.sort_order });
  loadMenus();
}

async function deleteMenu(id) {
  if (!confirm('确定要删除这个主菜单吗？删除后将同时删除其下的所有子菜单和卡片。')) return;
  await apiDeleteMenu(id);
  loadMenus();
}

async function addSubMenu(menuId) {
  const menu = menus.value.find(m => m.id === menuId);
  const subMenuName = prompt('请输入子菜单名称：');
  if (!subMenuName?.trim()) return;

  const maxOrder = menu.subMenus?.length
    ? Math.max(...menu.subMenus.map(sm => sm.sort_order || 0))
    : 0;

  await apiAddSubMenu(menuId, { name: subMenuName.trim(), sort_order: maxOrder + 1 });
  loadMenus();
}

async function updateSubMenu(subMenu) {
  await apiUpdateSubMenu(subMenu.id, { name: subMenu.name, sort_order: subMenu.sort_order });
  loadMenus();
}

async function deleteSubMenu(id) {
  if (!confirm('确定要删除这个子菜单吗？删除后将同时删除其下的所有卡片。')) return;
  await apiDeleteSubMenu(id);
  loadMenus();
}

function toggleSubMenu(menuId) {
  const menu = menus.value.find(m => m.id === menuId);
  if (menu) {
    const willExpand = !menu.showSubMenu;
    
    // 关闭所有其他菜单的展开状态
    menus.value.forEach(m => {
      if (m.id !== menuId) {
        m.showSubMenu = false;
      }
    });
    
    menu.showSubMenu = willExpand;
    
    // 切换菜单时更新当前菜单ID并清空选择
    if (willExpand) {
      currentMenuId.value = menuId;
      selectedSubMenus.value = [];
    } else {
      currentMenuId.value = null;
      selectedSubMenus.value = [];
    }
  }
}

// 批量操作函数
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedSubMenus.value = [];
  } else {
    selectedSubMenus.value = currentSubMenus.value.map(sm => sm.id);
  }
}

function toggleSubMenuSelection(subMenuId) {
  const index = selectedSubMenus.value.indexOf(subMenuId);
  if (index > -1) {
    selectedSubMenus.value.splice(index, 1);
  } else {
    selectedSubMenus.value.push(subMenuId);
  }
}

// 批量操作loading状态
const isBatchOperating = ref(false);

async function executeBatchMove() {
  if (!batchMoveMenuId.value || selectedSubMenus.value.length === 0) return;
  
  // 防止重复点击
  if (isBatchOperating.value) {
    return;
  }

  const targetMenuId = parseInt(batchMoveMenuId.value, 10);
  
  if (targetMenuId === currentMenuId.value) {
    alert('目标主菜单不能与当前主菜单相同');
    return;
  }
  
  // 批量操作数量限制（防止恶意操作）
  if (selectedSubMenus.value.length > 50) {
    alert('一次最多只能移动50个子菜单');
    return;
  }

  if (!confirm(`确定要将选中的 ${selectedSubMenus.value.length} 个子菜单移动到目标主菜单吗？\n\n注意：子菜单下的所有卡片也将一起移动。`)) {
    return;
  }

  isBatchOperating.value = true;
  const successIds = [];
  const failedItems = [];

  try {
    // 批量移动子菜单
    for (const subMenuId of selectedSubMenus.value) {
      try {
        const subMenu = currentSubMenus.value.find(sm => sm.id === subMenuId);
        if (subMenu) {
          await apiUpdateSubMenu(subMenuId, {
            name: subMenu.name,
            sort_order: subMenu.sort_order,
            menu_id: targetMenuId
          });
          successIds.push(subMenuId);
        }
      } catch (error) {
        const subMenu = currentSubMenus.value.find(sm => sm.id === subMenuId);
        failedItems.push({
          id: subMenuId,
          name: subMenu?.name || `ID:${subMenuId}`,
          error: error.response?.data?.message || error.message
        });
      }
    }
    
    selectedSubMenus.value = [];
    batchMoveMenuId.value = '';
    await loadMenus();
    
    // 显示详细结果
    if (failedItems.length === 0) {
      alert(`✅ 成功移动 ${successIds.length} 个子菜单及其下的所有卡片`);
    } else {
      let message = `部分移动完成：\n`;
      message += `✅ 成功: ${successIds.length} 个\n`;
      message += `❌ 失败: ${failedItems.length} 个\n\n`;
      message += `失败项:\n`;
      failedItems.forEach(item => {
        message += `- ${item.name}: ${item.error}\n`;
      });
      alert(message);
    }
  } catch (error) {
    console.error('Batch move failed:', error);
    alert('批量移动过程中发生错误: ' + error.message);
  } finally {
    isBatchOperating.value = false;
  }
}

async function batchDeleteSubMenus() {
  if (selectedSubMenus.value.length === 0) return;
  
  // 防止重复点击
  if (isBatchOperating.value) {
    return;
  }
  
  // 批量操作数量限制
  if (selectedSubMenus.value.length > 50) {
    alert('一次最多只能删除50个子菜单');
    return;
  }
  
  if (!confirm(`⚠️ 危险操作警告！\n\n确定要删除选中的 ${selectedSubMenus.value.length} 个子菜单吗？\n\n删除后将同时删除其下的所有卡片，此操作不可恢复！`)) {
    return;
  }

  isBatchOperating.value = true;
  const successIds = [];
  const failedItems = [];

  try {
    for (const subMenuId of selectedSubMenus.value) {
      try {
        await apiDeleteSubMenu(subMenuId);
        successIds.push(subMenuId);
      } catch (error) {
        const subMenu = currentSubMenus.value.find(sm => sm.id === subMenuId);
        failedItems.push({
          id: subMenuId,
          name: subMenu?.name || `ID:${subMenuId}`,
          error: error.response?.data?.message || error.message
        });
      }
    }
    
    selectedSubMenus.value = [];
    await loadMenus();
    
    // 显示详细结果
    if (failedItems.length === 0) {
      alert(`✅ 成功删除 ${successIds.length} 个子菜单及其下的所有卡片`);
    } else {
      let message = `部分删除完成：\n`;
      message += `✅ 成功: ${successIds.length} 个\n`;
      message += `❌ 失败: ${failedItems.length} 个\n\n`;
      message += `失败项:\n`;
      failedItems.forEach(item => {
        message += `- ${item.name}: ${item.error}\n`;
      });
      alert(message);
    }
  } catch (error) {
    console.error('Batch delete failed:', error);
    alert('批量删除过程中发生错误: ' + error.message);
  } finally {
    isBatchOperating.value = false;
  }
}
</script>

<style scoped>
.menu-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}



.menu-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  width: 94%;
  text-align: center;
}

.header-content {
  margin-bottom: 15px;
  text-align: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}



.menu-add {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.menu-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
}

.menu-list {
  padding: 0;
}

.menu-item {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f8fafc;
}

.main-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: white;
  transition: all 0.3s ease;
}

.menu-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.menu-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.menu-name-input {
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid transparent;
  background: transparent;
  padding: 8px 12px;
  border-radius: 8px;
  color: #1e293b;
  min-width: 200px;
  transition: all 0.2s ease;
}

.menu-name-input:focus {
  outline: none;
  border-color: #667eea;
  background: #f8fafc;
}

.menu-order {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.order-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

.order-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.menu-actions {
  display: flex;
  gap: 8px;
}

.sub-menu-section {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sub-menu-section.expanded {
  max-height: 1000px;
}

.sub-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 32px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.sub-menu-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
}

.sub-menu-list {
  padding: 16px 32px 16px 48px;
  position: relative;
}

.sub-menu-list::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e1);
  border-radius: 1px;
}

.sub-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
  gap: 12px;
}

.sub-menu-item::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 12px;
  height: 2px;
  background: #cbd5e1;
  transform: translateY(-50%);
  border-radius: 1px;
}

.sub-menu-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.sub-menu-item:last-child {
  margin-bottom: 0;
}

.sub-menu-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.sub-menu-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.sub-menu-name-input {
  font-size: 1rem;
  border: 2px solid transparent;
  background: transparent;
  padding: 6px 10px;
  border-radius: 6px;
  color: #374151;
  min-width: 150px;
  transition: all 0.2s ease;
}

.sub-menu-name-input:focus {
  outline: none;
  border-color: #10b981;
  background: #f0fdf4;
}

.sub-menu-order {
  display: flex;
  align-items: center;
}

.sub-menu-actions {
  display: flex;
  gap: 6px;
}

/* 复选框样式 */
.sub-menu-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.sub-menu-checkbox .checkmark {
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-menu-checkbox:hover .checkmark {
  border-color: #3b82f6;
}

.checkbox-input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.sub-menu-checkbox .checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked ~ .checkmark:after {
  display: block;
}

.empty-sub-menu {
  padding: 10px 0px 10px 0px;
  text-align: center;
  color: #64748b;
}

.empty-sub-menu p {
  color: #079f1e;
  margin: 0 0 16px 0;
  font-size: 1rem;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(82deg, #667eea, #2f025d);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  justify-content: center;
  border-radius: 8px;
}

/* 展开子菜单按钮样式 */
.btn-icon.expand-btn {
  width: 200px;
  height: 36px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-icon.btn-sm {
  width: 35px;
  height: 30px;
}

.input {
  padding: 12px 16px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.input:hover {
  border-color: rgba(102, 126, 234, 0.4);
}

.input::placeholder {
  color: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .menu-manage {
    width: 93%;
    padding: 16px;
  }
  
  .menu-header {
    padding: 24px 20px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .menu-add {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input {
    min-width: 0;
  }
  
  .main-menu {
    padding: 20px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .menu-info {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .menu-name-input {
    min-width: 0;
  }
  
  .menu-order {
    justify-content: center;
  }
  
  .menu-actions {
    justify-content: center;
  }
  
  .btn-icon.expand-btn {
    width: 40px;
    height: 32px;
  }
  
  .sub-menu-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .sub-menu-list {
    padding: 12px 20px 12px 32px;
  }
  
  .sub-menu-list::before {
    left: 20px;
  }
  
  .sub-menu-item::before {
    left: -12px;
    width: 8px;
  }
  
  .sub-menu-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .sub-menu-info {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .sub-menu-name-input {
    min-width: 0;
  }
  
  .sub-menu-order {
    justify-content: center;
  }
  
  .sub-menu-actions {
    justify-content: center;
  }
  
  .empty-sub-menu {
    padding: 10px 0px 10px 0px;
  }
}
</style> 