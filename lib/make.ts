type MakeEvent = {
  event: string;
  data: unknown;
  timestamp: string;
};

export async function sendToMake(event: string, data: unknown) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("MAKE_WEBHOOK_URL is not configured.");

    return {
      success: false,
      skipped: true,
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      } satisfies MakeEvent),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Make webhook failed: ${response.status} ${response.statusText}`
      );

      return {
        success: false,
        status: response.status,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Make webhook error:", error);

    return {
      success: false,
    };
  }
}