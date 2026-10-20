export type PpdbApplicationStatus =
  | 'baru'
  | 'ditinjau'
  | 'perlu_konfirmasi'
  | 'menunggu_pembayaran'
  | 'pembayaran_dikonfirmasi'
  | 'diterima'
  | 'tidak_diterima'

export interface PpdbSettings {
  isOpen: boolean
  academicYear: string
  publicMessage: string
}

export interface PpdbPeriod {
  academicYear: string
  status: 'open' | 'closed'
  startedAt: string | null
  endedAt: string | null
  applicationCount: number
  activeApplicationCount: number
  archivedApplicationCount: number
}

export interface PpdbApplication {
  applicationNumber: string
  academicYear: string
  studentName: string
  birthDate: string
  gender: 'Laki-laki' | 'Perempuan'
  address: string
  studentPhone: string
  studentEmail: string
  guardianName: string
  guardianPhone: string
  previousSchool: string
  graduationYear: number | null
  programId: string
  programTitle: string | null
  status: PpdbApplicationStatus
  publicMessage: string
  internalNote: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

export interface PpdbApplicationResult {
  applicationNumber: string
  trackingCode: string
  createdAt: string
}

export interface PpdbStatusResult {
  applicationNumber: string
  academicYear: string
  status: PpdbApplicationStatus
  publicMessage: string
  createdAt: string
  updatedAt: string
  programTitle: string | null
}

export const ppdbStatusLabels: Record<PpdbApplicationStatus, string> = {
  baru: 'Pendaftaran diterima',
  ditinjau: 'Sedang ditinjau',
  perlu_konfirmasi: 'Perlu konfirmasi',
  menunggu_pembayaran: 'Menunggu pembayaran',
  pembayaran_dikonfirmasi: 'Pembayaran dikonfirmasi',
  diterima: 'Diterima',
  tidak_diterima: 'Tidak diterima',
}

export const ppdbStatusOptions: Array<{ value: PpdbApplicationStatus; label: string }> = [
  { value: 'baru', label: 'Baru mendaftar' },
  { value: 'ditinjau', label: 'Sedang ditinjau' },
  { value: 'perlu_konfirmasi', label: 'Perlu konfirmasi' },
  { value: 'menunggu_pembayaran', label: 'Menunggu pembayaran' },
  { value: 'pembayaran_dikonfirmasi', label: 'Pembayaran dikonfirmasi' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'tidak_diterima', label: 'Tidak diterima' },
]
