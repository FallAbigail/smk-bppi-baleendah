import { schoolLeaders, teachingStaff } from './schoolStaff'

// Photos are stored in the same order as the official SMK BPPI staff page.
// Homepage portraits use transparent PNGs; the staff directory uses the original JPGs.
export const teacherPhotoByName: Record<string, string> = Object.fromEntries(
  teachingStaff.map((teacher, index) => [
    teacher.name,
    `/images/bppi/teachers/teacher-${String(index + 1).padStart(2, '0')}.${index < 3 || teacher.name.startsWith('Kisan Ramadhan') ? 'png' : 'jpg'}`,
  ]),
)

export const teacherOriginalPhotoByName: Record<string, string> = Object.fromEntries(
  teachingStaff.map((teacher, index) => [
    teacher.name,
    `/images/bppi/teachers/teacher-${String(index + 1).padStart(2, '0')}.jpg`,
  ]),
)

export const leaderPhotoByPosition: Record<string, string> = Object.fromEntries(
  schoolLeaders.map((leader, index) => [
    leader.position,
    `/images/bppi/teachers/leader-${String(index + 1).padStart(2, '0')}.jpg`,
  ]),
)
