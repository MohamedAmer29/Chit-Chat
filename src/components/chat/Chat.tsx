import Emoji, { EmojiClickData } from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import useChatStore from "../context/chatStore";
import useUserStore from "../context/context";
import axios from "axios";

const Chat = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [chat, setChat] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [photo, setPhoto] = useState<boolean>(false);
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser, setOpenList, setOpenSettings } = useUserStore();

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  const cloudinary_url = import.meta.env.VITE_CLOUDINARY;
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e);
    //@ts-expect-error aaa
    if (e.target.files[0]) {
      setImg({
        //@ts-expect-error aaa
        file: e.target.files[0],
        //@ts-expect-error aaa
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, []);

  const handleEmoji = (e: EmojiClickData) => {
    setEmoji((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    setIsSubmitting(true);
    if (img.file) {
      const data = new FormData();

      data.append("file", img.file);
      data.append("upload_preset", "Chit-Chat");

      const response = await axios.post(cloudinary_url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImgUrl(response.data.url);
    }

    if (text === "") {
      setIsSubmitting(false);
      return;
    }
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          ...(imgUrl && { img: imgUrl }),
          createdAt: new Date(),
        }),
      });
      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();

          const chatIndex = userChatData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );

          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, { chats: userChatData.chats });
        }
      });
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
    setImg({
      file: null,
      url: "",
    });
    setText("");
    setIsSubmitting(false);
  };
  return (
    <div className="flex-2 max-md:w-11/12 overflow-clip border-x-1 border-solid border-gray-500  h-full flex flex-col ">
      {/* top */}
      <div className="p-5 max-md:w-11/12 max-md:p-2 flex items-center justify-between border-b-1 border-solid border-[#ddddd3]">
        <div className="flex items-center gap-5 max-md:gap-1">
          <div className="flex">
            <img
              src="./arrowUp.png"
              className="-rotate-90 cursor-pointer -translate-x-2 self-center bg-[rgba(17,25,40,0.3)] w-9 h-9 max-md:w-6 max-md:h-6 max-md:p-1 p-2 rounded-full"
              alt="back arrow icon"
              onClick={() => setOpenList(true)}
            />
            <img
              className="w-[60px] h-[60px] max-md:w-[35px] max-md:h-[35px] self-center rounded-full object-cover"
              src={user?.avatar || "./avatar.png"}
              alt="avatar icon"
            />
          </div>
          <div
            className="flex flex-col gap-1 cursor-pointer"
            onClick={() => setOpenSettings(true)}
          >
            <span className="text-sm md:text-lg font-semibold">
              {user?.username}
            </span>
            <p className="md:text-sm text-xs font-semibold text-gray-300">
              Lorem ipsum dolor sit
            </p>
          </div>
        </div>
        <div className="flex gap-2 ">
          <img
            className="w-6 h-6 max-md:w-4 max-md:h-4 self-center cursor-pointer"
            src="./phone.png"
            alt="phone icon"
          />
          <img
            className="w-6 h-6  max-md:w-4 max-md:h-4 self-center cursor-pointer"
            src="./video.png"
            alt="phone icon"
          />
          <img
            className="w-6 h-6  max-md:w-4 max-md:h-4 self-center cursor-pointer"
            src="./info.png"
            alt="phone icon"
          />
        </div>
      </div>
      {/* Center */}
      <div className="p-5 flex-1 overflow-y-scroll flex flex-col scroller gap-5">
        {/* message */}
        {chat?.messages?.map((message) => (
          <div
            key={message?.createdAt}
            className={
              message.senderId === currentUser?.id
                ? "self-end     flex flex-col gap-1"
                : "max-w-[70%]  flex flex-col gap-5 self-start "
            }
          >
            {message.img && (
              <img
                onClick={() => setPhoto((prev) => !prev)}
                className={`rounded-t-lg w-1/3 ${
                  message.senderId === currentUser?.id
                    ? "self-end"
                    : "self-start"
                }  object-cover  ${
                  photo
                    ? "absolute top-50 left-1/2 -translate-x-1/2 -translate-y-1/4 scale-150 w-1vw"
                    : ""
                }`}
                src={message.img}
                alt="Image"
              />
            )}
            <div
              className={`flex-1   flex  gap-3 ${
                message.senderId === currentUser?.id && "flex-col "
              }`}
            >
              {message.senderId !== currentUser?.id && (
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={user?.avatar || "./avatar.png"}
                  alt="avatar icon"
                />
              )}
              <p
                className={
                  message.senderId === currentUser?.id
                    ? "text-sm p-2 rounded-t-lg bg-blue-400 max-w-fit self-end"
                    : "text-sm self-start p-2 rounded-b-lg bg-[rgba(17,25,40,0.3)]"
                }
              >
                {message.text}
              </p>
              {/* <span className="text-xs">1 min ago</span> */}
            </div>
          </div>
        ))}

        {/* <div className="self-end     flex flex-col gap-1">
          <p className=" text-sm p-2 rounded-t-lg bg-blue-400">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. A, iure.
          </p>
          <span className="text-xs">1 min ago</span>
        </div> */}
        {img.url && (
          <img
            onClick={() => setPhoto((prev) => !prev)}
            className={`rounded-t-lg w-1/3  object-cover self-end ${
              photo
                ? "absolute top-50 left-1/2 -translate-x-1/2 -translate-y-1/4 scale-150 w-1vw"
                : ""
            }`}
            src={img.url}
            alt="Image"
          />
        )}
        <div ref={endRef}></div>
      </div>

      {/* Bottom */}
      <div className="p-5 max-md:p-2  mt-auto flex items-center max-md:gap-2 justify-around  gap-5 border-t-1 border-solid border-[#ddddd3] ">
        {/* Icons */}
        <div className="flex gap-3 max-md:gap-2">
          <label htmlFor="img">
            <img
              className="w-5 h-5 self-center max-sm:w-4 max-sm:h-4 cursor-pointer "
              src="./img.png"
              alt="image icon"
            />
          </label>
          <input
            type="file"
            id="img"
            className="hidden"
            onChange={handleFile}
          />
          <img
            className="w-5  h-5 self-center max-sm:w-4 max-sm:h-4 cursor-pointer "
            src="./camera.png"
            alt="camera icon"
          />
          <img
            className="w-5 h-5 self-center max-sm:w-4 max-sm:h-4 cursor-pointer "
            src="./mic.png"
            alt="microphone icon"
          />
        </div>

        <input
          type="text"
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onChange={(e) => setText(e.target.value)}
          value={text}
          className="border-0 max-md:w-11/12 outline-0 p-1 rounded-md flex-2 bg-[rgba(17,25,40,0.5)] text-white disabled:cursor-not-allowed"
          placeholder={`${
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't send a message!"
              : "Type a message..."
          }`}
        />

        {/* Emoji */}
        <div className="relative">
          <img
            onClick={() => setOpen((prev) => !prev)}
            className="w-5 h-5 self-center max-sm:w-4 max-sm:h-4 cursor-pointer"
            src="./emoji.png"
            alt="emoji icon"
          />
          {open && (
            <div className="absolute z-30 bottom-12 left-0">
              <Emoji onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button
          disabled={isSubmitting || isCurrentUserBlocked || isReceiverBlocked}
          onClick={handleSend}
          className="text-xs bg-[#5183fe] text-white p-2 px-4 rounded-lg font-semibold cursor-pointer
          disabled:bg-[#424c65c0]  disabled:cursor-not-allowed hover:shadow-sm shadow-white"
        >
          {!isSubmitting ? (
            "Send"
          ) : (
            <div className="flex gap-1 text-gray-300 font-bold text-xs">
              <div className="border-white border-solid border-4 box-border  border-b-transparent w-4 h-4 self-center animate-spin rounded-full "></div>
              <span>Sending...</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;
