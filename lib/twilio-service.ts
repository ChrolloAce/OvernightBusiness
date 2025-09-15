// Twilio Voice Service for Client Phone Number Management

export interface ClientPhoneNumber {
  id: string
  clientId: string
  twilioPhoneNumber: string
  clientPhoneNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CallRecord {
  id: string
  clientId: string
  twilioCallSid: string
  fromNumber: string
  toNumber: string
  forwardedToNumber: string
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed' | 'no-answer' | 'canceled'
  direction: 'inbound' | 'outbound'
  duration?: number // in seconds
  recordingUrl?: string
  recordingSid?: string
  startTime: string
  endTime?: string
  price?: string
  priceUnit?: string
}

export interface CallAnalytics {
  totalCalls: number
  totalDuration: number
  averageDuration: number
  successfulCalls: number
  missedCalls: number
  callsByDay: Array<{ date: string; calls: number; duration: number }>
  callsByHour: Array<{ hour: number; calls: number }>
  topCallers: Array<{ number: string; calls: number; duration: number }>
}

export class TwilioService {
  private static instance: TwilioService
  private readonly PHONE_NUMBERS_KEY = 'overnight_biz_client_phone_numbers'
  private readonly CALL_RECORDS_KEY = 'overnight_biz_call_records'

  private constructor() {}

  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService()
    }
    return TwilioService.instance
  }

  // Phone Number Management
  public getClientPhoneNumbers(): ClientPhoneNumber[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.PHONE_NUMBERS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[TwilioService] Failed to load phone numbers:', error)
      return []
    }
  }

  public getPhoneNumberByClient(clientId: string): ClientPhoneNumber | null {
    return this.getClientPhoneNumbers().find(pn => pn.clientId === clientId && pn.isActive) || null
  }

  public assignPhoneNumberToClient(clientId: string, clientPhoneNumber: string): ClientPhoneNumber {
    const phoneNumbers = this.getClientPhoneNumbers()
    
    // Deactivate any existing phone number for this client
    phoneNumbers.forEach(pn => {
      if (pn.clientId === clientId) {
        pn.isActive = false
        pn.updatedAt = new Date().toISOString()
      }
    })

    const newPhoneNumber: ClientPhoneNumber = {
      id: `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // Your Twilio number
      clientPhoneNumber,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    phoneNumbers.push(newPhoneNumber)
    this.savePhoneNumbers(phoneNumbers)

    console.log('[TwilioService] Phone number assigned:', newPhoneNumber)
    return newPhoneNumber
  }

  public removePhoneNumberFromClient(clientId: string): boolean {
    const phoneNumbers = this.getClientPhoneNumbers()
    const updated = phoneNumbers.map(pn => 
      pn.clientId === clientId ? { ...pn, isActive: false, updatedAt: new Date().toISOString() } : pn
    )
    
    this.savePhoneNumbers(updated)
    return true
  }

  // Call Recording Management
  public getCallRecords(): CallRecord[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.CALL_RECORDS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[TwilioService] Failed to load call records:', error)
      return []
    }
  }

  public getCallRecordsByClient(clientId: string): CallRecord[] {
    return this.getCallRecords().filter(call => call.clientId === clientId)
  }

  public addCallRecord(callData: Omit<CallRecord, 'id'>): CallRecord {
    const newCall: CallRecord = {
      ...callData,
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const calls = this.getCallRecords()
    calls.push(newCall)
    this.saveCallRecords(calls)

    console.log('[TwilioService] Call record added:', newCall.twilioCallSid)
    return newCall
  }

  public updateCallRecord(callSid: string, updates: Partial<CallRecord>): CallRecord | null {
    const calls = this.getCallRecords()
    const index = calls.findIndex(call => call.twilioCallSid === callSid)
    
    if (index >= 0) {
      calls[index] = { ...calls[index], ...updates }
      this.saveCallRecords(calls)
      return calls[index]
    }
    
    return null
  }

  // Call Analytics
  public getCallAnalytics(clientId?: string, dateRange?: { start: Date; end: Date }): CallAnalytics {
    let calls = this.getCallRecords()
    
    // Filter by client if specified
    if (clientId) {
      calls = calls.filter(call => call.clientId === clientId)
    }
    
    // Filter by date range if specified
    if (dateRange) {
      calls = calls.filter(call => {
        const callDate = new Date(call.startTime)
        return callDate >= dateRange.start && callDate <= dateRange.end
      })
    }

    const totalCalls = calls.length
    const completedCalls = calls.filter(call => call.status === 'completed')
    const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0)
    const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0
    const successfulCalls = completedCalls.length
    const missedCalls = calls.filter(call => ['no-answer', 'busy', 'failed'].includes(call.status)).length

    // Group calls by day
    const callsByDay = this.groupCallsByDay(calls)
    
    // Group calls by hour
    const callsByHour = this.groupCallsByHour(calls)
    
    // Get top callers
    const topCallers = this.getTopCallers(calls)

    return {
      totalCalls,
      totalDuration,
      averageDuration,
      successfulCalls,
      missedCalls,
      callsByDay,
      callsByHour,
      topCallers
    }
  }

  private groupCallsByDay(calls: CallRecord[]): Array<{ date: string; calls: number; duration: number }> {
    const grouped = new Map<string, { calls: number; duration: number }>()
    
    calls.forEach(call => {
      const date = new Date(call.startTime).toISOString().split('T')[0]
      const existing = grouped.get(date) || { calls: 0, duration: 0 }
      existing.calls += 1
      existing.duration += call.duration || 0
      grouped.set(date, existing)
    })

    return Array.from(grouped.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private groupCallsByHour(calls: CallRecord[]): Array<{ hour: number; calls: number }> {
    const grouped = new Map<number, number>()
    
    calls.forEach(call => {
      const hour = new Date(call.startTime).getHours()
      grouped.set(hour, (grouped.get(hour) || 0) + 1)
    })

    return Array.from(grouped.entries())
      .map(([hour, calls]) => ({ hour, calls }))
      .sort((a, b) => a.hour - b.hour)
  }

  private getTopCallers(calls: CallRecord[]): Array<{ number: string; calls: number; duration: number }> {
    const grouped = new Map<string, { calls: number; duration: number }>()
    
    calls.forEach(call => {
      const number = call.fromNumber
      const existing = grouped.get(number) || { calls: 0, duration: 0 }
      existing.calls += 1
      existing.duration += call.duration || 0
      grouped.set(number, existing)
    })

    return Array.from(grouped.entries())
      .map(([number, data]) => ({ number, ...data }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 10) // Top 10 callers
  }

  // Twilio API Integration Methods
  public async purchasePhoneNumber(areaCode?: string): Promise<{ success: boolean; phoneNumber?: string; error?: string }> {
    try {
      const response = await fetch('/api/twilio/purchase-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaCode })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('[TwilioService] Phone number purchased:', data.phoneNumber)
        return { success: true, phoneNumber: data.phoneNumber }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('[TwilioService] Failed to purchase phone number:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  public async makeCall(fromNumber: string, toNumber: string, clientId: string): Promise<{ success: boolean; callSid?: string; error?: string }> {
    try {
      const response = await fetch('/api/twilio/make-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromNumber, toNumber, clientId })
      })

      const data = await response.json()
      
      if (data.success) {
        // Add call record
        this.addCallRecord({
          clientId,
          twilioCallSid: data.callSid,
          fromNumber,
          toNumber,
          forwardedToNumber: toNumber,
          status: 'queued',
          direction: 'outbound',
          startTime: new Date().toISOString()
        })

        return { success: true, callSid: data.callSid }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('[TwilioService] Failed to make call:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  public async getCallRecording(callSid: string): Promise<{ success: boolean; recordingUrl?: string; error?: string }> {
    try {
      const response = await fetch(`/api/twilio/recording/${callSid}`)
      const data = await response.json()
      
      if (data.success) {
        return { success: true, recordingUrl: data.recordingUrl }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('[TwilioService] Failed to get recording:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Utility Methods
  public formatPhoneNumber(phoneNumber: string): string {
    // Format phone number for display (e.g., +1234567890 -> (123) 456-7890)
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1)
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  public formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  public getCallStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ringing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'no-answer': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'busy': return 'bg-red-100 text-red-800 border-red-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Storage Methods
  private savePhoneNumbers(phoneNumbers: ClientPhoneNumber[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.PHONE_NUMBERS_KEY, JSON.stringify(phoneNumbers))
    } catch (error) {
      console.error('[TwilioService] Failed to save phone numbers:', error)
    }
  }

  private saveCallRecords(calls: CallRecord[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.CALL_RECORDS_KEY, JSON.stringify(calls))
    } catch (error) {
      console.error('[TwilioService] Failed to save call records:', error)
    }
  }

  // Export/Import
  public exportCallData(): string {
    return JSON.stringify({
      phoneNumbers: this.getClientPhoneNumbers(),
      callRecords: this.getCallRecords(),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  public importCallData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.phoneNumbers && Array.isArray(data.phoneNumbers)) {
        this.savePhoneNumbers(data.phoneNumbers)
      }
      
      if (data.callRecords && Array.isArray(data.callRecords)) {
        this.saveCallRecords(data.callRecords)
      }
      
      return true
    } catch (error) {
      console.error('[TwilioService] Failed to import call data:', error)
      return false
    }
  }

  public clearAllData(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.PHONE_NUMBERS_KEY)
      localStorage.removeItem(this.CALL_RECORDS_KEY)
    } catch (error) {
      console.error('[TwilioService] Failed to clear data:', error)
    }
  }
}
