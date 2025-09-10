import { create } from "zustand";
import useUserStore from "./context";

const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    if (user.blocked.includes(currentUser.id)) {
      return set({
        isCurrentUserBlocked: true,
        chatId,
        user: null,
        isReceiverBlocked: false,
      });
    } else if (currentUser.blocked.includes(user.id)) {
      return set({
        isCurrentUserBlocked: false,
        chatId,
        user: user,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        isCurrentUserBlocked: false,
        chatId,
        user,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));

export default useChatStore;
