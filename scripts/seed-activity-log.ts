import { prisma } from "../src/lib/prisma";

const SAMPLE_ACTIVITIES = [
  {
    category: "PRICE_UPDATE",
    operation: "Bitcoin Price Fetch",
    message: "Successfully fetched BTC price: $68,234.12",
    status: "SUCCESS",
    details: {
      price: 68234.12,
      currency: "USD",
      source: "CoinGecko API",
    },
  },
  {
    category: "PREDICTION",
    operation: "Price Prediction - BTC",
    message: "AI model predicts BTC to reach $70,000 in 24h",
    status: "SUCCESS",
    details: {
      currentPrice: 68234.12,
      predictedPrice: 70000,
      confidence: 0.78,
      timeframe: "24h",
    },
  },
  {
    category: "API_CALL",
    operation: "External API Request",
    message: "CoinGecko API rate limit: 45/50 requests",
    status: "IN_PROGRESS",
    details: {
      endpoint: "/simple/price",
      rateLimitRemaining: 45,
      rateLimitTotal: 50,
    },
  },
  {
    category: "PRICE_UPDATE",
    operation: "Ethereum Price Fetch",
    message: "Failed to fetch ETH price - timeout",
    status: "ERROR",
    details: {
      error: "Request timeout after 5000ms",
      retryAttempt: 3,
      maxRetries: 3,
    },
  },
  {
    category: "PREDICTION",
    operation: "Market Analysis",
    message: "Analyzing market trends for top 10 coins",
    status: "IN_PROGRESS",
    details: {
      coinsProcessed: 7,
      coinsTotal: 10,
      estimatedTimeRemaining: "30s",
    },
  },
  {
    category: "API_CALL",
    operation: "Cache Miss - BTC Price",
    message: "Cache miss, fetching fresh data from API",
    status: "SUCCESS",
    details: {
      cacheKey: "btc_price_usd",
      ttl: 300,
      lastUpdate: new Date(Date.now() - 360000).toISOString(),
    },
  },
  {
    category: "PRICE_UPDATE",
    operation: "Solana Price Update",
    message: "SOL price updated: $152.34 (+3.2%)",
    status: "SUCCESS",
    details: {
      price: 152.34,
      change24h: 3.2,
      volume24h: 2456789012,
    },
  },
  {
    category: "PREDICTION",
    operation: "Sentiment Analysis",
    message: "Analyzing social sentiment for BTC",
    status: "SUCCESS",
    details: {
      sentimentScore: 0.65,
      positiveRatio: 0.72,
      totalMentions: 15234,
      trendingUp: true,
    },
  },
];

async function seed() {
  console.log("Seeding activity log data...");

  // Create activities with staggered timestamps
  for (let i = 0; i < SAMPLE_ACTIVITIES.length; i++) {
    const activity = SAMPLE_ACTIVITIES[i];
    const timestamp = new Date(Date.now() - i * 300000); // 5 minutes apart

    await prisma.activityLog.create({
      data: {
        ...activity,
        timestamp,
      },
    });

    console.log(`Created activity: ${activity.operation}`);
  }

  // Create some additional random activities
  const categories = ["PRICE_UPDATE", "PREDICTION", "API_CALL", "SYSTEM"];
  const statuses = ["SUCCESS", "ERROR", "IN_PROGRESS"];

  for (let i = 0; i < 20; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const timestamp = new Date(Date.now() - Math.random() * 86400000 * 2); // Random within last 2 days

    await prisma.activityLog.create({
      data: {
        category,
        operation: `Random ${category} Operation #${i + 1}`,
        message: `This is a random ${status.toLowerCase()} activity for testing`,
        status,
        timestamp,
        details: {
          randomValue: Math.random(),
          testId: i + 1,
        },
      },
    });
  }

  console.log("✅ Activity log seeding complete!");
  console.log(`Total activities created: ${SAMPLE_ACTIVITIES.length + 20}`);
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
