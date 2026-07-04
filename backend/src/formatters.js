function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export function formatStatus(snapshot) {
  const parts = snapshot.usage.perRoom.map((room) => {
    const summary = room.controllableOnCount === 0
      ? 'all controllable devices are OFF'
      : `${plural(room.fansOn, 'fan')} ON, ${plural(room.lightsOn, 'light')} ON`;
    return `${room.roomName}: ${summary}`;
  });
  return `Here is the office status right now: ${parts.join('. ')}. Total live load is ${snapshot.usage.totalWatts}W.`;
}

export function formatRoom(snapshot, roomIdOrName) {
  const room = snapshot.rooms.find((item) => item.id === roomIdOrName || item.roomName?.toLowerCase?.() === String(roomIdOrName).toLowerCase());
  if (!room) {
    return `I could not find that room. Try drawing, work1, or work2.`;
  }
  const devices = snapshot.devices.filter((device) => device.roomId === room.id && device.isControllable);
  const onDevices = devices.filter((device) => device.status === 'on');
  const deviceLine = devices.map((device) => `${device.label}: ${device.status.toUpperCase()} (${device.ratedWatts}W)`).join(', ');
  const opener = onDevices.length === 0
    ? `${room.name} is quiet — every controllable device is OFF.`
    : `${room.name} has ${plural(onDevices.filter((d) => d.type === 'fan').length, 'fan')} and ${plural(onDevices.filter((d) => d.type === 'light').length, 'light')} ON.`;
  return `${opener}\nLive load: ${room.usage.currentWatts}W.\n${deviceLine}`;
}

export function formatUsage(snapshot) {
  const roomText = snapshot.usage.perRoom.map((room) => `${room.roomName}: ${room.currentWatts}W`).join(', ');
  return `Total power right now is ${snapshot.usage.totalWatts}W. Today's simulated usage is ${snapshot.usage.todayKwh} kWh, around ৳${snapshot.usage.estimatedCostBdt}. Room breakdown: ${roomText}.`;
}

export function formatAlerts(snapshot) {
  const active = snapshot.alerts || [];
  if (active.length === 0) {
    return `No active alerts. Everything looks good right now.`;
  }
  return active
    .map((alert, index) => `${index + 1}. ${alert.severity.toUpperCase()}: ${alert.message}`)
    .join('\n');
}

export function formatSavings(snapshot) {
  const projected = snapshot.usage.projectedEightHourCostBdt;
  const kwh = snapshot.usage.projectedEightHourKwh;
  return `If the current load stays on for another 8 hours, it would use about ${kwh} kWh, costing roughly ৳${projected}. Turning off unused devices now is the quickest saving.`;
}
