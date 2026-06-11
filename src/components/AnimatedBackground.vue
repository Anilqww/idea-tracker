<template>
  <div class="animated-bg">
    <div class="gradient-overlay"></div>
    <div class="pulse-circle circle-1"></div>
    <div class="pulse-circle circle-2"></div>
    <div class="pulse-circle circle-3"></div>
    <div class="moving-line line-1"></div>
    <div class="moving-line line-2"></div>
  </div>
</template>

<style scoped>
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff9a44, #fc6076, #ff9a44);
  background-size: 200% 200%;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.pulse-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  animation: pulse 3s ease-in-out infinite;
}

.circle-1 {
  width: 250px;
  height: 250px;
  top: -50px;
  left: -80px;
  animation-delay: 0s;
}

.circle-2 {
  width: 350px;
  height: 350px;
  bottom: -100px;
  right: -100px;
  animation-delay: 1s;
}

.circle-3 {
  width: 180px;
  height: 180px;
  top: 50%;
  left: 75%;
  animation-delay: 2s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

.moving-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: moveLine 8s linear infinite;
}

.line-1 {
  top: 20%;
  animation-delay: 0s;
}

.line-2 {
  top: 60%;
  animation-delay: 4s;
}

@keyframes moveLine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>