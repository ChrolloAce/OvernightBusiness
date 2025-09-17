// Twilio Phone Numbers Management Service
export interface TwilioPhoneNumber {
  sid: string
  phoneNumber: string
  friendlyName: string
  voiceUrl: string
  forwardToNumber: string
  status: 'active' | 'inactive'
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
}

export class TwilioPhoneService {
  private static instance: TwilioPhoneService
  private accountSid: string
  private authToken: string
  private baseUrl: string

  constructor() {
    this.accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`
  }

  static getInstance(): TwilioPhoneService {
    if (!TwilioPhoneService.instance) {
      TwilioPhoneService.instance = new TwilioPhoneService()
    }
    return TwilioPhoneService.instance
  }

  // Fetch all phone numbers from Twilio account
  async getPhoneNumbers(): Promise<TwilioPhoneNumber[]> {
    try {
      console.log('[TwilioPhoneService] Fetching phone numbers from Twilio...')
      
      const response = await fetch(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Twilio API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[TwilioPhoneService] Raw Twilio response:', data)

      const phoneNumbers: TwilioPhoneNumber[] = data.incoming_phone_numbers.map((num: any) => ({
        sid: num.sid,
        phoneNumber: num.phone_number,
        friendlyName: num.friendly_name || num.phone_number,
        voiceUrl: num.voice_url || '',
        forwardToNumber: this.extractForwardNumber(num.voice_url),
        status: num.status === 'in-use' ? 'active' : 'inactive',
        capabilities: {
          voice: num.capabilities?.voice || false,
          sms: num.capabilities?.sms || false,
          mms: num.capabilities?.mms || false
        }
      }))

      console.log(`[TwilioPhoneService] Found ${phoneNumbers.length} phone numbers`)
      return phoneNumbers
    } catch (error) {
      console.error('[TwilioPhoneService] Error fetching phone numbers:', error)
      throw error
    }
  }

  // Extract forward number from webhook URL or return default
  private extractForwardNumber(voiceUrl: string): string {
    // If using our webhook, return the current default
    if (voiceUrl.includes('overnight-business.vercel.app/api/twilio/webhook')) {
      return '+17862903664' // Current default from webhook
    }
    return '+17862903664' // Default fallback
  }

  // Update phone number configuration
  async updatePhoneNumber(sid: string, updates: {
    friendlyName?: string
    voiceUrl?: string
    forwardToNumber?: string
  }): Promise<boolean> {
    try {
      console.log(`[TwilioPhoneService] Updating phone number ${sid}:`, updates)
      
      const updateData: any = {}
      
      if (updates.friendlyName) {
        updateData.FriendlyName = updates.friendlyName
      }
      
      if (updates.voiceUrl) {
        updateData.VoiceUrl = updates.voiceUrl
      }

      // Note: forwardToNumber is handled by our webhook, not directly by Twilio
      // We'll store this in our database/localStorage for webhook reference
      
      const formData = new URLSearchParams(updateData)
      
      const response = await fetch(`${this.baseUrl}/IncomingPhoneNumbers/${sid}.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Twilio API error: ${response.status} ${response.statusText}`)
      }

      console.log(`[TwilioPhoneService] Successfully updated phone number ${sid}`)
      return true
    } catch (error) {
      console.error(`[TwilioPhoneService] Error updating phone number ${sid}:`, error)
      return false
    }
  }

  // Test webhook endpoint
  async testWebhook(): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      const response = await fetch('https://overnight-business.vercel.app/api/twilio/webhook')
      const data = await response.json()
      
      return {
        success: response.ok,
        response: data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
