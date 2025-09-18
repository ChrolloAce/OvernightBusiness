// Enhanced Local SEO Content Generator for Google Business Profiles
// Generates content with service areas, specific services, and local SEO optimization

export interface BusinessContext {
  name: string
  category: string
  address: string
  website?: string
  phone?: string
  serviceArea?: {
    businessType?: string
    places?: Array<{placeName: string, placeId: string}>
    regionCode?: string
  }
  serviceTypes?: Array<{
    serviceTypeId: string
    displayName: string
  }>
  allCategories?: string[]
  businessHours?: string[]
  rating?: number
  reviewCount?: number
}

export interface ContentGenerationOptions {
  contentType: 'business_updates' | 'promotional' | 'educational' | 'behind_scenes' | 'customer_spotlight' | 'seasonal' | 'local_event'
  tone: 'professional' | 'friendly' | 'casual' | 'energetic' | 'trustworthy'
  includeServices: boolean
  includeLocations: boolean
  focusLocalSEO: boolean
  seasonalContext?: string
}

export class LocalSEOContentGenerator {
  private static instance: LocalSEOContentGenerator

  static getInstance(): LocalSEOContentGenerator {
    if (!LocalSEOContentGenerator.instance) {
      LocalSEOContentGenerator.instance = new LocalSEOContentGenerator()
    }
    return LocalSEOContentGenerator.instance
  }

  // Main content generation function
  async generateLocalSEOContent(
    business: BusinessContext, 
    options: ContentGenerationOptions
  ): Promise<{
    title: string
    description: string
    hashtags: string[]
    localKeywords: string[]
    serviceLocationPairs: Array<{service: string, location: string}>
  }> {
    console.log('[Local SEO Generator] Generating content for:', business.name)

    // Extract location information
    const locations = this.extractLocations(business)
    const services = this.extractServices(business)
    const localKeywords = this.generateLocalKeywords(business, locations)
    
    // Create service-location pairs for SEO
    const serviceLocationPairs = this.createServiceLocationPairs(services, locations)
    
    // Generate enhanced prompt
    const prompt = this.createEnhancedPrompt(business, options, serviceLocationPairs, localKeywords)
    
    try {
      // Call OpenAI with enhanced prompt
      const content = await this.callOpenAI(prompt, business, options)
      
      // Extract and enhance content
      const parsedContent = this.parseAndEnhanceContent(content, business, serviceLocationPairs, localKeywords)
      
      console.log('[Local SEO Generator] Content generated with local SEO optimization')
      
      return parsedContent
      
    } catch (error) {
      console.error('[Local SEO Generator] Error generating content:', error)
      
      // Return fallback content with local SEO
      return this.generateFallbackLocalContent(business, options, serviceLocationPairs, localKeywords)
    }
  }

  // Extract locations from business context
  private extractLocations(business: BusinessContext): string[] {
    const locations: string[] = []
    
    // Extract from address
    if (business.address) {
      const addressParts = business.address.split(',').map(part => part.trim())
      // Get city, state from address
      addressParts.forEach(part => {
        if (part && part.length > 2 && !part.match(/^\d/)) {
          locations.push(part)
        }
      })
    }
    
    // Extract from service area places
    if (business.serviceArea?.places) {
      business.serviceArea.places.forEach(place => {
        if (place.placeName && !locations.includes(place.placeName)) {
          locations.push(place.placeName)
        }
      })
    }
    
    // Add region code if available
    if (business.serviceArea?.regionCode && !locations.includes(business.serviceArea.regionCode)) {
      locations.push(business.serviceArea.regionCode)
    }
    
    // Default locations for Florida-based businesses (based on your data)
    const defaultFloridaLocations = [
      'Miami', 'Fort Lauderdale', 'Tampa', 'Orlando', 'Jacksonville',
      'Naples', 'Sarasota', 'West Palm Beach', 'Gainesville', 'Tallahassee',
      'Hialeah', 'Coral Gables', 'Aventura', 'Boca Raton', 'Delray Beach'
    ]
    
    // If no locations found, add some default Florida locations
    if (locations.length === 0) {
      locations.push(...defaultFloridaLocations.slice(0, 3))
    }
    
    return locations.slice(0, 5) // Limit to 5 locations
  }

  // Extract services from business context
  private extractServices(business: BusinessContext): string[] {
    const services: string[] = []
    
    // Extract from service types
    if (business.serviceTypes) {
      business.serviceTypes.forEach(service => {
        if (service.displayName) {
          services.push(service.displayName)
        }
      })
    }
    
    // Extract from categories
    if (business.allCategories) {
      business.allCategories.forEach(category => {
        if (category && !services.includes(category)) {
          services.push(category)
        }
      })
    }
    
    // Add primary category
    if (business.category && !services.includes(business.category)) {
      services.push(business.category)
    }
    
    return services.slice(0, 8) // Limit to 8 services
  }

  // Generate local SEO keywords
  private generateLocalKeywords(business: BusinessContext, locations: string[]): string[] {
    const keywords: string[] = []
    const businessType = business.category.toLowerCase()
    
    // Create location-based keywords
    locations.forEach(location => {
      keywords.push(`${businessType} in ${location}`)
      keywords.push(`${location} ${businessType}`)
      keywords.push(`best ${businessType} ${location}`)
      keywords.push(`${businessType} near ${location}`)
      keywords.push(`${businessType} services ${location}`)
    })
    
    // Add business-specific keywords
    if (business.name) {
      keywords.push(`${business.name} reviews`)
      keywords.push(`${business.name} services`)
    }
    
    return keywords.slice(0, 10) // Limit to 10 keywords
  }

  // Create service-location pairs for SEO
  private createServiceLocationPairs(services: string[], locations: string[]): Array<{service: string, location: string}> {
    const pairs: Array<{service: string, location: string}> = []
    
    // Create random combinations
    const maxPairs = Math.min(services.length, locations.length, 4)
    
    for (let i = 0; i < maxPairs; i++) {
      const randomService = services[Math.floor(Math.random() * services.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      
      // Avoid duplicates
      if (!pairs.some(pair => pair.service === randomService && pair.location === randomLocation)) {
        pairs.push({ service: randomService, location: randomLocation })
      }
    }
    
    return pairs
  }

  // Create enhanced prompt with local SEO context
  private createEnhancedPrompt(
    business: BusinessContext,
    options: ContentGenerationOptions,
    serviceLocationPairs: Array<{service: string, location: string}>,
    localKeywords: string[]
  ): string {
    const businessName = business.name
    const primaryLocation = business.address ? business.address.split(',')[1]?.trim() || business.address.split(',')[0]?.trim() : 'local area'
    
    const baseContext = `
Business: ${businessName}
Primary Category: ${business.category}
Location: ${business.address || 'Local service area'}
Service Area: ${business.serviceArea?.places?.map(p => p.placeName).join(', ') || primaryLocation}
Available Services: ${serviceLocationPairs.map(pair => pair.service).join(', ')}
Target Locations: ${serviceLocationPairs.map(pair => pair.location).join(', ')}
Business Rating: ${business.rating ? `${business.rating} stars (${business.reviewCount} reviews)` : 'New business'}
`

    const localSEOInstructions = `
LOCAL SEO REQUIREMENTS:
- Naturally include 2-3 of these location-service combinations: ${serviceLocationPairs.map(pair => `"${pair.service} in ${pair.location}"`).join(', ')}
- Use local keywords naturally: ${localKeywords.slice(0, 5).join(', ')}
- Include the primary location: ${primaryLocation}
- Mention specific services when relevant
- Use "near me" language when appropriate
- Include local community references
- Focus on local customer benefits
`

    const contentTypePrompts = {
      business_updates: `Create a business update that showcases recent work, improvements, or achievements. Highlight how you serve the local community and mention specific service areas.`,
      
      promotional: `Create a promotional post for a special offer or service. Include specific locations you serve and mention how local customers benefit. Create urgency while being helpful.`,
      
      educational: `Create an educational post that helps local customers understand your services. Include tips specific to the local area and mention service locations.`,
      
      behind_scenes: `Share behind-the-scenes content showing your team at work in specific locations. Highlight the local community connection and service quality.`,
      
      customer_spotlight: `Highlight a successful project or happy customer (keep anonymous). Mention the location served and specific services provided.`,
      
      seasonal: `Create seasonal content relevant to ${options.seasonalContext || 'current season'} and how your services help local customers during this time.`,
      
      local_event: `Create content about local community involvement, local events, or how your services support the local area.`
    }

    return `
${baseContext}

${localSEOInstructions}

CONTENT TYPE: ${options.contentType}
TONE: ${options.tone}

${contentTypePrompts[options.contentType]}

FORMATTING REQUIREMENTS:
- Start with an engaging, local SEO-friendly title (under 60 characters)
- Write 2-3 paragraphs of engaging content (150-250 words)
- Naturally incorporate service-location pairs
- Include a strong call-to-action mentioning location/service
- End with 3-5 relevant hashtags including local tags

EXAMPLE LOCAL SEO PHRASES TO INCLUDE:
- "serving [location] and surrounding areas"
- "trusted [service] in [location]"
- "[location] residents trust us for [service]"
- "your local [category] experts"
- "proudly serving [location] since [year]"

Make it sound natural, helpful, and locally focused!
`
  }

  // Call OpenAI with enhanced prompt
  private async callOpenAI(prompt: string, business: BusinessContext, options: ContentGenerationOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a local SEO expert and content creator specializing in Google Business Profile posts. You create engaging content that ranks well in local search and drives customer engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  // Parse and enhance the generated content
  private parseAndEnhanceContent(
    content: string,
    business: BusinessContext,
    serviceLocationPairs: Array<{service: string, location: string}>,
    localKeywords: string[]
  ): {
    title: string
    description: string
    hashtags: string[]
    localKeywords: string[]
    serviceLocationPairs: Array<{service: string, location: string}>
  } {
    const lines = content.trim().split('\n').filter(line => line.trim())
    
    // Extract title (first line)
    let title = lines[0]?.replace(/^#+\s*/, '').replace(/^["']|["']$/g, '').trim() || 'Business Update'
    
    // Extract description (everything except hashtags)
    const descriptionLines = lines.slice(1).filter(line => !line.startsWith('#'))
    let description = descriptionLines.join('\n').trim()
    
    // Extract hashtags
    const hashtagLines = lines.filter(line => line.includes('#'))
    const hashtagMatches = hashtagLines
      .join(' ')
      .match(/#\w+/g)
    let hashtags: string[] = hashtagMatches ? Array.from(hashtagMatches) : []
    
    // Enhance hashtags with local SEO
    const localHashtags = this.generateLocalHashtags(business, serviceLocationPairs)
    hashtags = Array.from(new Set([...hashtags, ...localHashtags])).slice(0, 8)
    
    // Ensure title is SEO optimized
    title = this.optimizeTitleForLocalSEO(title, business, serviceLocationPairs[0])
    
    // Ensure description includes local context
    description = this.enhanceDescriptionForLocalSEO(description, business, serviceLocationPairs)
    
    return {
      title: title.substring(0, 100), // Google Business Profile title limit
      description: description.substring(0, 1500), // Google Business Profile description limit
      hashtags,
      localKeywords,
      serviceLocationPairs
    }
  }

  // Generate local SEO hashtags
  private generateLocalHashtags(
    business: BusinessContext,
    serviceLocationPairs: Array<{service: string, location: string}>
  ): string[] {
    const hashtags: string[] = []
    
    // Business category hashtags
    const category = business.category.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
    hashtags.push(`#${category}`)
    
    // Location hashtags
    serviceLocationPairs.forEach(pair => {
      const location = pair.location.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
      const service = pair.service.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
      
      hashtags.push(`#${location}`)
      hashtags.push(`#${service}`)
      hashtags.push(`#${location}${service}`)
    })
    
    // Generic local hashtags
    hashtags.push('#local', '#community', '#trusted', '#professional', '#quality')
    
    // Florida-specific hashtags (based on your business data)
    if (business.address?.toLowerCase().includes('fl') || business.address?.toLowerCase().includes('florida')) {
      hashtags.push('#florida', '#southflorida', '#miami', '#broward')
    }
    
    return Array.from(new Set(hashtags)).slice(0, 10)
  }

  // Optimize title for local SEO
  private optimizeTitleForLocalSEO(
    title: string,
    business: BusinessContext,
    primaryPair?: {service: string, location: string}
  ): string {
    // If title doesn't include location or service, enhance it
    const hasLocation = primaryPair && title.toLowerCase().includes(primaryPair.location.toLowerCase())
    const hasService = primaryPair && title.toLowerCase().includes(primaryPair.service.toLowerCase())
    
    if (!hasLocation && !hasService && primaryPair) {
      // Add location and service context
      return `${title} - ${primaryPair.service} in ${primaryPair.location}`
    } else if (!hasLocation && primaryPair) {
      // Add location context
      return `${title} in ${primaryPair.location}`
    }
    
    return title
  }

  // Enhance description for local SEO
  private enhanceDescriptionForLocalSEO(
    description: string,
    business: BusinessContext,
    serviceLocationPairs: Array<{service: string, location: string}>
  ): string {
    let enhanced = description
    
    // Add local context if missing
    const hasLocalContext = serviceLocationPairs.some(pair => 
      description.toLowerCase().includes(pair.location.toLowerCase()) ||
      description.toLowerCase().includes(pair.service.toLowerCase())
    )
    
    if (!hasLocalContext && serviceLocationPairs.length > 0) {
      const pair = serviceLocationPairs[0]
      enhanced += `\n\nProudly serving ${pair.location} and surrounding areas with professional ${pair.service.toLowerCase()}.`
    }
    
    // Add call-to-action with local context
    if (!enhanced.toLowerCase().includes('call') && !enhanced.toLowerCase().includes('contact')) {
      const primaryLocation = serviceLocationPairs[0]?.location || 'your area'
      enhanced += `\n\nContact us today for reliable service in ${primaryLocation}!`
    }
    
    return enhanced
  }

  // Generate fallback content with local SEO
  private generateFallbackLocalContent(
    business: BusinessContext,
    options: ContentGenerationOptions,
    serviceLocationPairs: Array<{service: string, location: string}>,
    localKeywords: string[]
  ): {
    title: string
    description: string
    hashtags: string[]
    localKeywords: string[]
    serviceLocationPairs: Array<{service: string, location: string}>
  } {
    const primaryPair = serviceLocationPairs[0]
    const primaryLocation = primaryPair?.location || 'local area'
    const primaryService = primaryPair?.service || business.category
    
    const templates = {
      business_updates: {
        title: `${business.name} - Your Trusted ${primaryService} in ${primaryLocation}`,
        description: `We're proud to serve ${primaryLocation} and surrounding communities with professional ${primaryService.toLowerCase()}. Our experienced team delivers quality results that local residents trust.\n\nServing ${serviceLocationPairs.map(p => p.location).join(', ')} with:\n${serviceLocationPairs.map(p => `• ${p.service}`).join('\n')}\n\nContact us today for reliable service in your area!`
      },
      promotional: {
        title: `Special Offer: ${primaryService} in ${primaryLocation}`,
        description: `Limited time offer for ${primaryLocation} residents! Get professional ${primaryService.toLowerCase()} services at special rates.\n\nWhy choose us:\n• Local experts serving ${primaryLocation}\n• Professional ${primaryService.toLowerCase()}\n• Trusted by the community\n\nCall now to schedule your service in ${primaryLocation}!`
      },
      educational: {
        title: `${primaryService} Tips for ${primaryLocation} Residents`,
        description: `As your local ${primaryService.toLowerCase()} experts in ${primaryLocation}, we want to share valuable tips with our community.\n\nOur professional team has been serving ${primaryLocation} and surrounding areas with quality ${primaryService.toLowerCase()}. We understand the unique needs of local residents.\n\nContact us for expert ${primaryService.toLowerCase()} services in ${primaryLocation}!`
      },
      behind_scenes: {
        title: `Behind the Scenes at ${business.name} - ${primaryService} in ${primaryLocation}`,
        description: `Ever wondered what goes into professional ${primaryService.toLowerCase()}? Take a look behind the scenes with ${business.name}!\n\nOur team works hard to serve ${primaryLocation} and surrounding areas with quality ${primaryService.toLowerCase()}. From preparation to completion, we maintain the highest standards.\n\nProud to serve: ${serviceLocationPairs.map(p => p.location).join(', ')}\n\nReady for professional service? Contact us today!`
      },
      customer_spotlight: {
        title: `Customer Success Story - ${primaryService} in ${primaryLocation}`,
        description: `We love celebrating our amazing customers in ${primaryLocation}! This week's spotlight shows how professional ${primaryService.toLowerCase()} made a difference.\n\nOur commitment to ${primaryLocation} residents:\n• Quality ${primaryService.toLowerCase()}\n• Local expertise\n• Reliable service\n\nServing ${serviceLocationPairs.map(p => p.location).join(', ')} with the same dedication. Contact us for your ${primaryService.toLowerCase()} needs!`
      },
      seasonal: {
        title: `Seasonal ${primaryService} Services in ${primaryLocation}`,
        description: `${options.seasonalContext || 'This season'} is the perfect time for ${primaryService.toLowerCase()} in ${primaryLocation}!\n\nOur local team understands the seasonal needs of ${primaryLocation} residents. We're here to help with professional ${primaryService.toLowerCase()} services.\n\nServing these local communities:\n${serviceLocationPairs.map(p => `• ${p.location}`).join('\n')}\n\nSchedule your seasonal service today!`
      },
      local_event: {
        title: `${business.name} Supports Local ${primaryLocation} Community`,
        description: `We're proud to be part of the ${primaryLocation} community! As your local ${primaryService.toLowerCase()} experts, we believe in giving back to the neighborhoods we serve.\n\nCommunity involvement is important to us:\n• Supporting local events\n• Serving ${primaryLocation} families\n• Building lasting relationships\n\nFor professional ${primaryService.toLowerCase()} in ${serviceLocationPairs.map(p => p.location).join(', ')}, contact ${business.name} today!`
      }
    }
    
    const template = templates[options.contentType] || templates.business_updates
    
    return {
      title: template.title,
      description: template.description,
      hashtags: this.generateLocalHashtags(business, serviceLocationPairs),
      localKeywords,
      serviceLocationPairs
    }
  }

  // Get random seasonal context
  getSeasonalContext(): string {
    const month = new Date().getMonth()
    const seasonalContexts = {
      0: 'New Year preparation', 1: 'Winter maintenance', 2: 'Spring preparation',
      3: 'Spring cleaning', 4: 'Spring renovation', 5: 'Summer preparation',
      6: 'Summer maintenance', 7: 'Summer projects', 8: 'Back to school prep',
      9: 'Fall preparation', 10: 'Holiday preparation', 11: 'Year-end projects'
    }
    
    return seasonalContexts[month as keyof typeof seasonalContexts] || 'seasonal maintenance'
  }

  // Generate content with automatic service-location optimization
  async generateOptimizedContent(business: BusinessContext, contentType?: string): Promise<{
    title: string
    description: string
    hashtags: string[]
    localKeywords: string[]
    serviceLocationPairs: Array<{service: string, location: string}>
  }> {
    const options: ContentGenerationOptions = {
      contentType: (contentType as any) || 'business_updates',
      tone: 'professional',
      includeServices: true,
      includeLocations: true,
      focusLocalSEO: true,
      seasonalContext: this.getSeasonalContext()
    }
    
    return await this.generateLocalSEOContent(business, options)
  }
}

// Export singleton instance
export const localSEOContentGenerator = LocalSEOContentGenerator.getInstance()
