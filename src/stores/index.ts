import { defineStore } from 'pinia'
import type { Counselor, TimeSlot, Appointment, ConsultationRecord, ExpertiseField } from '@/types'
import { mockCounselors, mockTimeSlots, mockAppointments, mockRecords } from '@/mock'
import dayjs from 'dayjs'

export const useCounselorStore = defineStore('counselor', {
  state: () => ({
    counselors: [...mockCounselors] as Counselor[],
    selectedFields: [] as ExpertiseField[],
    keyword: ''
  }),
  getters: {
    filteredCounselors(state): Counselor[] {
      let result = state.counselors
      if (state.selectedFields.length > 0) {
        result = result.filter(c =>
          state.selectedFields.some(field => c.expertiseFields.includes(field))
        )
      }
      if (state.keyword.trim()) {
        const kw = state.keyword.trim().toLowerCase()
        result = result.filter(c =>
          c.name.toLowerCase().includes(kw) ||
          c.expertiseFields.some(f => f.includes(kw))
        )
      }
      return result
    },
    allFields(): ExpertiseField[] {
      return ['分手复合', '婚姻修复', '出轨创伤', '沟通改善', '婚前辅导']
    }
  },
  actions: {
    toggleField(field: ExpertiseField) {
      const idx = this.selectedFields.indexOf(field)
      if (idx >= 0) {
        this.selectedFields.splice(idx, 1)
      } else {
        this.selectedFields.push(field)
      }
    },
    clearFilters() {
      this.selectedFields = []
      this.keyword = ''
    },
    setKeyword(kw: string) {
      this.keyword = kw
    },
    getCounselorById(id: string): Counselor | undefined {
      return this.counselors.find(c => c.id === id)
    }
  }
})

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    timeSlots: [...mockTimeSlots] as TimeSlot[],
    appointments: [...mockAppointments] as Appointment[],
    records: [...mockRecords] as ConsultationRecord[],
    remindedIds: [] as string[],
    currentCounselorId: 'c1'
  }),
  getters: {
    getTimeSlotsByCounselorAndDate: (state) => {
      return (counselorId: string, date: string): TimeSlot[] => {
        const existing = state.timeSlots.filter(
          s => s.counselorId === counselorId && s.date === date
        )
        if (existing.length > 0) return existing
        return []
      }
    },
    appointmentsForCounselor(state): Appointment[] {
      return state.appointments.filter(a => a.counselorId === state.currentCounselorId)
    },
    getAppointmentById: (state) => {
      return (id: string): Appointment | undefined => {
        return state.appointments.find(a => a.id === id)
      }
    },
    getRecordByAppointmentId: (state) => {
      return (appointmentId: string): ConsultationRecord | undefined => {
        return state.records.find(r => r.appointmentId === appointmentId)
      }
    },
    allRecordsForCounselor(state): ConsultationRecord[] {
      return state.records.filter(r => r.counselorId === state.currentCounselorId)
    }
  },
  actions: {
    bookSlot(slotId: string, appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'recordId'>): Appointment {
      const slot = this.timeSlots.find(s => s.id === slotId)
      if (slot) {
        slot.status = 'booked'
      }
      const newApt: Appointment = {
        ...appointmentData,
        id: 'apt' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      }
      this.appointments.push(newApt)
      return newApt
    },
    createRecord(record: Omit<ConsultationRecord, 'id' | 'createdAt'>): ConsultationRecord {
      const existing = this.records.findIndex(r => r.appointmentId === record.appointmentId)
      const newRecord: ConsultationRecord = {
        ...record,
        id: 'rec' + Date.now(),
        createdAt: new Date().toISOString()
      }
      if (existing >= 0) {
        this.records[existing] = { ...newRecord, id: this.records[existing].id, createdAt: this.records[existing].createdAt }
      } else {
        this.records.push(newRecord)
      }
      const apt = this.appointments.find(a => a.id === record.appointmentId)
      if (apt) {
        apt.status = 'completed'
        apt.recordId = newRecord.id
      }
      return newRecord
    },
    getUpcomingAppointments(): Appointment[] {
      const now = dayjs()
      return this.appointmentsForCounselor.filter(apt => {
        if (apt.status !== 'confirmed') return false
        const aptTime = dayjs(`${apt.date} ${apt.startTime}`)
        const diffMinutes = aptTime.diff(now, 'minute')
        return diffMinutes > 0 && diffMinutes <= 15
      })
    },
    addRemindedId(id: string) {
      if (!this.remindedIds.includes(id)) {
        this.remindedIds.push(id)
      }
    },
    initRemindedIds() {
      // 初始化时，将过去15分钟内已经过了提醒时间的预约标记为已提醒
      const now = dayjs()
      this.appointmentsForCounselor.forEach(apt => {
        const aptTime = dayjs(`${apt.date} ${apt.startTime}`)
        const diffMinutes = aptTime.diff(now, 'minute')
        if (diffMinutes < 0 || apt.status !== 'confirmed') {
          if (!this.remindedIds.includes(apt.id)) {
            this.remindedIds.push(apt.id)
          }
        }
      })
    }
  }
})
