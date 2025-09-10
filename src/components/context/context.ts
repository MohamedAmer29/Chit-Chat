import { create } from "zustand";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const useUserStore = create((set) => ({
  openList: true,
  openSettings: false,
  currentUser: null,
  isLoading: true,
  setOpenList: (open: boolean) => set(() => ({ openList: open })),
  setOpenSettings: (open: boolean) => set(() => ({ openSettings: open })),
  fetchUserInfo: async (uid: string) => {
    if (!uid) return set({ currentUser: null, isLoading: false });
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.log(error);
      return set({ currentUser: null, isLoading: false, openList: true });
    }
  },
}));

export default useUserStore;
