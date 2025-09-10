import { useEffect, useState } from "react";
import AddUser from "../AddUser";
import useUserStore from "../context/context";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import useChatStore from "../context/chatStore";

const ChatList = () => {
  const [add, setAdd] = useState<boolean>(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  //@ts-expect-error zustand
  const { currentUser, setOpenList } = useUserStore();
  //@ts-expect-error zustand
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        //@ts-expect-error zustand
        const items = res.data().chats;
        //@ts-expect-error zustand
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        //@ts-expect-error aaa
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);
  //@ts-expect-error zustand
  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      //@ts-expect-error zustand
      // eslint-disable-next-line
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userChats", currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
      setOpenList(false);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    //@ts-expect-error zustand
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );
  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]-8 scroller ">
      <div className="flex items-center gap-3 p-5 ">
        <div className="flex-1 flex gap-3  p-1 items-center rounded-lg bg-[rgba(17,25,40,0.5)]">
          <img
            className="w-6 max-md:w-4"
            src="./search.png"
            alt="search icon"
          />
          <input
            className=" bg-transparent border-none flex-1 outline-0 text-white placeholder:text-gray-300"
            type="text"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search"
          />
        </div>
        <img
          className="w-[32px] cursor-pointer bg-[rgba(17,25,40,0.5)] rounded-lg p-2"
          onClick={() => setAdd((prev) => !prev)}
          src={!add ? "./plus.png" : "./minus.png"}
          alt="plus icon"
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          onClick={() => handleSelect(chat)}
          //@ts-expect-error zustand
          key={chat.chatId}
          className={`flex items-center  gap-5 max-md:gap-3 p-4 cursor-pointer border-1 border-solid border-gray-500 ${
            //@ts-expect-error zustand
            !chat?.isSeen && "bg-blue-500"
          }`}
        >
          <img
            className="w-13 h-13 max-md:w-10 max-md:h-10 rounded-full object-cover"
            src={
              //@ts-expect-error zustand
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : //@ts-expect-error zustand
                  chat.user.avatar
            }
            alt="avatar icon"
          />
          <div className="flex flex-col gap-2">
            <span className="text-lg max-md:text-sm font-semibold">
              {
                //@ts-expect-error zustand
                chat.user.blocked.includes(currentUser.id)
                  ? "User"
                  : //@ts-expect-error zustand
                    chat.user.username
              }
            </span>
            <p className="text-sm max-md:text-xs">
              {
                //@ts-expect-error zustand
                chat.user.blocked.includes(currentUser.id)
                  ? ""
                  : //@ts-expect-error zustand
                    chat.lastMessage
              }
            </p>
          </div>
        </div>
      ))}
      {add && <AddUser />}
    </div>
  );
};

export default ChatList;
