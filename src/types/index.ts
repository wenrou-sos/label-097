export type ExpertiseField = '分手复合' | '婚姻修复' | '出轨创伤' | '沟通改善' | '婚前辅导'

export type Certification = '国家心理咨询师' | '婚姻家庭咨询师'

export type ConsultationMethod = '线下面询' | '视频咨询' | '语音咨询'

export type TimeSlotStatus = 'available' | 'booked' | 'rest'

export interface Counselor {
  id: string
  name: string
  avatar: string
  yearsOfExperience: number
  expertiseFields: ExpertiseField[]
  certifications: Certification[]
  rating: number
  reviewCount: number
  introduction: string
}

export interface TimeSlot {
  id: string
  counselorId: string
  date: string
  startTime: string
  endTime: string
  status: TimeSlotStatus
}

export interface Appointment {
  id: string
  counselorId: string
  counselorName: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
  consultationMethod: ConsultationMethod
  problemDescription: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  recordId?: string
}

export interface ConsultationRecord {
  id: string
  appointmentId: string
  counselorId: string
  clientStatus: string
  coreIssue: string
  interventionPlan: string
  nextPlan: string
  createdAt: string
}

export interface Reminder {
  id: string
  appointmentId: string
  message: string
  triggered: boolean
  triggerTime: string
}

export interface VisitorProfile {
  phone: string
  name: string
  firstConsultTime: string
  totalConsultCount: number
  appointments: Appointment[]
  records: ConsultationRecord[]
}
