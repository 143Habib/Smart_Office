function choose(probability) {
  return Math.random() < probability;
}

function getDeviceProbability(device, hour) {
  if (!device.isControllable) return 1;

  const isWorkRoom = device.roomId === 'work1' || device.roomId === 'work2';
  const isDrawing = device.roomId === 'drawing';

  if (hour >= 9 && hour < 12) {
    if (isWorkRoom) return device.type === 'fan' ? 0.82 : 0.9;
    if (isDrawing) return device.type === 'fan' ? 0.25 : 0.35;
  }

  if (hour >= 12 && hour < 14) {
    if (isWorkRoom) return device.type === 'fan' ? 0.55 : 0.45;
    if (isDrawing) return device.type === 'fan' ? 0.35 : 0.45;
  }

  if (hour >= 14 && hour < 17) {
    if (isWorkRoom) return device.type === 'fan' ? 0.78 : 0.84;
    if (isDrawing) return device.type === 'fan' ? 0.2 : 0.3;
  }

  if (hour >= 17 && hour < 21) {
    // Most devices should be off, but one forgotten fan/light can remain.
    return isWorkRoom ? 0.12 : 0.06;
  }

  return isWorkRoom ? 0.05 : 0.02;
}

export function startSimulator(store, options = {}) {
  const tickMs = Number(options.tickMs || process.env.SIMULATOR_TICK_MS || 5000);
  const minutesPerTick = Number(options.minutesPerTick || process.env.SIMULATED_MINUTES_PER_TICK || 5);

  const interval = setInterval(() => {
    if (store.demoMode && store.demoMode !== 'normal') {
      store.advanceTime(minutesPerTick);
      store.emitStateUpdate('demo-time-advance');
      return;
    }

    store.advanceTime(minutesPerTick);
    const hour = store.simulatedNow.getHours();

    for (const device of store.devices) {
      if (!device.isControllable) continue;
      const targetOnProbability = getDeviceProbability(device, hour);
      const shouldBeOn = choose(targetOnProbability);
      const currentOn = device.status === 'on';

      // Add inertia so the UI feels alive without flickering every tick.
      const switchChance = currentOn === shouldBeOn ? 0.03 : 0.28;
      if (choose(switchChance)) {
        device.status = shouldBeOn ? 'on' : 'off';
        device.lastChanged = store.simulatedNow.toISOString();
      }
    }

    store.rebuildDerivedState();
    store.emitStateUpdate('simulator-tick');
  }, tickMs);

  return () => clearInterval(interval);
}
