<template>
  <div v-if="activeMenu && activeMenu.subMenus && activeMenu.subMenus.length > 0" class="sub-menu-bar-container">
    <div class="sub-menu-bar" ref="subMenuBarRef">
      <div class="sub-menu-scroll" ref="subMenuScrollRef">
        <button
          v-for="subMenu in activeMenu.subMenus"
          :key="subMenu.id"
          @click="$emit('select', subMenu, activeMenu)"
          :class="{active: subMenu.id === activeSubMenuId}"
          class="sub-menu-btn"
        >
          {{ subMenu.name }}
        </button>
      </div>
    </div>
    <button
      v-if="canScrollLeft"
      @click="scrollLeft"
      class="scroll-btn scroll-left"
      aria-label="向左滚动"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <button
      v-if="canScrollRight"
      @click="scrollRight"
      class="scroll-btn scroll-right"
      aria-label="向右滚动"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <!-- 分隔装饰 -->
    <div class="separator-decoration">
      <div class="separator-line"></div>
      <div class="separator-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  activeMenu: Object,
  activeSubMenuId: Number
});

const emit = defineEmits(['select']);

const subMenuBarRef = ref(null);
const subMenuScrollRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

function updateScrollButtons() {
  if (!subMenuScrollRef.value || !subMenuBarRef.value) return;

  const scrollElement = subMenuScrollRef.value;
  const containerElement = subMenuBarRef.value;

  canScrollLeft.value = scrollElement.scrollLeft > 0;
  canScrollRight.value = scrollElement.scrollLeft < (scrollElement.scrollWidth - containerElement.clientWidth);
}

function scrollLeft() {
  if (!subMenuScrollRef.value) return;
  subMenuScrollRef.value.scrollBy({ left: -200, behavior: 'smooth' });
}

function scrollRight() {
  if (!subMenuScrollRef.value) return;
  subMenuScrollRef.value.scrollBy({ left: 200, behavior: 'smooth' });
}

function handleScroll() {
  updateScrollButtons();
}

function handleResize() {
  updateScrollButtons();
}

// 监听activeMenu变化，重新计算滚动按钮
watch(() => props.activeMenu, () => {
  nextTick(() => {
    updateScrollButtons();
  });
}, { deep: true });

onMounted(() => {
  if (subMenuScrollRef.value) {
    subMenuScrollRef.value.addEventListener('scroll', handleScroll);
  }
  window.addEventListener('resize', handleResize);

  nextTick(() => {
    updateScrollButtons();
  });
});

onBeforeUnmount(() => {
  if (subMenuScrollRef.value) {
    subMenuScrollRef.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sub-menu-bar-container {
  position: relative;
  max-width: 55rem;
  margin: 0 auto;
  padding: 0 1rem 2rem 1rem;
  z-index: 10;
}

.sub-menu-bar {
  position: relative;
  overflow: hidden;
}

.sub-menu-scroll {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0;
  gap: 0;
  justify-content: center;
}

.sub-menu-scroll::-webkit-scrollbar {
  display: none;
}

.sub-menu-btn {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  margin: 0 4px;
}

.sub-menu-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(57, 157, 255, 0.15) 0%,
    rgba(102, 126, 234, 0.15) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sub-menu-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #399dff, #667eea);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px 2px 0 0;
}

.sub-menu-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.sub-menu-btn:hover::before {
  opacity: 1;
}

.sub-menu-btn.active {
  color: #fff;
  background: rgba(57, 157, 255, 0.18);
  border-color: rgba(57, 157, 255, 0.35);
  box-shadow: 0 2px 6px rgba(57, 157, 255, 0.25);
}

.sub-menu-btn.active::before {
  opacity: 1;
}

.sub-menu-btn.active::after {
  width: 60%;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #666;
}

.scroll-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #399dff;
  transform: translateY(-50%) scale(1.1);
}

.scroll-left {
  left: -18px;
}

.scroll-right {
  right: -18px;
}

/* 分隔装饰样式 */
.separator-decoration {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.separator-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 25%,
    rgba(57, 157, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.3) 75%,
    transparent 100%);
  transform: translateY(-50%);
}

.separator-dots {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(57, 157, 255, 0.8);
  animation: pulse 2s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.3s;
}

.dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@media (max-width: 768px) {
  .sub-menu-bar-container {
    padding: 0 0.5rem 1.5rem 0.5rem;
  }

  .sub-menu-scroll {
    padding: 0;
    gap: 0;
  }

  .sub-menu-btn {
    font-size: 13px;
    padding: 7px 16px;
    margin: 0 3px;
  }

  .scroll-btn {
    width: 32px;
    height: 32px;
  }

  .scroll-left {
    left: -16px;
  }

  .scroll-right {
    right: -16px;
  }

  .separator-decoration {
    height: 30px;
    margin-top: 0.8rem;
  }

  .separator-dots {
    padding: 6px 12px;
  }

  .dot {
    width: 5px;
    height: 5px;
  }
}

@media (max-width: 480px) {
  .sub-menu-bar-container {
    padding: 0 0.3rem 1rem 0.3rem;
  }

  .sub-menu-scroll {
    padding: 0;
    gap: 0;
  }

  .sub-menu-btn {
    font-size: 12px;
    padding: 6px 14px;
    margin: 0 2px;
  }

  .scroll-btn {
    width: 28px;
    height: 28px;
  }

  .scroll-left {
    left: -14px;
  }

  .scroll-right {
    right: -14px;
  }

  .separator-decoration {
    height: 25px;
    margin-top: 0.6rem;
  }

  .separator-dots {
    padding: 4px 10px;
    gap: 6px;
  }

  .dot {
    width: 4px;
    height: 4px;
  }
}
</style>