import { EventEmitter } from 'node:events';
import { buildInitialDevices, OFFICE_HOURS, ROOM_CONFIG, ROOM_ALIASES } from './config.js';

const DEFAULT_RATE = Number(process.env.ELECTRICITY_RATE_BDT_PER_KWH || 8.95);

function iso(date) {
  return date.toISOString();
}

function secondsBetween(a, b) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 1000));
}

function isAfterHours(date) {
  const hour = date.getHours();
  return hour < OFFICE_HOURS.startHour || hour >= OFFICE_HOURS.endHour;
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

class OfficeStore extends EventEmitter {
  constructor() {
    super();
    this.rooms = ROOM_CONFIG;
    this.devices = buildInitialDevices();
    this.alerts = [];
    this.acknowledgedAlertKeys = new Set();
    this.simulatedNow = new Date();
    this.energyKwhToday = 0;
    this.lastEnergyTick = new Date(this.simulatedNow);
    this.ratePerKwh = DEFAULT_RATE;
    this.demoMode = 'normal';
    this.rebuildDerivedState();
  }

  getSnapshot() {
    this.rebuildDerivedState();
    return {
      simulatedNow: iso(this.simulatedNow),
      officeHours: OFFICE_HOURS,
      demoMode: this.demoMode,
      rooms: this.getRooms(),
      devices: this.devices,
      usage: this.getUsage(),
      alerts: this.getActiveAlerts(),
      assumptions: {
        visibleLightFanDevices: 15,
        totalDatasetRecords: this.devices.length,
        extraRecords: 'One low-power room energy meter is modeled per room to reconcile the prompt device-count mismatch.'
      }
    };
  }

  getRooms() {
    const byRoom = this.getUsage().perRoom.reduce((acc, roomUsage) => {
      acc[roomUsage.roomId] = roomUsage;
      return acc;
    }, {});

    return this.rooms.map((room) => ({
      ...room,
      usage: byRoom[room.id] || { currentWatts: 0, deviceCount: 0, onCount: 0 }
    }));
  }

  getRoom(roomIdOrAlias) {
    const normalized = String(roomIdOrAlias || '').trim().toLowerCase();
    const roomId = ROOM_ALIASES[normalized] || normalized;
    return this.rooms.find((room) => room.id === roomId);
  }

  getDevicesByRoom(roomId) {
    return this.devices.filter((device) => device.roomId === roomId);
  }

  setDeviceStatus(deviceId, status, changedAt = this.simulatedNow) {
    const device = this.devices.find((d) => d.id === deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    if (!device.isControllable) {
      throw new Error(`${device.label} is a sensor/meter and cannot be toggled.`);
    }
    const nextStatus = status === 'on' ? 'on' : 'off';
    if (device.status !== nextStatus) {
      device.status = nextStatus;
      device.lastChanged = iso(changedAt);
      device.continuousOnSeconds = nextStatus === 'on' ? 0 : 0;
      this.rebuildDerivedState();
      this.emitStateUpdate('device-status');
    }
    return device;
  }

  toggleDevice(deviceId) {
    const device = this.devices.find((d) => d.id === deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    return this.setDeviceStatus(deviceId, device.status === 'on' ? 'off' : 'on');
  }

  setRoomDevices(roomId, status, options = {}) {
    const changedAt = options.changedAt || this.simulatedNow;
    this.devices
      .filter((device) => device.roomId === roomId && device.isControllable)
      .forEach((device) => {
        device.status = status;
        device.lastChanged = iso(changedAt);
        device.continuousOnSeconds = status === 'on' ? secondsBetween(changedAt, this.simulatedNow) : 0;
      });
    this.rebuildDerivedState();
    this.emitStateUpdate('room-status');
  }

  advanceTime(minutes) {
    const previous = new Date(this.simulatedNow);
    this.simulatedNow = new Date(this.simulatedNow.getTime() + minutes * 60 * 1000);
    const elapsedHours = Math.max(0, (this.simulatedNow.getTime() - previous.getTime()) / 3_600_000);
    const currentWatts = this.getCurrentWatts();
    this.energyKwhToday += (currentWatts * elapsedHours) / 1000;
    if (this.simulatedNow.getDate() !== previous.getDate()) {
      this.energyKwhToday = 0;
    }
    this.rebuildDerivedState();
  }

  getCurrentWatts(devices = this.devices) {
    return devices.reduce((sum, device) => sum + (device.status === 'on' ? device.ratedWatts : 0), 0);
  }

  getUsage() {
    const totalWatts = this.getCurrentWatts();
    const perRoom = this.rooms.map((room) => {
      const devices = this.getDevicesByRoom(room.id);
      const controllable = devices.filter((device) => device.isControllable);
      const currentWatts = this.getCurrentWatts(devices);
      return {
        roomId: room.id,
        roomName: room.name,
        currentWatts,
        todayKwhEstimate: round((currentWatts / 1000) * 8, 3),
        deviceCount: devices.length,
        visibleDeviceCount: controllable.length,
        onCount: devices.filter((device) => device.status === 'on').length,
        controllableOnCount: controllable.filter((device) => device.status === 'on').length,
        fansOn: devices.filter((device) => device.type === 'fan' && device.status === 'on').length,
        lightsOn: devices.filter((device) => device.type === 'light' && device.status === 'on').length
      };
    });

    return {
      totalWatts,
      todayKwh: round(this.energyKwhToday, 3),
      estimatedCostBdt: round(this.energyKwhToday * this.ratePerKwh, 2),
      projectedEightHourKwh: round((totalWatts / 1000) * 8, 3),
      projectedEightHourCostBdt: round(((totalWatts / 1000) * 8) * this.ratePerKwh, 2),
      ratePerKwh: this.ratePerKwh,
      perRoom
    };
  }

  getActiveAlerts() {
    return this.alerts.filter((alert) => !alert.resolvedAt).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  rebuildDerivedState() {
    const now = this.simulatedNow;
    for (const device of this.devices) {
      if (device.status === 'on') {
        device.continuousOnSeconds = secondsBetween(new Date(device.lastChanged), now);
      } else {
        device.continuousOnSeconds = 0;
      }
    }
    this.recomputeAlerts();
  }

  recomputeAlerts() {
    const now = this.simulatedNow;
    const activeKeys = new Set();

    for (const room of this.rooms) {
      const controllable = this.getDevicesByRoom(room.id).filter((device) => device.isControllable);
      const onDevices = controllable.filter((device) => device.status === 'on');

      if (onDevices.length > 0 && isAfterHours(now)) {
        const key = `after-hours:${room.id}`;
        activeKeys.add(key);
        this.upsertAlert({
          key,
          severity: 'warning',
          roomId: room.id,
          roomName: room.name,
          title: `${room.name} has devices ON after office hours`,
          message: `${room.name} still has ${onDevices.filter((d) => d.type === 'fan').length} fan(s) and ${onDevices.filter((d) => d.type === 'light').length} light(s) ON at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          createdAt: iso(now)
        });
      }

      const allOnLong = controllable.length > 0 && controllable.every((device) => device.status === 'on' && device.continuousOnSeconds >= 2 * 60 * 60);
      if (allOnLong) {
        const key = `all-on-long:${room.id}`;
        activeKeys.add(key);
        this.upsertAlert({
          key,
          severity: 'critical',
          roomId: room.id,
          roomName: room.name,
          title: `${room.name} has been fully ON for over 2 hours`,
          message: `All ${controllable.length} controllable devices in ${room.name} have been running continuously for more than 2 hours.`,
          createdAt: iso(now)
        });
      }
    }

    for (const alert of this.alerts) {
      if (!activeKeys.has(alert.key) && !alert.resolvedAt) {
        alert.resolvedAt = iso(now);
      }
    }
  }

  upsertAlert(alertData) {
    const existing = this.alerts.find((alert) => alert.key === alertData.key && !alert.resolvedAt);
    if (existing) {
      existing.message = alertData.message;
      existing.updatedAt = iso(this.simulatedNow);
      return existing;
    }

    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      ...alertData,
      createdAt: alertData.createdAt || iso(this.simulatedNow),
      updatedAt: iso(this.simulatedNow),
      resolvedAt: null
    };
    this.alerts.push(alert);
    this.emit('alert:new', alert);
    return alert;
  }

  emitStateUpdate(reason = 'update') {
    this.emit('state:update', { reason, snapshot: this.getSnapshot() });
  }

  reset() {
    this.devices = buildInitialDevices();
    this.alerts = [];
    this.energyKwhToday = 0;
    this.simulatedNow = new Date();
    this.demoMode = 'normal';
    this.rebuildDerivedState();
    this.emitStateUpdate('reset');
  }

  applyScenario(name) {
    const scenario = String(name || '').toLowerCase();

    if (scenario === 'after-hours') {
      this.demoMode = 'after-hours-alert';
      const now = new Date(this.simulatedNow);
      now.setHours(22, 0, 0, 0);
      this.simulatedNow = now;
      const changedAt = new Date(now.getTime() - 2.25 * 60 * 60 * 1000);
      this.setRoomDevices('work2', 'on', { changedAt });
      this.setRoomDevices('drawing', 'off');
      this.setRoomDevices('work1', 'off');
      this.rebuildDerivedState();
      this.emitStateUpdate('scenario-after-hours');
      return this.getSnapshot();
    }

    if (scenario === 'quiet-night') {
      this.demoMode = 'quiet-night';
      const now = new Date(this.simulatedNow);
      now.setHours(21, 0, 0, 0);
      this.simulatedNow = now;
      for (const device of this.devices) {
        if (device.isControllable) {
          device.status = 'off';
          device.lastChanged = iso(now);
          device.continuousOnSeconds = 0;
        }
      }
      this.rebuildDerivedState();
      this.emitStateUpdate('scenario-quiet-night');
      return this.getSnapshot();
    }

    if (scenario === 'busy-day') {
      this.demoMode = 'busy-day';
      const now = new Date(this.simulatedNow);
      now.setHours(11, 30, 0, 0);
      this.simulatedNow = now;
      this.setRoomDevices('work1', 'on');
      this.setRoomDevices('work2', 'on');
      this.devices
        .filter((device) => device.roomId === 'drawing' && device.isControllable)
        .forEach((device, index) => {
          device.status = index < 2 ? 'on' : 'off';
          device.lastChanged = iso(now);
        });
      this.rebuildDerivedState();
      this.emitStateUpdate('scenario-busy-day');
      return this.getSnapshot();
    }

    if (scenario === 'reset') {
      this.reset();
      return this.getSnapshot();
    }

    throw new Error(`Unknown scenario: ${name}`);
  }
}

export const officeStore = new OfficeStore();
export { isAfterHours };
