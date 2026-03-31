import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    RTCView,
    MediaStream,
} from "@videosdk.live/react-native-sdk";
import { token } from "../config/apiservices";
import { db, auth } from "../../firebase";

function ParticipantView({ participantId, callType, currentUserEmail, recipientEmail }) {
    const { webcamStream, webcamOn, dicOn, isLocal } = useParticipant(participantId);
    
    // Determine which email to display
    const displayEmail = isLocal ? currentUserEmail : recipientEmail;

    // When video is on for the participant
    if (callType === "video" && webcamOn && webcamStream) {
        return (
            <View style={styles.participantView}>
                <RTCView
                    streamURL={new MediaStream([webcamStream.track]).toURL()}
                    objectFit={"cover"}
                    style={styles.rtcView}
                />
                <View style={styles.participantLabel}>
                    <Text style={styles.participantLabelText}>
                        {displayEmail || (isLocal ? "You" : "Remote")}
                    </Text>
                </View>
            </View>
        );
    }

    // Voice call or missing video
    return (
        <View style={styles.participantViewFallback}>
            <Text style={styles.participantAvatar}>
                {isLocal ? "🧑" : "👤"}
            </Text>
            <Text style={styles.participantText}>
                {displayEmail || (isLocal ? "You" : "User")}
            </Text>
        </View>
    );
}

function MeetingView({ callType, recipientEmail, meetingId }) {
    const navigation = useNavigation();
    const [isJoined, setJoined] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const currentUserEmail = auth.currentUser?.email || 'You';

    const { join, leave, participants, toggleMic, toggleWebcam, changeWebcam } = useMeeting({
        onMeetingJoined: () => {
            setJoined(true);
            console.log("✅ User joined the meeting");
        },
        onMeetingLeft: () => {
            console.log("👋 User left the meeting");
            endCallAndNavigateBack();
        },
        onParticipantLeft: (participantId) => {
            console.log("❌ Participant left:", participantId);
            // When remote participant leaves, end the call for current user
            setTimeout(() => {
                if (navigation.canGoBack()) {
                    leave();
                    endCallAndNavigateBack();
                }
            }, 500);
        },
        onError: (error) => {
            console.log("❌ Meeting Error:", error);
            alert("Error joining call: " + error.message);
            endCallAndNavigateBack();
        },
    });

    const endCallAndNavigateBack = () => {
        navigation.goBack();
    };

    const participantsArrId = [...participants.keys()];
    const isCallActive = participantsArrId.length > 1;

    useEffect(() => {
        // Automatically join the meeting on load
        join();
        return () => {
            leave();
        };
    }, []);

    useEffect(() => {
        let timerId;
        if (isCallActive) {
            timerId = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [isCallActive]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {callType === "video" ? "Video Call" : "Voice Call"}
                </Text>
                {!isCallActive ? (
                    <Text style={styles.headerSubtitle}>
                        {!isJoined ? `Connecting to ${recipientEmail}` : "Waiting to join..."}
                    </Text>
                ) : (
                    <Text style={styles.headerSubtitle}>{formatTime(callDuration)}</Text>
                )}
            </View>

            {/* Grid of Participants */}
            <View style={styles.gridContainer}>
                {participantsArrId.map((participantId) => (
                    <ParticipantView
                        key={participantId}
                        participantId={participantId}
                        callType={callType}
                        currentUserEmail={currentUserEmail}
                        recipientEmail={recipientEmail}
                    />
                ))}
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => toggleMic()}
                >
                    <Text style={styles.controlText}>Mic</Text>
                </TouchableOpacity>

                {callType === "video" && (
                    <>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => toggleWebcam()}
                        >
                            <Text style={styles.controlText}>Video</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => changeWebcam()}
                        >
                            <Text style={styles.controlText}>Flip Cam</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={() => {
                        leave();
                        endCallAndNavigateBack();
                    }}
                >
                    <Text style={[styles.controlText, { color: "#fff" }]}>End Call</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export const CallScreen = ({ route }) => {
    const { meetingId, callType, recipientEmail } = route.params;

    return (
        <MeetingProvider
            config={{
                meetingId,
                micEnabled: true,
                webcamEnabled: callType === "video",
                name: "GarageSale User",
            }}
            token={token}
        >
            <MeetingView callType={callType} recipientEmail={recipientEmail} meetingId={meetingId} />
        </MeetingProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
    },
    loadingText: {
        color: "#ffffff",
        marginTop: 20,
        fontSize: 16,
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#222",
        alignItems: "center",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "#ccc",
        fontSize: 14,
        marginTop: 5,
    },
    gridContainer: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
    },
    participantView: {
        flex: 1,
        minWidth: "48%",
        minHeight: "48%",
        margin: 2,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#333",
        position: "relative",
    },
    rtcView: {
        flex: 1,
    },
    participantLabel: {
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    participantLabelText: {
        color: "#fff",
        fontSize: 5,
    },
    participantViewFallback: {
        flex: 1,
        minWidth: "48%",
        minHeight: "48%",
        margin: 2,
        borderRadius: 10,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
    },
    participantAvatar: {
        fontSize: 50,
    },
    participantText: {
        color: "#fff",
        marginTop: 10,
        fontSize: 16,
    },
    controlsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#222",
    },
    controlButton: {
        backgroundColor: "#444",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    controlText: {
        color: "#fff",
        fontSize: 16,
    },
    endCallButton: {
        backgroundColor: "#ff4444",
        paddingHorizontal: 30,
    },
});
