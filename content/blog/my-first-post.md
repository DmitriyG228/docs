---
title: 'My First Blog Post'
date: '2024-07-26'
author: 'Dima'
slug: 'my-first-post'
summary: 'This is the beginning of a beautiful blog.'
---

# Announcing Vexa v0.2: Open-Source Real-Time Google Meet Transcription via API!

We're excited to announce the release of **Vexa v0.2**, a significant step forward in our mission to provide developers with powerful, **open-source (Apache 2.0 licensed)** real-time transcription capabilities.

**What's New in v0.2?**

The highlight of this release is the **programmatic access to Google Meet transcription**. You can now:

1.  **Send a Vexa Bot to Google Meet:** Use a simple API call to have our bot join any Google Meet session.
2.  **Access Real-Time Transcripts:** Retrieve live, multilingual transcriptions (supporting 99 languages via Whisper) directly through the API as the meeting happens.

This provides a seamless way to integrate automated, real-time transcription directly into your **open source or commercial** applications, workflows, or AI agents.

**API Example:**

**Create a meeting bot:**
```bash
# POST /bots
curl -X POST https://gateway.dev.vexa.ai/bots \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_CLIENT_API_KEY" \
  -d '{
    "meeting_url": "https://meet.google.com/xxx-xxxx-xxx",
    "platform": "google_meet"
  }'
```

**Retrieve meeting transcript:**
```bash
# GET /transcripts/{platform}/{native_meeting_id}
curl -H "X-API-Key: YOUR_CLIENT_API_KEY" \
  https://gateway.dev.vexa.ai/transcripts/google_meet/xxx-xxxx-xxx
```
*(See full API details and response format in our [API Documentation](https://api.dev.vexa.ai/docs) - link TBC)*

**Building an Open Foundation:**

This release isn't just about the Google Meet bot; it establishes the foundation of our **scalable, open-source microservices architecture**. This design ensures reliability and performance, paving the way for future support for platforms like Zoom and Microsoft Teams, direct audio streaming, and advanced features like real-time LLM processing and knowledge extraction (RAG).

Vexa aims to be an **open-source**, enterprise-grade alternative to recall.ai, built with secure corporate environments in mind where data security, transparency, and compliance are crucial. While this specific API endpoint is currently cloud-based for the beta, **self-deployment of the entire open-source stack** remains a core part of our long-term vision.

**Closed Beta Access:**

Vexa's API is currently in **closed beta**. We invite developers and teams to apply for free beta access to help us test, refine, and shape the future of Vexa.

➡️ **Apply for your Free Beta API Key:** [https://api.dev.vexa.ai/pricing](https://api.dev.vexa.ai/pricing)

**What's Next?**

*   Microsoft Teams Bot Integration (April 2025)
*   Zoom Bot Integration (May 2025)
*   Direct Audio Streaming API
*   Speaker Identification
*   Real-time LLM Processing & Translation
*   Meeting Knowledge Extraction (RAG)

**Get Involved with Open Source Vexa:**

Vexa is built **openly** with the community. Check out our roadmap, join the discussion, and consider contributing to the core **open-source project**:

*   [Project Tasks Board](link-to-roadmap)
*   [Discord Community](link-to-discord)
*   [GitHub Repository (Open Source)](https://github.com/Vexa-ai/vexa) (Explore contributing guidelines)

We're thrilled to reach this milestone and empower developers with direct access to real-time meeting intelligence built on an **open-source core**. Apply for the beta and let us know what you build!

---
**Project Links:**
*   🌐 [Vexa Website](link-to-website)
*   💼 [LinkedIn](link-to-linkedin)
*   🐦 [X (@grankin_d)](https://twitter.com/grankin_d)
*   💬 [Discord Community](link-to-discord)
*   📜 **[License (Apache 2.0)](link-to-license)**
*   🐙 **[GitHub Repository (Open Source)](https://github.com/Vexa-ai/vexa)** 