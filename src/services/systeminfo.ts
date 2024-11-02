import * as si from 'systeminformation';

// Enhanced CPU interface
interface CpuStats {
  load: string;
  cores: string[];
  speed: number | null;
  brand: string;
  physicalCores: number;
  logicalCores: number;
  speedMin: number;
  speedMax: number;
  cache: {
    l1d: number;
    l1i: number;
    l2: number;
    l3: number;
  };
  governor: string;
}

// New Battery interface
interface BatteryStats {
  hasBattery: boolean;
  isCharging: boolean;
  acConnected: boolean;
  percent: number;
  timeRemaining: number;
  type: string;
  model: string;
  manufacturer: string;
  designedCapacity: number;
  currentCapacity: number;
  voltage: number;
  cycleCount: number;
}

interface MemoryStats {
  total: string;
  used: string;
  free: string;
  swapUsed: string;
  swapTotal: string;
  active: string;
  available: string;
  buffers: string;
  cached: string;
  slab: string;
}

interface DiskStats {
  fs: string;
  size: string;
  used: string;
  use: string;
  mount: string;
  type: string;
}

interface OsStats {
  platform: string;
  distro: string;
  release: string;
  arch: string;
  hostname: string;
  serial: string;
  build: string;
  servicepack: string;
  uefi: boolean | null;
}

interface SystemStats {
  manufacturer: string;
  model: string;
  version: string;
  serial: string;
  uuid: string;
  sku: string;
  virtual: boolean;
}

interface BasicStats {
  cpu: CpuStats;
  memory: MemoryStats;
  disk: DiskStats[];
  os: OsStats;
  system: SystemStats;
  battery: BatteryStats;
}

interface NetworkInterface {
  iface: string;
  ip4: string;
  ip6: string;
  mac: string;
  type: string;
  speed: number | null;
  dhcp: boolean;
  mtu: number | null;  // Changed from number to number | null
  operstate: string;
}

interface NetworkStat {
  interface: string;
  rxBytes: string;
  txBytes: string;
  rxSec: string;
  txSec: string;
  rxErrors: number;
  txErrors: number;
  rxDropped: number;
  txDropped: number;
}

interface NetworkStats {
  interfaces: NetworkInterface[];
  stats: NetworkStat[];
}

interface Process {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  command: string;
  priority: number;
  path: string;
  started: string;
  state: string;
}

interface ProcessStats {
  all: number;
  running: number;
  blocked: number;
  sleeping: number;
  list: Process[];
}

interface Temperature {
  main: number;
  cores: number[];
  max: number;
  socket: number[];
  chipset: number;
}

export async function getBasicStats(): Promise<BasicStats> {
  const [cpu, cpuInfo, mem, disk, os, system, battery] = await Promise.all([
    si.currentLoad(),
    si.cpu(),
    si.mem(),
    si.fsSize(),
    si.osInfo(),
    si.system(),
    si.battery(),
  ]);

  return {
    cpu: {
      load: cpu.currentLoad.toFixed(2),
      cores: cpu.cpus.map(core => core.load.toFixed(2)),
      speed: cpu.avgLoad || null,
      brand: cpuInfo.brand,
      physicalCores: cpuInfo.physicalCores,
      logicalCores: cpuInfo.cores,
      speedMin: cpuInfo.speedMin,
      speedMax: cpuInfo.speedMax,
      cache: {
        l1d: cpuInfo.cache.l1d,
        l1i: cpuInfo.cache.l1i,
        l2: cpuInfo.cache.l2,
        l3: cpuInfo.cache.l3,
      },
      governor: cpuInfo.governor
    },
    memory: {
      total: (mem.total / 1024 / 1024 / 1024).toFixed(2),
      used: (mem.used / 1024 / 1024 / 1024).toFixed(2),
      free: (mem.free / 1024 / 1024 / 1024).toFixed(2),
      swapUsed: (mem.swapused / 1024 / 1024 / 1024).toFixed(2),
      swapTotal: (mem.swaptotal / 1024 / 1024 / 1024).toFixed(2),
      active: (mem.active / 1024 / 1024 / 1024).toFixed(2),
      available: (mem.available / 1024 / 1024 / 1024).toFixed(2),
      buffers: (mem.buffers / 1024 / 1024 / 1024).toFixed(2),
      cached: (mem.cached / 1024 / 1024 / 1024).toFixed(2),
      slab: (mem.slab / 1024 / 1024 / 1024).toFixed(2)
    },
    disk: disk.map(drive => ({
      fs: drive.fs,
      size: (drive.size / 1024 / 1024 / 1024).toFixed(2),
      used: (drive.used / 1024 / 1024 / 1024).toFixed(2),
      use: drive.use.toFixed(2),
      mount: drive.mount,
      type: drive.type
    })),
    os: {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      arch: os.arch,
      hostname: os.hostname,
      serial: os.serial,
      build: os.build,
      servicepack: os.servicepack,
      uefi: os.uefi ?? false  // Provide a default value if null
  },
    system: {
      manufacturer: system.manufacturer,
      model: system.model,
      version: system.version,
      serial: system.serial,
      uuid: system.uuid,
      sku: system.sku,
      virtual: system.virtual
    },
    battery: {
      hasBattery: battery.hasBattery,
      isCharging: battery.isCharging,
      acConnected: battery.acConnected,
      percent: battery.percent,
      timeRemaining: battery.timeRemaining,
      type: battery.type,
      model: battery.model,
      manufacturer: battery.manufacturer,
      designedCapacity: battery.designedCapacity,
      currentCapacity: battery.currentCapacity,
      voltage: battery.voltage,
      cycleCount: battery.cycleCount
    }
  };
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const [networkStats, networkInterfacesData] = await Promise.all([
      si.networkStats(),
      si.networkInterfaces()
  ]);

  const networkInterfaces = Array.isArray(networkInterfacesData) 
      ? networkInterfacesData 
      : [networkInterfacesData];

  const statsArray = Array.isArray(networkStats) 
      ? networkStats 
      : [networkStats];

  return {
      interfaces: networkInterfaces.map(iface => ({
          iface: iface.iface,
          ip4: iface.ip4,
          ip6: iface.ip6,
          mac: iface.mac,
          type: iface.type,
          speed: iface.speed || null,
          dhcp: iface.dhcp,
          mtu: iface.mtu ?? 0,  // Provide a default value if null
          operstate: iface.operstate
      })),
    stats: statsArray.map(stat => ({
      interface: stat.iface,
      rxBytes: (stat.rx_bytes / 1024 / 1024).toFixed(2),
      txBytes: (stat.tx_bytes / 1024 / 1024).toFixed(2),
      rxSec: (stat.rx_sec / 1024).toFixed(2),
      txSec: (stat.tx_sec / 1024).toFixed(2),
      rxErrors: stat.rx_errors,
      txErrors: stat.tx_errors,
      rxDropped: stat.rx_dropped,
      txDropped: stat.tx_dropped
    }))
  };
}

export async function getProcessStats(): Promise<ProcessStats> {
  const processes = await si.processes();

  return {
    all: processes.all,
    running: processes.running,
    blocked: processes.blocked,
    sleeping: processes.sleeping,
    list: processes.list.slice(0, 10).map(proc => ({
      pid: proc.pid,
      name: proc.name,
      cpu: proc.cpu,
      mem: proc.mem,
      command: proc.command,
      priority: proc.priority,
      path: proc.path,
      started: new Date(proc.started).toISOString(),
      state: proc.state
    }))
  };
}

export async function getTemperatures(): Promise<Temperature> {
  const temps = await si.cpuTemperature();

  return {
    main: temps.main,
    cores: temps.cores,
    max: temps.max,
    socket: temps.socket || [],
    chipset: temps.chipset || 0
  };
}