<template>
  <nav class="menu-bar">
    <div
      v-for="menu in menus"
      :key="menu.id"
      class="menu-item"
    >
      <button
        @click="$emit('select', menu)"
        :class="{active: menu.id === activeId}"
      >
        {{ menu.name }}
      </button>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  menus: Array,
  activeId: Number,
  activeSubMenuId: Number
});
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 1rem;
  position: relative;
  gap: 8px;
}

.menu-item {
  position: relative;
}

.menu-bar button {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
  padding: 10px 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
}

.menu-bar button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(57, 157, 255, 0.2) 0%,
    rgba(118, 75, 162, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-bar button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #399dff, #667eea);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px 2px 0 0;
}

.menu-bar button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-bar button:hover::before {
  opacity: 1;
}

.menu-bar button.active {
  color: #fff;
  background: rgba(57, 157, 255, 0.2);
  border-color: rgba(57, 157, 255, 0.4);
  box-shadow: 0 2px 8px rgba(57, 157, 255, 0.3);
}

.menu-bar button.active::before {
  opacity: 1;
}

.menu-bar button.active::after {
  width: 70%;
}

@media (max-width: 768px) {
  .menu-bar {
    gap: 6px;
    padding: 0 0.8rem;
  }
  
  .menu-bar button {
    font-size: 14px;
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .menu-bar {
    gap: 4px;
    padding: 0 0.5rem;
  }
  
  .menu-bar button {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style> 