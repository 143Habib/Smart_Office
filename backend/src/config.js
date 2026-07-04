export const OFFICE_HOURS = {
  startHour: 9,
  endHour: 17
};

export const ROOM_CONFIG = [
  { id: 'drawing', name: 'Drawing Room', shortName: 'Drawing', role: 'Waiting area' },
  { id: 'work1', name: 'Work Room 1', shortName: 'Work 1', role: 'Employees work here' },
  { id: 'work2', name: 'Work Room 2', shortName: 'Work 2', role: 'Employees work here' }
];

const DEVICE_BLUEPRINT = [
  { type: 'fan', label: 'Fan 1', ratedWatts: 60 },
  { type: 'fan', label: 'Fan 2', ratedWatts: 60 },
  { type: 'light', label: 'Light 1', ratedWatts: 15 },
  { type: 'light', label: 'Light 2', ratedWatts: 15 },
  { type: 'light', label: 'Light 3', ratedWatts: 15 },
  // The problem statement has a 15 vs 18 device mismatch. The dashboard treats
  // the 15 visible devices as lights/fans and adds one low-power room meter per
  // room so the live dataset has 18 records without changing the visible room layout.
  { type: 'meter', label: 'Room Energy Meter', ratedWatts: 2, alwaysOn: true }
];

export function buildInitialDevices() {
  const now = new Date();
  return ROOM_CONFIG.flatMap((room) =>
    DEVICE_BLUEPRINT.map((device, index) => ({
      id: `${room.id}-${device.type}-${index + 1}`,
      roomId: room.id,
      roomName: room.name,
      type: device.type,
      label: device.label,
      ratedWatts: device.ratedWatts,
      status: device.alwaysOn ? 'on' : 'off',
      lastChanged: now.toISOString(),
      continuousOnSeconds: device.alwaysOn ? 60 * 60 : 0,
      isVisibleOnMap: device.type !== 'meter',
      isControllable: device.type !== 'meter',
      isSafetySensor: device.type === 'meter'
    }))
  );
}

export const ROOM_ALIASES = {
  drawing: 'drawing',
  'drawing room': 'drawing',
  wait: 'drawing',
  waiting: 'drawing',
  work1: 'work1',
  'work 1': 'work1',
  'work room 1': 'work1',
  room1: 'work1',
  work2: 'work2',
  'work 2': 'work2',
  'work room 2': 'work2',
  room2: 'work2'
};
