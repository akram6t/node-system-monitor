import * as si from 'systeminformation';

// CPU specific interfaces
interface CpuStats {
  load: string;
  cores: string[];
  speed: number | null;
}

interface MemoryStats {
  total: string;
  used: string;
  free: string;
  swapUsed: string;
  swapTotal: string;
}

interface DiskStats {
  fs: string;
  size: string;
  used: string;
  use: string;
}

interface OsStats {
  platform: string;
  distro: string;
  release: string;
  arch: string;
}

interface SystemStats {
  manufacturer: string;
  model: string;
  version: string;
}

interface BasicStats {
  cpu: CpuStats;
  memory: MemoryStats;
  disk: DiskStats[];
  os: OsStats;
  system: SystemStats;
}

// Updated NetworkInterface to handle nullable speed
interface NetworkInterface {
  iface: string;
  ip4: string;
  ip6: string;
  mac: string;
  type: string;
  speed: number | null;  // Updated to allow null values
  dhcp: boolean;
}

interface NetworkStat {
  interface: string;
  rxBytes: string;
  txBytes: string;
  rxSec: string;
  txSec: string;
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
}

export async function getBasicStats(): Promise<BasicStats> {
  const [cpu, mem, disk, os, system] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.osInfo(),
    si.system(),
  ]);

  return {
    cpu: {
      load: cpu.currentLoad.toFixed(2),
      cores: cpu.cpus.map(core => core.load.toFixed(2)),
      speed: cpu.avgLoad || null
    },
    memory: {
      total: (mem.total / 1024 / 1024 / 1024).toFixed(2),
      used: (mem.used / 1024 / 1024 / 1024).toFixed(2),
      free: (mem.free / 1024 / 1024 / 1024).toFixed(2),
      swapUsed: (mem.swapused / 1024 / 1024 / 1024).toFixed(2),
      swapTotal: (mem.swaptotal / 1024 / 1024 / 1024).toFixed(2)
    },
    disk: disk.map(drive => ({
      fs: drive.fs,
      size: (drive.size / 1024 / 1024 / 1024).toFixed(2),
      used: (drive.used / 1024 / 1024 / 1024).toFixed(2),
      use: drive.use.toFixed(2)
    })),
    os: {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      arch: os.arch
    },
    system: {
      manufacturer: system.manufacturer,
      model: system.model,
      version: system.version
    },
  };
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const [networkStats, networkInterfacesData] = await Promise.all([
    si.networkStats(),
    si.networkInterfaces()
  ]);

  // Ensure networkInterfacesData is an array
  const networkInterfaces = Array.isArray(networkInterfacesData) 
    ? networkInterfacesData 
    : [networkInterfacesData];

  // Ensure networkStats is an array
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
      speed: iface.speed || null,  // Handle potentially null speed values
      dhcp: iface.dhcp
    })),
    stats: statsArray.map(stat => ({
      interface: stat.iface,
      rxBytes: (stat.rx_bytes / 1024 / 1024).toFixed(2),
      txBytes: (stat.tx_bytes / 1024 / 1024).toFixed(2),
      rxSec: (stat.rx_sec / 1024).toFixed(2),
      txSec: (stat.tx_sec / 1024).toFixed(2)
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
      command: proc.command
    }))
  };
}

export async function getTemperatures(): Promise<Temperature> {
  const temps = await si.cpuTemperature();

  return {
    main: temps.main,
    cores: temps.cores,
    max: temps.max
  };
}