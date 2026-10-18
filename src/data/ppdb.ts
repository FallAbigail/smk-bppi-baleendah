export type PpdbApplicationStatus =
  | 'baru'
  | 'ditinjau'
  | 'perlu_konfirmasi'
  | 'diterima'
  | 'tidak_diterima'

export interface PpdbSettings {
  isOpen: boolean
  academicYear: string
  publicMessage: string
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
  programTitle: string | null
}

export const ppdbStatusLabels: Record<PpdbApplicationStatus, string> = {
  baru: 'Pendaftaran diterima',
  ditinjau: 'Sedang ditinjau',
  perlu_konfirmasi: 'Perlu konfirmasi',
  diterima: 'Diterima',
  tidak_diterima: 'Tidak diterima',
}

export const ppdbStatusOptions: Array<{ value: PpdbApplicationStatus; label: string }> = [
  { value: 'baru', label: 'Baru masuk' },
  { value: 'ditinjau', label: 'Sedang ditinjau' },
  { value: 'perlu_konfirmasi', label: 'Perlu konfirmasi' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'tidak_diterima', label: 'Tidak diterima' },
]
