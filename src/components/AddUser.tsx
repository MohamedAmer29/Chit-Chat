import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { db } from "./lib/firebase";
import useUserStore from "./context/context";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const handleSearch = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        //@ts-expect-error aaa
        setUser(querySnapShot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
      //@ts-expect-error aaa
      toast.error(error.message);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userChats");
    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
      console.log(newChatRef.id);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="p-7 bg-[rgba(17,25,48,0.69)]  rounded-lg absolute top-0 bottom-0 left-0 right-0 w-fit h-fit m-auto flex flex-col ">
      <form className="flex gap-5" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="p-2 w-1/2 rounded-lg border-0 outline-0 bg-gray-300 placeholder:text-gray-800 text-gray-950"
        />
        <button className="py-2 px-8 rounded-lg text-white bg-[#1a73e8] cursor-pointer">
          Search
        </button>
      </form>
      {user && (
        <div className="mt-9 flex items-center justify-center">
          <div className="flex items-center gap-5">
            <img
              className="w-9 h-9 object-cover rounded-full m-auto"
              //@ts-expect-error aaa
              src={user.avatar || "./avatar.png"}
              alt="avatar icon"
            />
            <h2 className="text-lg font-semibold">
              {user.username || "Mohamed Amer"}
            </h2>
            <button
              className="py-1 px-3 rounded-lg text-white bg-[#1a73e8] cursor-pointer"
              onClick={handleAdd}
            >
              Add User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
