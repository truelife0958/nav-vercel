<template>
  <div class="card-card">
    <table class="card-table">
      <thead>
        <tr>
          <th width="40">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="$emit('toggle-select-all')"
              class="table-checkbox"
            />
          </th>
          <th>标题</th>
          <th>网址</th>
          <th>Logo链接</th>
          <th>描述</th>
          <th>排序</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="card in cards" :key="card.id" :class="{ 'selected': selectedCards.includes(card.id) }">
          <td>
            <input
              type="checkbox"
              :checked="selectedCards.includes(card.id)"
              @change="$emit('toggle-card-selection', card.id)"
              class="table-checkbox"
            />
          </td>
          <td><input v-model="card.title" @blur="$emit('update-card', card)" class="table-input" /></td>
          <td><input v-model="card.url" @blur="$emit('update-card', card)" class="table-input" /></td>
          <td><input v-model="card.logo_url" @blur="$emit('update-card', card)" class="table-input" placeholder="logo链接(可选)" /></td>
          <td><input v-model="card.description" @blur="$emit('update-card', card)" class="table-input" placeholder="描述（可选）" /></td>
          <td><input v-model.number="card.sort_order" type="number" @blur="$emit('update-card', card)" class="table-input order-input" /></td>
          <td>
            <div class="action-buttons">
              <select
                :value="`${card.menu_id}-${card.sub_menu_id || ''}`"
                @change="$emit('move-card', card, $event.target.value)"
                class="move-select"
                title="移动到分类"
              >
                <option v-for="option in menuOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <button class="btn btn-danger btn-icon" @click="$emit('delete-card', card.id)" title="删除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps([
  'cards',
  'selectedCards',
  'isAllSelected',
  'menuOptions'
]);

defineEmits([
  'toggle-select-all',
  'toggle-card-selection',
  'update-card',
  'move-card',
  'delete-card'
]);
</script>

<style scoped>
.card-card { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; width: 100%; }
.card-table { width: 100%; border-collapse: collapse; }
.card-table th, .card-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
.card-table th { background: #f9fafb; font-weight: 600; }
.table-input { width: 100%; padding: 8px 4px; border-radius: 6px; border: 1px solid #e2e8f0; }
.order-input { width: 60px; }
.action-buttons { display: flex; align-items: center; gap: 8px; justify-content: center; }
.move-select { padding: 4px 8px; border-radius: 6px; border: 1px solid #d0d7e2; }
.btn-danger { background: #ef4444; color: white; }
.btn-icon { width: 32px; height: 32px; padding: 0; justify-content: center; }
.selected { background-color: #eff6ff; }
</style>