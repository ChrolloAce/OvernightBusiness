# 🚀 Bulk SEO Scheduling Guide

## Quick Start

Your bulk scheduling feature is now live! Here are 3 ways to use it:

### 1. **Scheduler Page Button** (Easiest)
- Go to `/scheduler` 
- Click the blue **"Bulk Schedule"** button ⚡
- Fill out the form and generate posts instantly

### 2. **API Direct Call** (For Power Users)
```bash
curl -X POST https://overnight-business.vercel.app/api/bulk-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfileId": "your-profile-id",
    "businessName": "Your Business Name",
    "postCount": 10,
    "startDate": "2024-01-24",
    "frequency": "daily",
    "customTopics": "Winter specials, New year promotions",
    "postType": "update"
  }'
```

### 3. **Component Usage** (For Developers)
```jsx
import { BulkScheduler } from '@/components/bulk-scheduler'

<BulkScheduler selectedProfile={yourProfile} />
```

## ⚡ Features

- **1-30 posts** generated instantly
- **SEO-optimized** content with hashtags
- **Random scheduling** during business hours (9 AM - 5 PM)
- **Multiple frequencies**: Daily, Every 2 Days, Weekly
- **Custom topics** or auto-generated content
- **Automatic hashtags** with business name
- **Server-side posting** - works even when browser closed!

## 📝 SEO Content Examples

The system generates content like:
- `🌟 Special offers at YourBusiness! We're committed to excellence. #YourBusiness #LocalBusiness #Quality`
- `💼 Customer success stories from YourBusiness. Proudly serving with professional service! #Professional #YourBusiness`
- `🎯 Why choose YourBusiness for your needs. Trust us for reliable service! #LocallyOwned #Trusted #YourBusiness`

## 🗓️ Scheduling Logic

- **Daily**: Posts every day starting from your chosen date
- **Every 2 Days**: Posts every other day  
- **Weekly**: Posts once per week on the same day

Each post gets a **random time between 9 AM - 5 PM** for optimal engagement!

## 💡 Pro Tips for SEO

1. **Use 10-15 posts** for consistent presence
2. **Start tomorrow** to begin posting immediately
3. **Mix custom topics** with auto-generated ones
4. **Daily frequency** works best for SEO
5. **Check your scheduler** to see all scheduled posts

## ✅ What Happens Next

1. Posts are **saved to your scheduler**
2. **Server cron job** (every 5 minutes) picks them up
3. **Automatic posting** to Google Business Profile
4. **SEO benefits** from consistent posting

Perfect for building your local SEO presence! 🎯 