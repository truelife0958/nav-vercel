<template>
  <div class="card-manage">
    <CardHeader
      :menus="menus"
      v-model:selectedMenuId="selectedMenuId"
      v-model:selectedSubMenuId="selectedSubMenuId"
      :currentSubMenus="currentSubMenus"
      v-model:newCardTitle="newCardTitle"
      v-model:newCardUrl="newCardUrl"
      v-model:newCardLogo="newCardLogo"
      @add-card="addCard"
      @show-batch-import="showBatchImport = true"
      @show-json-import="showJsonImport = true"
      @show-html-import="showHtmlImport = true"
    />

    <BatchActionsToolbar
      :cards="cards"
      :selectedCards="selectedCards"
      :isAllSelected="isAllSelected"
      :menus="menus"
      v-model:batchMoveMenuId="batchMoveMenuId"
      v-model:batchMoveSubMenuId="batchMoveSubMenuId"
      :batchMoveSubMenus="batchMoveSubMenus"
      :copiedCards="copiedCards"
      @toggle-select-all="toggleSelectAll"
      @execute-batch-move="executeBatchMove"
      @batch-copy="batchCopyCards"
      @batch-paste="batchPasteCards"
      @batch-update-icons="batchUpdateIcons"
      @batch-delete="batchDeleteCards"
    />

    <CardTable
      :cards="cards"
      :selectedCards="selectedCards"
      :isAllSelected="isAllSelected"
      :menuOptions="menuOptions"
      @toggle-select-all="toggleSelectAll"
      @toggle-card-selection="toggleCardSelection"
      @update-card="updateCard"
      @move-card="moveCard"
      @delete-card="deleteCard"
    />

    <BatchImportModal
      :visible="showBatchImport"
      :menus="menus"
      @close="showBatchImport = false"
      @imported="onImported"
    />
    <JsonImportModal
      :visible="showJsonImport"
      :menus="menus"
      @close="showJsonImport = false"
      @imported="onImported"
    />
    <HtmlImportModal
      :visible="showHtmlImport"
      :menus="menus"
      @close="showHtmlImport = false"
      @imported="onImported"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  getMenus,
  getCards,
  addCard as apiAddCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  getBatchIcons
} from '../../api';
import CardHeader from '../../components/CardHeader.vue';
import BatchActionsToolbar from '../../components/BatchActionsToolbar.vue';
import CardTable from '../../components/CardTable.vue';
import BatchImportModal from '../../components/BatchImportModal.vue';
import JsonImportModal from '../../components/JsonImportModal.vue';
import HtmlImportModal from '../../components/HtmlImportModal.vue';

const menus = ref([]);
const cards = ref([]);
const selectedMenuId = ref(null);
const selectedSubMenuId = ref('');
const newCardTitle = ref('');
const newCardUrl = ref('');
const newCardLogo = ref('');
const showBatchImport = ref(false);
const showJsonImport = ref(false);
const showHtmlImport = ref(false);

// Batch actions state
const selectedCards = ref([]);
const copiedCards = ref([]);
const batchMoveMenuId = ref('');
const batchMoveSubMenuId = ref('');

const currentSubMenus = computed(() => {
  if (!selectedMenuId.value) return [];
  const menu = menus.value.find(m => m.id === selectedMenuId.value);
  return menu?.subMenus || [];
});

const menuOptions = computed(() => {
  return menus.value.flatMap(menu => [
    { value: `${menu.id}-`, label: menu.name },
    ...(menu.subMenus || []).map(subMenu => ({
      value: `${menu.id}-${subMenu.id}`,
      label: `${menu.name} / ${subMenu.name}`
    }))
  ]);
});

const isAllSelected = computed(() => {
  return cards.value.length > 0 && selectedCards.value.length === cards.value.length;
});

const batchMoveSubMenus = computed(() => {
  if (!batchMoveMenuId.value) return [];
  const menu = menus.value.find(m => m.id === batchMoveMenuId.value);
  return menu?.subMenus || [];
});

onMounted(async () => {
  try {
    const res = await getMenus();
    menus.value = res.data;
    if (menus.value.length) {
      selectedMenuId.value = menus.value[0].id;
    }
  } catch (error) {
    console.error('Failed to load menus:', error);
    alert('菜单加载失败');
  }
});

watch([selectedMenuId, selectedSubMenuId], () => {
  loadCards();
  selectedCards.value = [];
});

async function loadCards() {
  if (!selectedMenuId.value) {
    cards.value = [];
    return;
  }
  try {
    const res = await getCards(selectedMenuId.value, selectedSubMenuId.value || null);
    cards.value = res.data;
  } catch (error) {
    console.error('Failed to load cards:', error);
    alert('卡片加载失败');
  }
}

async function addCard() {
  if (!newCardTitle.value || !newCardUrl.value) {
    alert('请输入卡片标题和链接');
    return;
  }
  try {
    await apiAddCard({
      menu_id: selectedMenuId.value,
      sub_menu_id: selectedSubMenuId.value || null,
      title: newCardTitle.value,
      url: newCardUrl.value,
      logo_url: newCardLogo.value
    });
    newCardTitle.value = '';
    newCardUrl.value = '';
    newCardLogo.value = '';
    loadCards();
  } catch (error) {
    console.error('Failed to add card:', error);
    alert('添加卡片失败');
  }
}

async function updateCard(card) {
  try {
    await apiUpdateCard(card.id, card);
  } catch (error) {
    console.error('Failed to update card:', error);
    alert('更新卡片失败');
    loadCards(); // Revert optimistic update on failure
  }
}

async function deleteCard(id) {
  if (!confirm('确定要删除这张卡片吗？')) return;
  try {
    await apiDeleteCard(id);
    loadCards();
  } catch (error) {
    console.error('Failed to delete card:', error);
    alert('删除卡片失败');
  }
}

async function moveCard(card, targetValue) {
  const [menuId, subMenuId] = targetValue.split('-');
  const newMenuId = parseInt(menuId, 10);
  const newSubMenuId = subMenuId ? parseInt(subMenuId, 10) : null;

  if (newMenuId === card.menu_id && newSubMenuId === card.sub_menu_id) return;

  try {
    await apiUpdateCard(card.id, {
      ...card,
      menu_id: newMenuId,
      sub_menu_id: newSubMenuId
    });
    loadCards();
  } catch (error) {
    console.error('Failed to move card:', error);
    alert('移动卡片失败');
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedCards.value = [];
  } else {
    selectedCards.value = cards.value.map(card => card.id);
  }
}

function toggleCardSelection(cardId) {
  const index = selectedCards.value.indexOf(cardId);
  if (index > -1) {
    selectedCards.value.splice(index, 1);
  } else {
    selectedCards.value.push(cardId);
  }
}

async function executeBatchMove() {
  if (!batchMoveMenuId.value || selectedCards.value.length === 0) return;

  const newMenuId = parseInt(batchMoveMenuId.value, 10);
  const newSubMenuId = batchMoveSubMenuId.value ? parseInt(batchMoveSubMenuId.value, 10) : null;

  try {
    // Ideally, backend should support batch updates.
    // Here we do it one by one.
    for (const cardId of selectedCards.value) {
      const cardToMove = cards.value.find(c => c.id === cardId);
      if (cardToMove) {
        await apiUpdateCard(cardId, {
          ...cardToMove,
          menu_id: newMenuId,
          sub_menu_id: newSubMenuId,
        });
      }
    }
    const movedCount = selectedCards.value.length;
    selectedCards.value = [];
    batchMoveMenuId.value = '';
    batchMoveSubMenuId.value = '';
    loadCards();
    alert(`成功移动 ${movedCount} 张卡片`);
  } catch (error) {
    console.error('Batch move failed:', error);
    alert('批量移动失败: ' + error.message);
  }
}

function batchCopyCards() {
  if (selectedCards.value.length === 0) return;
  copiedCards.value = cards.value
    .filter(card => selectedCards.value.includes(card.id))
    .map(({ title, url, logo_url, description, sort_order }) => ({ title, url, logo_url, description, sort_order }));
  alert(`已复制 ${copiedCards.value.length} 张卡片`);
}

async function batchPasteCards() {
  if (copiedCards.value.length === 0 || !selectedMenuId.value) return;
  try {
    for (const cardData of copiedCards.value) {
      await apiAddCard({
        menu_id: selectedMenuId.value,
        sub_menu_id: selectedSubMenuId.value || null,
        ...cardData
      });
    }
    loadCards();
    alert(`成功粘贴 ${copiedCards.value.length} 张卡片`);
  } catch (error) {
    console.error('Batch paste failed:', error);
    alert('批量粘贴失败: ' + error.message);
  }
}

async function batchUpdateIcons() {
  if (selectedCards.value.length === 0) return;
  
  const selectedCardsList = cards.value.filter(card => selectedCards.value.includes(card.id));
  const urls = selectedCardsList.map(card => card.url);
  
  if (!confirm(`确定要为选中的 ${selectedCards.value.length} 张卡片批量更新图标吗？\n这将使用智能图标服务自动获取最佳图标。`)) {
    return;
  }
  
  try {
    // 调用批量获取图标API
    const response = await getBatchIcons(urls);
    const iconResults = response.data;
    
    let updatedCount = 0;
    let failedCount = 0;
    
    // 更新每张卡片的图标
    for (const card of selectedCardsList) {
      const iconData = iconResults.find(item => item.url === card.url);
      if (iconData && iconData.iconUrl) {
        try {
          await apiUpdateCard(card.id, {
            ...card,
            logo_url: iconData.iconUrl
          });
          updatedCount++;
        } catch (error) {
          console.error(`Failed to update icon for card ${card.id}:`, error);
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }
    
    selectedCards.value = [];
    loadCards();
    
    if (failedCount > 0) {
      alert(`图标更新完成！\n成功: ${updatedCount} 张\n失败: ${failedCount} 张`);
    } else {
      alert(`成功更新 ${updatedCount} 张卡片的图标`);
    }
  } catch (error) {
    console.error('Batch update icons failed:', error);
    alert('批量更新图标失败: ' + (error.response?.data?.message || error.message));
  }
}

async function batchDeleteCards() {
  if (selectedCards.value.length === 0) return;
  if (!confirm(`确定要删除选中的 ${selectedCards.value.length} 张卡片吗？`)) return;

  try {
    // Ideally, backend should support batch deletes.
    for (const cardId of selectedCards.value) {
      await apiDeleteCard(cardId);
    }
    const deletedCount = selectedCards.value.length;
    selectedCards.value = [];
    loadCards();
    alert(`成功删除 ${deletedCount} 张卡片`);
  } catch (error) {
    console.error('Batch delete failed:', error);
    alert('批量删除失败: ' + error.message);
  }
}

function onImported() {
  loadCards();
}
</script>

<style scoped>
.card-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>