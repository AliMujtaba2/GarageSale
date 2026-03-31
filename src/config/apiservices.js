export const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI0YzIzZTM5NC02YTcwLTRjODQtYTQ1MS03MmNkMmVjZmYxYTkiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc3NDk1MTI2OCwiZXhwIjoxNzkwNTAzMjY4fQ.DNhQHu_GKIhMQHbBgjzZLBBhvaxw_6AwaOWFmR0d6_M";
// API call to create meeting

export const createMeeting = async () => {
    try {
        const res = await fetch("https://api.videosdk.live/v2/rooms", {
            method: "POST",
            headers: {
                authorization: token,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ VideoSDK API Error:", res.status, errorText);
            return null;
        }

        const data = await res.json();
        return data.roomId;
    } catch (error) {
        console.log("❌ Error creating meeting:", error);
        return null;
    }
};

export const sendCallNotification = async ({
    recipientId,
    senderId,
    senderEmail,
    meetingId,
    callType,
}) => {
    try {
        await fetch(
            "https://garage-sale-notification-service.vercel.app/send-call-notification",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientId,
                    senderId,
                    senderEmail,
                    meetingId,
                    callType,
                }),
            }
        );

        console.log("📞 Call notification sent");
    } catch (error) {
        console.log("❌ Call notification error:", error);
    }
};

export const sendMessage = async ({
    recipientId,
    senderId,
    senderEmail,
    text,
    conversationId,
}) => {
    try {
        await fetch(
            "https://garage-sale-notification-service.vercel.app/send-notification",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientId,
                    senderId,
                    senderEmail,
                    text,
                    conversationId,
                }),
            }
        );

        console.log("✅ Message notification sent");
    } catch (error) {
        console.log("❌ Message notification error:", error);
    }
};
