import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from "../api"; 
const VideoRoom = () => {
  let { roomID } = useParams();

  const myMeeting = async (element) => {
    const appID = 1575001866;
    const serverSecret = "78153da3d4f2430523e1b27028c182be";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      Date.now().toString(), // unique user ID, use user._id ideally
      "username"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      sharedLinks: [], // no need to share links manually now
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
    });
  };

  return <div ref={myMeeting} style={{ height: '100vh', width: '100vw' }} />;
};


export default VideoRoom;

