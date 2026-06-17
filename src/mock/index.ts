import type { Counselor, TimeSlot, Appointment, ConsultationRecord } from '@/types'
import dayjs from 'dayjs'

const avatars = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20counselor%20portrait%20warm%20smile%20headshot&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20counselor%20portrait%20kind%20expression%20headshot&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20senior%20counselor%20portrait%20gentle%20headshot&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20senior%20counselor%20portrait%20confident%20headshot&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20young%20female%20counselor%20portrait%20friendly%20headshot&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20middle%20aged%20female%20counselor%20portrait%20compassionate%20headshot&image_size=square'
]

export const mockCounselors: Counselor[] = [
  {
    id: 'c1',
    name: '李心语',
    avatar: avatars[0],
    yearsOfExperience: 12,
    expertiseFields: ['婚姻修复', '出轨创伤', '沟通改善'],
    certifications: ['国家心理咨询师', '婚姻家庭咨询师'],
    rating: 4.9,
    reviewCount: 328,
    introduction: '深耕婚姻家庭领域十二年，擅长处理复杂婚姻关系修复与创伤疗愈。'
  },
  {
    id: 'c2',
    name: '张明远',
    avatar: avatars[1],
    yearsOfExperience: 8,
    expertiseFields: ['分手复合', '婚前辅导', '沟通改善'],
    certifications: ['国家心理咨询师'],
    rating: 4.8,
    reviewCount: 215,
    introduction: '专注于亲密关系重建，帮助众多来访者找回幸福。'
  },
  {
    id: 'c3',
    name: '王雅琴',
    avatar: avatars[2],
    yearsOfExperience: 18,
    expertiseFields: ['婚姻修复', '出轨创伤', '婚前辅导'],
    certifications: ['国家心理咨询师', '婚姻家庭咨询师'],
    rating: 5.0,
    reviewCount: 512,
    introduction: '资深婚姻家庭治疗师，以人本主义疗法见长，温暖而专业。'
  },
  {
    id: 'c4',
    name: '陈志强',
    avatar: avatars[3],
    yearsOfExperience: 10,
    expertiseFields: ['分手复合', '沟通改善', '出轨创伤'],
    certifications: ['婚姻家庭咨询师'],
    rating: 4.7,
    reviewCount: 186,
    introduction: '擅长认知行为疗法，帮助来访者快速走出情感困境。'
  },
  {
    id: 'c5',
    name: '刘思怡',
    avatar: avatars[4],
    yearsOfExperience: 5,
    expertiseFields: ['分手复合', '婚前辅导'],
    certifications: ['国家心理咨询师'],
    rating: 4.6,
    reviewCount: 98,
    introduction: '青年新锐咨询师，善于倾听，特别擅长处理年轻人的情感困扰。'
  },
  {
    id: 'c6',
    name: '赵慧敏',
    avatar: avatars[5],
    yearsOfExperience: 15,
    expertiseFields: ['婚姻修复', '沟通改善', '出轨创伤'],
    certifications: ['国家心理咨询师', '婚姻家庭咨询师'],
    rating: 4.9,
    reviewCount: 402,
    introduction: '沙盘治疗师，运用多种技术帮助来访者探索内心深处。'
  }
]

const timeSlots: string[] = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '19:00-20:00',
  '20:00-21:00'
]

export const generateTimeSlots = (counselorId: string, date: string): TimeSlot[] => {
  const seed = (counselorId.charCodeAt(1) + date.split('-').reduce((a, b) => a + parseInt(b), 0)) % 7
  return timeSlots.map((slot, index) => {
    const [start, end] = slot.split('-')
    const pseudo = (seed + index) % 5
    let status: 'available' | 'booked' | 'rest' = 'available'
    if (pseudo === 0 || pseudo === 3) status = 'booked'
    else if (pseudo === 4 && index >= 6) status = 'rest'
    return {
      id: `${counselorId}-${date}-${index}`,
      counselorId,
      date,
      startTime: start,
      endTime: end,
      status
    }
  })
}

const generateDates = (days: number): string[] => {
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    dates.push(dayjs().add(i, 'day').format('YYYY-MM-DD'))
  }
  return dates
}

const futureDates = generateDates(14)

export const mockTimeSlots: TimeSlot[] = mockCounselors.flatMap(c =>
  futureDates.flatMap(date => generateTimeSlots(c.id, date))
)

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    counselorId: 'c1',
    counselorName: '李心语',
    clientName: '张女士',
    clientPhone: '13800138001',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: dayjs().add(30, 'minute').format('HH:00'),
    endTime: dayjs().add(90, 'minute').format('HH:00'),
    consultationMethod: '视频咨询',
    problemDescription: '结婚五年，最近发现丈夫与异性同事关系暧昧，虽然没有实质证据，但对方的态度变得冷淡，沟通越来越少。我感到非常焦虑和不安，不知道该怎么处理。希望能获得专业的指导，帮助我理清思路，判断婚姻是否还有挽救的可能。',
    createdAt: dayjs().subtract(2, 'day').toISOString(),
    status: 'confirmed'
  },
  {
    id: 'apt2',
    counselorId: 'c1',
    counselorName: '李心语',
    clientName: '王先生',
    clientPhone: '13900139002',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: dayjs().add(3, 'hour').format('HH:00'),
    endTime: dayjs().add(4, 'hour').format('HH:00'),
    consultationMethod: '线下面询',
    problemDescription: '与妻子结婚三年，一直没有孩子。双方父母压力很大，最近因为这件事频繁争吵，感觉夫妻感情受到了很大影响。妻子甚至提出了离婚，我很痛苦，不知道该怎么办。',
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    status: 'confirmed'
  },
  {
    id: 'apt3',
    counselorId: 'c1',
    counselorName: '李心语',
    clientName: '李小姐',
    clientPhone: '13700137003',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    startTime: '14:00',
    endTime: '15:00',
    consultationMethod: '语音咨询',
    problemDescription: '交往两年的男友突然提出分手，理由是性格不合。我完全没有心理准备，非常痛苦，每天失眠，无法正常工作和生活。我想知道是否还有挽回的可能，以及如何走出失恋的阴影。',
    createdAt: dayjs().subtract(3, 'day').toISOString(),
    status: 'confirmed'
  },
  {
    id: 'apt4',
    counselorId: 'c1',
    counselorName: '李心语',
    clientName: '陈女士',
    clientPhone: '13600136004',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    startTime: '15:00',
    endTime: '16:00',
    consultationMethod: '视频咨询',
    problemDescription: '发现老公出轨三个月，选择了原谅但心里一直过不去这个坎，反复想起对方背叛的细节，情绪波动很大。不知道如何真正放下，重建信任。',
    createdAt: dayjs().subtract(5, 'day').toISOString(),
    status: 'completed'
  }
]

export const mockRecords: ConsultationRecord[] = [
  {
    id: 'rec1',
    appointmentId: 'apt4',
    counselorId: 'c1',
    clientStatus: '情绪较为稳定，但仍有反复，失眠症状有所改善。能够理性看待事件本身，但在看到类似信息时仍会触发强烈情绪。',
    coreIssue: '创伤后信任危机，情绪闪回明显，自我价值感受挫，对伴侣言行过度敏感。',
    interventionPlan: '1. 情绪稳定化训练，教授正念呼吸调节技术；\n2. 创伤叙事处理，引导来访者倾诉并重新赋予意义；\n3. 认知重构，挑战"我不够好"的核心信念；\n4. 夫妻信任重建的阶段性计划讨论。',
    nextPlan: '下周进行夫妻联合咨询，引导双方进行有效沟通，建立透明化互动规则。每日正念练习10分钟，记录情绪日记。',
    createdAt: dayjs().subtract(1, 'day').toISOString()
  }
]
