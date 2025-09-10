import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import useChatStore from "../context/chatStore";
import useUserStore from "../context/context";
import { auth, db } from "../lib/firebase";
import { useState } from "react";

const Details = () => {
  const {
    //@ts-expect-error zustand
    user,
    //@ts-expect-error zustand
    isCurrentUserBlocked,
    //@ts-expect-error zustand
    isReceiverBlocked,
    //@ts-expect-error zustand
    changeBlock,
  } = useChatStore();
  //@ts-expect-error zustand
  const { currentUser, setOpenSettings } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleBlock = async () => {
    setIsSubmitting(true);
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      console.log(err);
    }
  };
  return (
    <div className="flex-2">
      {/* user */}

      <div className="py-7 px-5 flex flex-col items-center gap-3 border-b-1 border solid border-[#ddddd3] relative">
        <img
          src="./arrowUp.png"
          className="-rotate-90 cursor-pointer -translate-x-2 self-center bg-[rgba(17,25,40,0.3)] w-10 h-10 max-md:w-6 max-md:h-6 max-md:p-1 p-2 rounded-full absolute left-6 top-4"
          alt="back arrow icon"
          onClick={() => setOpenSettings(false)}
        />
        <img
          className="w-20 h-20 object-cover rounded-full"
          src={user?.avatar || "./avatar.png"}
          alt="avatar icon"
        />
        <h2 className="text-2xl font-bold">{user?.username}</h2>
        <p className="text-sm font-semibold">Lorem ipsum dolor sit.</p>
      </div>
      {/* Info */}
      <div className="p-5 flex flex-col gap-4">
        {/* option */}
        <div>
          {/* title */}
          <div className="flex items-center justify-between">
            <span>Chat Settings</span>
            <img
              className="w-7 h-7 bg-[rgba(17,25,40,0.3)] p-2 rounded-full cursor-pointer"
              src="./arrowUp.png"
              alt="arrow icon"
            />
          </div>
        </div>
        {/* option */}
        <div>
          {/* title */}
          <div className="flex items-center justify-between">
            <span>Privacy & Help</span>
            <img
              src="./arrowUp.png"
              className="w-7 h-7 bg-[rgba(17,25,40,0.3)] p-2 rounded-full cursor-pointer"
              alt="arrow icon"
            />
          </div>
        </div>
        {/* option */}
        <div className="flex flex-col gap-5">
          {/* title */}
          <div className="flex items-center justify-between">
            <span>Shared Photos</span>
            <img
              src="./arrowDown.png"
              className="w-7 h-7 bg-[rgba(17,25,40,0.3)] p-2 rounded-full cursor-pointer"
              alt="arrow icon"
            />
          </div>
        </div>
        {/* Photos */}
        <div className="flex flex-col gap-5 mt-5">
          {/* Photo item */}
          <div className="flex items-center justify-between">
            {/* Photo details */}
            <div className="flex gap-5 items-center">
              <img
                className="w-9 h-9 rounded-sm object-cover"
                src="./bg.jpg"
                alt="image"
              />
              <span className="text-sm text-gray-300 font-medium">
                Photo_2024_2.png
              </span>
            </div>
            <img
              className="w-8 p-2 rounded-full cursor-pointer bg-[rgba(17,25,48,0.3)]"
              src="./download.png"
              alt="download icon"
            />
          </div>
        </div>
        {/* option */}
        <div>
          {/* title */}
          <div className="flex items-center justify-between">
            <span>Shared Files</span>
            <img
              className="w-7 h-7 bg-[rgba(17,25,40,0.3)] p-2 rounded-full cursor-pointer"
              src="./arrowUp.png"
              alt="arrow icon"
            />
          </div>
        </div>
        <button
          className={`py-2 px-5  text-white border-0 font-semibold rounded-sm cursor-pointer  disabled:cursor-not-allowed ${
            isCurrentUserBlocked || isReceiverBlocked
              ? "bg-red-300"
              : "bg-red-800 hover:bg-red-900"
          }`}
          onClick={handleBlock}
          disabled={isSubmitting || isCurrentUserBlocked || isReceiverBlocked}
        >
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User Blocked"
            : "Block User"}
        </button>
        <button
          className="p-2  bg-[#1a73e8] text-white border-0 font-semibold rounded-sm cursor-pointer hover:bg-[#649ae1f0]"
          onClick={() => auth.signOut()}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Details;
