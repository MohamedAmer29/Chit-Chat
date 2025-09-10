import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Details from "./components/details/Details";
import List from "./components/list/List";
import Login from "./components/Login";
import Notification from "./components/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/lib/firebase";
import useUserStore from "./components/context/context";
import useChatStore from "./components/context/chatStore";

const App = () => {
  const {
    //@ts-expect-error zustand
    currentUser,
    //@ts-expect-error zustand
    openList,
    //@ts-expect-error zustand
    isLoading,
    //@ts-expect-error zustand
    fetchUserInfo,
    //@ts-expect-error zustand
    openSettings,
    //@ts-expect-error zustand
    setOpenSettings,
  } = useUserStore();
  //@ts-expect-error zustand
  const { chatId } = useChatStore();
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      await fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo, openList]);

  useEffect(() => {
    addEventListener("resize", () => {
      if (window.innerWidth <= 600) {
        return setOpenSettings(false);
      }
      setOpenSettings(true);
    });
  }, [window.innerWidth]);

  if (isLoading)
    return (
      <div className="p-9 text-3xl rounded-lg bg-[rgba(17,25,40,0.9)] ">
        Loading....
      </div>
    );
  return (
    <div className="w-[80vw] h-[90vh] bg-blue-900/75 rounded-lg text-white  backdrop-blur-sm border-3 border-[rgba(255,255,255,0.125)] flex  border-solid">
      {currentUser ? (
        <>
          {openList && <List />}
          {chatId && !openList && <Chat />}
          {chatId && openSettings && <Details />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
